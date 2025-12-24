import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import { TokenService } from "../../service/tokenService";
import { HttpError } from "../../utility/httpUtility";

jest.mock("jsonwebtoken");
jest.mock("uuid");

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

const TEST_ACCESS_PAYLOAD = {
  userId: 1,
  username: "test@test.com",
  role: "student",
  avatar: "img.png",
};

describe("TokenService", () => {
  let tokenService: TokenService;

  beforeEach(() => {
    jest.clearAllMocks();
    (uuidv4 as jest.Mock).mockReturnValue("uuid-token");
    tokenService = new TokenService(mockCache as any);
  });

  describe("Access Tokens", () => {
    it("validates a valid access token", () => {
      (jwt.verify as jest.Mock).mockReturnValue(TEST_ACCESS_PAYLOAD);

      const result = tokenService.validateAccessToken("valid.jwt");

      expect(result).toEqual(TEST_ACCESS_PAYLOAD);
      expect(jwt.verify).toHaveBeenCalled();
    });

    it("throws 401 when token expired", () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        const err: any = new Error("expired");
        err.name = "TokenExpiredError";
        throw err;
      });

      expect(() => tokenService.validateAccessToken("expired.jwt")).toThrow(
        HttpError
      );
    });

    it("throws 401 when token invalid", () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        const err: any = new Error("invalid");
        err.name = "JsonWebTokenError";
        throw err;
      });

      expect(() => tokenService.validateAccessToken("bad.jwt")).toThrow(
        HttpError
      );
    });
  });

  describe("Refresh Tokens", () => {
    it("generates access + refresh tokens", async () => {
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

      expect(mockCache.set).toHaveBeenCalledWith(
        "refresh:uuid-token",
        TEST_REFRESH_PAYLOAD,
        expect.any(Number)
      );
    });

    it("validates refresh token", async () => {
      mockCache.get.mockResolvedValue(TEST_REFRESH_PAYLOAD);

      const result = await tokenService.validateRefreshToken("uuid-token");
      expect(result).toEqual(TEST_REFRESH_PAYLOAD);
    });

    it("throws 401 if refresh token missing", async () => {
      mockCache.get.mockResolvedValue(null);

      await expect(
        tokenService.validateRefreshToken("missing")
      ).rejects.toBeInstanceOf(HttpError);
    });

    it("rotates refresh token correctly", async () => {
      mockCache.get.mockResolvedValue(TEST_REFRESH_PAYLOAD);
      (jwt.sign as jest.Mock).mockReturnValue("new-access");

      const result = await tokenService.rotateRefreshToken("uuid-old");

      expect(result).toEqual({
        accessToken: "new-access",
        refreshToken: "uuid-token",
        role: "student",
        username: "test@test.com",
        avatar: "img.png",
        id: 1,
      });

      expect(mockCache.delete).toHaveBeenCalledWith("refresh:uuid-old");
      expect(mockCache.set).toHaveBeenCalledWith(
        "refresh:uuid-token",
        TEST_REFRESH_PAYLOAD,
        expect.any(Number)
      );
    });

    it("returns false for invalid refresh token", async () => {
      mockCache.get.mockResolvedValue(null);

      const result = await tokenService.isRefreshTokenValid("dead");
      expect(result).toBe(false);
    });

    it("logout deletes refresh token", async () => {
      mockCache.delete.mockResolvedValue(true);

      const result = await tokenService.logoutToken("uuid-token");

      expect(result).toBe(true);
      expect(mockCache.delete).toHaveBeenCalledWith("refresh:uuid-token");
    });
  });

  describe("Verify Tokens", () => {
    it("creates verify token", async () => {
      mockCache.get.mockResolvedValue(null);

      const result = await tokenService.createVerifyToken(
        "test@test.com",
        "hash123",
        "student"
      );

      expect(result).toBe("uuid-token");

      expect(mockCache.set).toHaveBeenCalledWith(
        "verify:uuid-token",
        {
          email: "test@test.com",
          passwordHash: "hash123",
          role: "student",
        },
        15 * 60
      );

      expect(mockCache.set).toHaveBeenCalledWith(
        "verify:email:test@test.com",
        "uuid-token",
        15 * 60
      );
    });

    it("reuses existing verify token", async () => {
      mockCache.get.mockResolvedValue("uuid-token");

      const result = await tokenService.createVerifyToken(
        "test@test.com",
        "hash123",
        "student"
      );

      expect(result).toBe("uuid-token");
    });

    it("validates verify token successfully", async () => {
      mockCache.get.mockResolvedValue({
        email: "test@test.com",
        passwordHash: "hashedPass",
        role: "student",
      });

      const data = await tokenService.validateVerifyToken("uuid-token");

      expect(data).toEqual({
        email: "test@test.com",
        password: "hashedPass",
        role: "student",
      });

      expect(mockCache.delete).toHaveBeenCalledWith("verify:uuid-token");
      expect(mockCache.delete).toHaveBeenCalledWith(
        "verify:email:test@test.com"
      );

      expect(mockCache.set).toHaveBeenCalledWith(
        "used:uuid-token",
        "1",
        24 * 60 * 60
      );
    });

    it("throws 400 when verify token missing", async () => {
      mockCache.get.mockResolvedValue(null);

      await expect(
        tokenService.validateVerifyToken("bad-token")
      ).rejects.toBeInstanceOf(HttpError);
    });
  });
});
