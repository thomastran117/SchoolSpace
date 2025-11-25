import { TokenService } from "../../service/tokenService";
import { HttpError } from "../../utility/httpUtility";

import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

jest.mock("jsonwebtoken");
jest.mock("uuid");

// Mock Redis-like cache service
const mockCache = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
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

    // Restore real uuidv4 behavior unless explicitly mocked
    (uuidv4 as jest.Mock).mockImplementation(() => "uuid-token");

    // Create service
    tokenService = new TokenService(mockCache as any);
  });

  // ---------------------------------------------------------
  // ACCESS TOKEN TESTS
  // ---------------------------------------------------------
  describe("Access Token", () => {
    it("validates a valid access token", () => {
      (jwt.verify as jest.Mock).mockReturnValue(TEST_ACCESS_PAYLOAD);

      const result = tokenService.validateAccessToken("valid.jwt");

      expect(result).toEqual(TEST_ACCESS_PAYLOAD);
      expect(jwt.verify).toHaveBeenCalled();
    });

    it("throws 401 when access token expired", () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        const err: any = new Error("expired");
        err.name = "TokenExpiredError";
        throw err;
      });

      expect(() => tokenService.validateAccessToken("expired.jwt")).toThrow(
        HttpError,
      );
    });

    it("throws 401 when access token is invalid", () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        const err: any = new Error("invalid");
        err.name = "JsonWebTokenError";
        throw err;
      });

      expect(() => tokenService.validateAccessToken("bad.jwt")).toThrow(
        HttpError,
      );
    });
  });

  // ---------------------------------------------------------
  // REFRESH TOKEN TESTS (UUID-based)
  // ---------------------------------------------------------
  describe("Refresh Tokens", () => {
    it("generates access + refresh tokens", async () => {
      (jwt.sign as jest.Mock).mockReturnValue("access.jwt");

      mockCache.set.mockResolvedValue(undefined);

      const result = await tokenService.generateTokens(
        1,
        "test@test.com",
        "student",
        "img.png",
        false,
      );

      expect(result).toEqual({
        accessToken: "access.jwt",
        refreshToken: "uuid-token",
      });

      expect(mockCache.set).toHaveBeenCalledWith(
        "refresh:uuid-token",
        JSON.stringify({
          id: 1,
          username: "test@test.com",
          role: "student",
          avatar: "img.png",
          remember: false,
        }),
        expect.any(Number),
      );
    });

    it("validates a refresh token from Redis", async () => {
      mockCache.get.mockResolvedValue(JSON.stringify(TEST_ACCESS_PAYLOAD));

      const result = await tokenService.validateRefreshToken("uuid-token");
      expect(result).toEqual(TEST_ACCESS_PAYLOAD);
    });

    it("throws 401 for missing/expired refresh token", async () => {
      mockCache.get.mockResolvedValue(null);

      await expect(
        tokenService.validateRefreshToken("missing"),
      ).rejects.toBeInstanceOf(HttpError);
    });

    it("rotates refresh tokens correctly", async () => {
      mockCache.get.mockResolvedValue(
        JSON.stringify({
          id: 1,
          username: "test@test.com",
          role: "student",
          avatar: undefined,
          remember: false,
        }),
      );

      (jwt.sign as jest.Mock).mockReturnValue("new-access");

      const result = await tokenService.rotateRefreshToken("uuid-old");

      expect(result).toEqual({
        accessToken: "new-access",
        refreshToken: "uuid-token",
        role: "student",
        username: "test@test.com",
        avatar: undefined,
        id: 1,
      });

      expect(mockCache.delete).toHaveBeenCalledWith("refresh:uuid-old");
      expect(mockCache.set).toHaveBeenCalledTimes(1);
    });

    it("throws 401 when rotating a missing refresh token", async () => {
      mockCache.get.mockResolvedValue(null);

      await expect(
        tokenService.rotateRefreshToken("dead"),
      ).rejects.toBeInstanceOf(HttpError);
    });

    it("logoutToken deletes refresh token", async () => {
      mockCache.delete.mockResolvedValue(true);

      const result = await tokenService.logoutToken("uuid-token");

      expect(result).toBe(true);
      expect(mockCache.delete).toHaveBeenCalledWith("refresh:uuid-token");
    });
  });

  // ---------------------------------------------------------
  // VERIFY TOKENS (UUID-based)
  // ---------------------------------------------------------
  describe("Verify Tokens", () => {
    it("creates a verify token and stores data in Redis", async () => {
      const result = await tokenService.createVerifyToken(
        "test@test.com",
        "hash123",
        "student",
      );

      expect(result).toBe("uuid-token");

      expect(mockCache.set).toHaveBeenCalledWith(
        "verify:uuid-token",
        JSON.stringify({
          email: "test@test.com",
          passwordHash: "hash123",
          role: "student",
        }),
        15 * 60,
      );
    });

    it("validates a verify token successfully", async () => {
      mockCache.get.mockResolvedValue(
        JSON.stringify({
          email: "test@test.com",
          passwordHash: "hashedPass",
          role: "student",
        }),
      );

      const data = await tokenService.validateVerifyToken("uuid-token");

      expect(data).toEqual({
        email: "test@test.com",
        password: "hashedPass",
        role: "student",
      });

      expect(mockCache.delete).toHaveBeenCalledWith("verify:uuid-token");
      expect(mockCache.set).toHaveBeenCalledWith(
        "used:uuid-token",
        "1",
        24 * 60 * 60,
      );
    });

    it("throws 400 when verify token is missing or reused", async () => {
      mockCache.get.mockResolvedValue(null);

      await expect(
        tokenService.validateVerifyToken("bad-token"),
      ).rejects.toBeInstanceOf(HttpError);
    });

    it("throws 500 on Redis error during verify token validation", async () => {
      mockCache.get.mockRejectedValue(new Error("Redis down"));

      await expect(
        tokenService.validateVerifyToken("uuid-token"),
      ).rejects.toBeInstanceOf(Error);
    });
  });
});
