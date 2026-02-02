import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import { HttpError, InternalServerError } from "../../error";
import { TokenService } from "../../service/tokenService";
import logger from "../../utility/logger";

jest.mock("jsonwebtoken");
jest.mock("uuid");
jest.mock("bcrypt");

jest.mock("../../config/envConfigs", () => ({
  __esModule: true,
  default: {
    jwtSecretAccess: "test-secret",
  },
}));

jest.mock("../../utility/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

const mockCache = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
};

const TEST_REFRESH_PAYLOAD = {
  id: 1,
  username: "test@test.com",
  role: "student",
  avatar: "img.png",
  remember: false,
};

function getStatus(err: any) {
  return err?.statusCode ?? err?.status;
}
function getMessage(err: any) {
  return (
    err?.message ??
    err?.payload?.message ??
    err?.body?.message ??
    err?.details?.message
  );
}

describe("TokenService (new)", () => {
  let tokenService: TokenService;

  beforeEach(() => {
    jest.clearAllMocks();
    (uuidv4 as jest.Mock).mockReturnValue("uuid-token");
    tokenService = new TokenService({ cacheService: mockCache as any });
  });

  describe("generateTokens", () => {
    it("returns access+refresh tokens and stores refresh in cache with short TTL when remember=false", async () => {
      (jwt.sign as jest.Mock).mockReturnValue("access.jwt");
      mockCache.set.mockResolvedValue(undefined);

      const result = await tokenService.generateTokens(
        1,
        "test@test.com",
        "student",
        "img.png",
        false
      );

      expect(result).toEqual({
        accessToken: "access.jwt",
        refreshToken: "uuid-token",
      });

      // short TTL = 1 day (24h)
      expect(mockCache.set).toHaveBeenCalledWith(
        "refresh:uuid-token",
        TEST_REFRESH_PAYLOAD,
        24 * 60 * 60
      );
    });

    it("stores refresh with long TTL when remember=true", async () => {
      (jwt.sign as jest.Mock).mockReturnValue("access.jwt");
      mockCache.set.mockResolvedValue(undefined);

      await tokenService.generateTokens(
        1,
        "test@test.com",
        "student",
        "img.png",
        true
      );

      expect(mockCache.set).toHaveBeenCalledWith(
        "refresh:uuid-token",
        { ...TEST_REFRESH_PAYLOAD, remember: true },
        7 * 24 * 60 * 60
      );
    });

    it("still returns tokens if cache.set fails (non-fatal) and logs warn", async () => {
      (jwt.sign as jest.Mock).mockReturnValue("access.jwt");
      mockCache.set.mockRejectedValue(new Error("redis down"));

      const result = await tokenService.generateTokens(
        1,
        "test@test.com",
        "student",
        "img.png",
        false
      );

      expect(result).toEqual({
        accessToken: "access.jwt",
        refreshToken: "uuid-token",
      });

      expect(logger.warn).toHaveBeenCalledTimes(1);
      expect(String((logger.warn as any).mock.calls[0][0])).toContain(
        "[TokenService] saveRefreshToken failed (non-fatal):"
      );
    });

    it("wraps unknown error into HttpError 500 (if jwt.sign throws, for example)", async () => {
      (jwt.sign as jest.Mock).mockImplementation(() => {
        throw new Error("jwt broke");
      });

      await expect(
        tokenService.generateTokens(1, "u", "r", "a", false)
      ).rejects.toBeInstanceOf(HttpError);

      try {
        await tokenService.generateTokens(1, "u", "r", "a", false);
      } catch (err: any) {
        expect(getStatus(err)).toBe(500);
        expect(String(getMessage(err))).toContain("Internal server error");
        expect(logger.error).toHaveBeenCalled();
      }
    });
  });

  describe("validateRefreshToken", () => {
    it("returns payload when refresh exists", async () => {
      mockCache.get.mockResolvedValue(TEST_REFRESH_PAYLOAD);

      const result = await tokenService.validateRefreshToken("uuid-token");

      expect(result).toEqual(TEST_REFRESH_PAYLOAD);
      expect(mockCache.get).toHaveBeenCalledWith("refresh:uuid-token");
    });

    it("throws HttpError 401 when refresh token missing", async () => {
      mockCache.get.mockResolvedValue(null);

      await expect(
        tokenService.validateRefreshToken("missing")
      ).rejects.toBeInstanceOf(HttpError);

      try {
        await tokenService.validateRefreshToken("missing");
      } catch (err: any) {
        expect(getStatus(err)).toBe(401);
        expect(String(getMessage(err))).toContain("Invalid refresh token");
      }
    });

    it("converts unknown cache errors into HttpError 401", async () => {
      mockCache.get.mockRejectedValue(new Error("redis down"));

      await expect(
        tokenService.validateRefreshToken("uuid-token")
      ).rejects.toBeInstanceOf(HttpError);

      try {
        await tokenService.validateRefreshToken("uuid-token");
      } catch (err: any) {
        expect(getStatus(err)).toBe(401);
        expect(String(getMessage(err))).toContain("Invalid refresh token");
        expect(logger.error).toHaveBeenCalled();
      }
    });
  });

  describe("isRefreshTokenValid", () => {
    it("returns true if token validates", async () => {
      mockCache.get.mockResolvedValue(TEST_REFRESH_PAYLOAD);

      await expect(
        tokenService.isRefreshTokenValid("uuid-token")
      ).resolves.toBe(true);
    });

    it("returns false if token is invalid (401)", async () => {
      mockCache.get.mockResolvedValue(null);

      await expect(tokenService.isRefreshTokenValid("dead")).resolves.toBe(
        false
      );
    });

    it("rethrows non-401 HttpError", async () => {
      const err = new InternalServerError({
        statusCode: 500,
        message: "boom",
      } as any);
      mockCache.get.mockRejectedValue(err);

      await expect(
        tokenService.isRefreshTokenValid("uuid-token")
      ).rejects.toBeInstanceOf(HttpError);
    });
  });

  describe("rotateRefreshToken", () => {
    it("deletes old refresh token, returns new access+refresh, and saves new refresh", async () => {
      mockCache.get.mockResolvedValue(TEST_REFRESH_PAYLOAD);
      (jwt.sign as jest.Mock).mockReturnValue("new-access.jwt");
      mockCache.delete.mockResolvedValue(undefined);
      mockCache.set.mockResolvedValue(undefined);

      const result = await tokenService.rotateRefreshToken("uuid-old");

      expect(mockCache.delete).toHaveBeenCalledWith("refresh:uuid-old");

      expect(result).toEqual({
        accessToken: "new-access.jwt",
        refreshToken: "uuid-token",
        role: "student",
        username: "test@test.com",
        avatar: "img.png",
        id: 1,
      });

      // should save new refresh with same payload & correct ttl
      expect(mockCache.set).toHaveBeenCalledWith(
        "refresh:uuid-token",
        TEST_REFRESH_PAYLOAD,
        24 * 60 * 60
      );
    });

    it("throws HttpError 401 when old refresh is invalid", async () => {
      mockCache.get.mockResolvedValue(null);

      await expect(
        tokenService.rotateRefreshToken("uuid-old")
      ).rejects.toBeInstanceOf(HttpError);

      try {
        await tokenService.rotateRefreshToken("uuid-old");
      } catch (err: any) {
        expect(getStatus(err)).toBe(401);
        expect(String(getMessage(err))).toContain("Invalid refresh token");
      }
    });

    it("wraps unknown errors into HttpError 500", async () => {
      mockCache.get.mockResolvedValue(TEST_REFRESH_PAYLOAD);
      mockCache.delete.mockRejectedValue(new Error("redis down"));

      await expect(
        tokenService.rotateRefreshToken("uuid-old")
      ).rejects.toBeInstanceOf(HttpError);

      try {
        await tokenService.rotateRefreshToken("uuid-old");
      } catch (err: any) {
        expect(getStatus(err)).toBe(500);
        expect(String(getMessage(err))).toContain("Internal server error");
        expect(logger.error).toHaveBeenCalled();
      }
    });
  });

  describe("logoutToken", () => {
    it("returns true and deletes refresh key", async () => {
      mockCache.delete.mockResolvedValue(undefined);

      const result = await tokenService.logoutToken("uuid-token");

      expect(result).toBe(true);
      expect(mockCache.delete).toHaveBeenCalledWith("refresh:uuid-token");
    });

    it("still returns true even if delete fails", async () => {
      mockCache.delete.mockRejectedValue(new Error("redis down"));

      const result = await tokenService.logoutToken("uuid-token");
      expect(result).toBe(true);
    });
  });

  describe("createEmailCode", () => {
    it("returns alreadySent=true when a code already exists", async () => {
      mockCache.get.mockResolvedValue({
        codeHash: "hash",
        passwordHash: "pass",
        role: "student",
        attempts: 0,
        createdAt: Date.now(),
      });

      const res = await tokenService.createEmailCode(
        "test@test.com",
        "hash123",
        "student"
      );

      expect(res).toEqual({ alreadySent: true });
      expect(mockCache.set).not.toHaveBeenCalled();
    });

    it("creates a new email code, hashes it, stores cache, returns code", async () => {
      // no existing record
      mockCache.get.mockResolvedValue(null);

      // deterministic OTP: spy Math.random so generateOtp is predictable
      jest.spyOn(Math, "random").mockReturnValue(0); // -> 100000
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-code");

      const res = await tokenService.createEmailCode(
        "test@test.com",
        "hash123",
        "student"
      );

      expect(res.alreadySent).toBe(false);
      expect(res.code).toBe("100000");

      expect(bcrypt.hash).toHaveBeenCalledWith("100000", 10);

      expect(mockCache.set).toHaveBeenCalledWith(
        "verify:email:test@test.com",
        expect.objectContaining({
          codeHash: "hashed-code",
          passwordHash: "hash123",
          role: "student",
          attempts: 0,
          createdAt: expect.any(Number),
        }),
        15 * 60
      );

      (Math.random as any).mockRestore?.();
    });

    it("throws HttpError 500 when something fails", async () => {
      mockCache.get.mockRejectedValue(new Error("redis down"));

      await expect(
        tokenService.createEmailCode("test@test.com", "hash123", "student")
      ).rejects.toBeInstanceOf(HttpError);

      try {
        await tokenService.createEmailCode(
          "test@test.com",
          "hash123",
          "student"
        );
      } catch (err: any) {
        expect(getStatus(err)).toBe(500);
        expect(String(getMessage(err))).toContain("Internal server error");
        expect(logger.error).toHaveBeenCalled();
      }
    });
  });

  describe("verifyEmailCode", () => {
    it("throws 400 if verification code expired or missing", async () => {
      mockCache.get.mockResolvedValue(null);

      await expect(
        tokenService.verifyEmailCode("test@test.com", "123456")
      ).rejects.toBeInstanceOf(HttpError);

      try {
        await tokenService.verifyEmailCode("test@test.com", "123456");
      } catch (err: any) {
        expect(getStatus(err)).toBe(400);
        expect(String(getMessage(err))).toContain("expired or invalid");
      }
    });

    it("throws 429 if too many attempts (>=5) and deletes key", async () => {
      mockCache.get.mockResolvedValue({
        codeHash: "hash",
        passwordHash: "hash123",
        role: "student",
        attempts: 5,
        createdAt: Date.now(),
      });
      mockCache.delete.mockResolvedValue(undefined);

      await expect(
        tokenService.verifyEmailCode("test@test.com", "123456")
      ).rejects.toBeInstanceOf(HttpError);

      try {
        await tokenService.verifyEmailCode("test@test.com", "123456");
      } catch (err: any) {
        expect(getStatus(err)).toBe(429);
        expect(String(getMessage(err))).toContain(
          "Too many verification attempts"
        );
        expect(mockCache.delete).toHaveBeenCalledWith(
          "verify:email:test@test.com"
        );
      }
    });

    it("increments attempts and throws 400 when code is invalid", async () => {
      const data = {
        codeHash: "hash",
        passwordHash: "hash123",
        role: "student",
        attempts: 2,
        createdAt: Date.now(),
      };

      mockCache.get.mockResolvedValue(data);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      mockCache.set.mockResolvedValue(undefined);

      await expect(
        tokenService.verifyEmailCode("test@test.com", "000000")
      ).rejects.toBeInstanceOf(HttpError);

      try {
        await tokenService.verifyEmailCode("test@test.com", "000000");
      } catch (err: any) {
        expect(getStatus(err)).toBe(400);
        expect(String(getMessage(err))).toContain("Invalid verification code");

        // note TTL argument is undefined in service to preserve existing TTL
        expect(mockCache.set).toHaveBeenCalledWith(
          "verify:email:test@test.com",
          { ...data, attempts: 3 },
          undefined
        );
      }
    });

    it("deletes key and returns email/password/role when code is valid", async () => {
      mockCache.get.mockResolvedValue({
        codeHash: "hash",
        passwordHash: "hash123",
        role: "student",
        attempts: 0,
        createdAt: Date.now(),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockCache.delete.mockResolvedValue(undefined);

      const result = await tokenService.verifyEmailCode(
        "test@test.com",
        "100000"
      );

      expect(result).toEqual({
        email: "test@test.com",
        password: "hash123",
        role: "student",
      });

      expect(mockCache.delete).toHaveBeenCalledWith(
        "verify:email:test@test.com"
      );
    });

    it("wraps unknown errors into HttpError 500", async () => {
      mockCache.get.mockRejectedValue(new Error("redis down"));

      await expect(
        tokenService.verifyEmailCode("test@test.com", "123456")
      ).rejects.toBeInstanceOf(HttpError);

      try {
        await tokenService.verifyEmailCode("test@test.com", "123456");
      } catch (err: any) {
        expect(getStatus(err)).toBe(500);
        expect(String(getMessage(err))).toContain("Internal server error");
        expect(logger.error).toHaveBeenCalled();
      }
    });
  });
});
