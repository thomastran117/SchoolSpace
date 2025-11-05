/**
 * @file tokenService.test.ts
 * @description
 * Unit tests for TokenService in isolation from Redis or Prisma.
 * Mocks CacheService and jwt methods for pure logic validation.
 */
jest.mock("../../config/envConfigs", () => ({
  __esModule: true,
  default: {
    jwt_secret_access: "access_secret",
    jwt_secret_refresh: "refresh_secret",
    jwt_secret_verify: "verify_secret",
  },
}));

import { TokenService } from "../../service/tokenService";
import jwt from "jsonwebtoken";
import {
  RefreshTokenPayload,
  VerifyTokenPayload,
  TokenPayloadBase,
} from "../../models/token";

const mockCacheService = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
};

function makeMockRefreshTokenPayload(
  overrides: Partial<RefreshTokenPayload> = {},
): RefreshTokenPayload {
  const now = Math.floor(Date.now() / 1000);
  return {
    jti: overrides.jti ?? "mockJti",
    userId: overrides.userId ?? 1,
    username: overrides.username ?? "testuser",
    role: overrides.role ?? "user",
    avatar: overrides.avatar,
    remember: overrides.remember,
    exp: overrides.exp ?? now + 3600,
    iat: overrides.iat ?? now,
  };
}

describe("TokenService", () => {
  let tokenService: TokenService;

  beforeEach(() => {
    jest.clearAllMocks();
    tokenService = new TokenService(mockCacheService as any);
  });

  test("generateTokens should create access and refresh token", async () => {
    const spySign = jest.spyOn(jwt, "sign").mockImplementation(((
      payload: any,
      secret: string,
    ) => {
      if (typeof secret === "string") {
        if (secret.includes("access")) return "mockAccessToken";
        if (secret.includes("refresh")) return "mockRefreshToken";
      }
      return "unknownToken";
    }) as any);

    const spyDecode = jest
      .spyOn(jwt, "decode")
      .mockReturnValue(makeMockRefreshTokenPayload());

    const result = await tokenService.generateTokens(1, "testuser", "user");

    expect(result.accessToken).toBe("mockAccessToken");
    expect(result.refreshToken).toBe("mockRefreshToken");

    expect(mockCacheService.set).toHaveBeenCalledWith(
      "refresh:mockJti",
      "1",
      expect.any(Number),
    );

    spySign.mockRestore();
    spyDecode.mockRestore();
  });

  test("validateRefreshToken should succeed when token exists", async () => {
    const mockPayload = makeMockRefreshTokenPayload();
    jest.spyOn(jwt, "verify").mockImplementation(() => mockPayload);
    mockCacheService.get.mockResolvedValue("1");

    const result = await tokenService.validateRefreshToken("fakeToken");

    expect(result).toEqual(mockPayload);
    expect(mockCacheService.get).toHaveBeenCalledWith("refresh:mockJti");
  });

  test("validateRefreshToken should fail if token revoked", async () => {
    const mockPayload = makeMockRefreshTokenPayload({ jti: "revokedJti" });
    jest.spyOn(jwt, "verify").mockImplementation(() => mockPayload);
    mockCacheService.get.mockResolvedValue(null);

    await expect(
      tokenService.validateRefreshToken("fakeToken"),
    ).rejects.toThrow();
  });

  test("rotateRefreshToken should revoke old and store new token", async () => {
    const oldPayload = makeMockRefreshTokenPayload({
      jti: "oldJti",
      avatar: "pic.png",
      remember: true,
    });

    jest
      .spyOn(tokenService, "validateRefreshToken")
      .mockResolvedValue(oldPayload);

    jest.spyOn(jwt, "sign").mockImplementation((p: any) => JSON.stringify(p));
    jest.spyOn(jwt, "decode").mockReturnValue(
      makeMockRefreshTokenPayload({
        jti: "newJti",
      }),
    );

    const result = await tokenService.rotateRefreshToken("oldToken");

    expect(mockCacheService.delete).toHaveBeenCalledWith("refresh:oldJti");
    expect(mockCacheService.set).toHaveBeenCalledWith(
      "refresh:newJti",
      "1",
      expect.any(Number),
    );
    expect(result.id).toBe(1);
    expect(result.role).toBe("user");
  });

  test("logoutToken should delete the refresh token", async () => {
    const payload = makeMockRefreshTokenPayload({ jti: "logoutJti" });
    jest.spyOn(tokenService, "validateRefreshToken").mockResolvedValue(payload);

    const result = await tokenService.logoutToken("token");

    expect(mockCacheService.delete).toHaveBeenCalledWith("refresh:logoutJti");
    expect(result).toBe(true);
  });

  test("validateVerifyToken should return decoded email data and clean up cache", async () => {
    const payload: VerifyTokenPayload = {
      sub: "test@example.com",
      jti: "verifyJti123",
      purpose: "email-verify",
      exp: Math.floor(Date.now() / 1000) + 900,
      iat: Math.floor(Date.now() / 1000),
    };

    jest.spyOn(jwt, "verify").mockImplementation(() => payload as any);
    mockCacheService.get.mockResolvedValue({
      email: "test@example.com",
      passwordHash: "hashedPass",
      role: "student",
    });

    const result = await tokenService.validateVerifyToken("verifyToken");

    expect(mockCacheService.delete).toHaveBeenCalledWith("verify:verifyJti123");
    expect(mockCacheService.set).toHaveBeenCalledWith(
      "used:verifyJti123",
      "1",
      24 * 60 * 60,
    );
    expect(result).toEqual({
      email: "test@example.com",
      password: "hashedPass",
      role: "student",
    });
  });

  test("validateVerifyToken should throw for invalid purpose", async () => {
    const payload: VerifyTokenPayload = {
      sub: "user@example.com",
      jti: "badJti",
      purpose: "not-email-verify",
      exp: Math.floor(Date.now() / 1000) + 900,
      iat: Math.floor(Date.now() / 1000),
    };
    jest.spyOn(jwt, "verify").mockImplementation(() => payload as any);

    await expect(
      tokenService.validateVerifyToken("badToken"),
    ).rejects.toThrow();
  });

  test("validateVerifyToken should throw for missing cached data", async () => {
    const payload: VerifyTokenPayload = {
      sub: "user@example.com",
      jti: "expiredJti",
      purpose: "email-verify",
      exp: Math.floor(Date.now() / 1000) + 900,
      iat: Math.floor(Date.now() / 1000),
    };
    jest.spyOn(jwt, "verify").mockImplementation(() => payload as any);
    mockCacheService.get.mockResolvedValue(null);

    await expect(
      tokenService.validateVerifyToken("expiredToken"),
    ).rejects.toThrow();
  });

  test("validateAccessToken should decode a valid access token", () => {
    const mockDecoded = {
      userId: 123,
      username: "thomas",
      role: "admin",
      iat: 1111,
      exp: 2222,
    };
    jest.spyOn(jwt, "verify").mockImplementation(() => mockDecoded as any);

    const result = tokenService.validateAccessToken("validToken");

    expect(result).toEqual(mockDecoded);
    expect(jwt.verify).toHaveBeenCalledWith("validToken", "access_secret");
  });

  test("validateAccessToken should throw if expired", () => {
    const error = new Error("jwt expired");
    (error as any).name = "TokenExpiredError";
    jest.spyOn(jwt, "verify").mockImplementation(() => {
      throw error;
    });

    expect(() => tokenService.validateAccessToken("expiredToken")).toThrow(
      "Expired access token",
    );
  });

  test("validateAccessToken should throw if invalid token", () => {
    const error = new Error("invalid signature");
    (error as any).name = "JsonWebTokenError";
    jest.spyOn(jwt, "verify").mockImplementation(() => {
      throw error;
    });

    expect(() => tokenService.validateAccessToken("badToken")).toThrow(
      "Invalid access token",
    );
  });

  test("getUserPayload should extract user info from valid header", () => {
    const decoded = { userId: 42, username: "user@example.com", role: "user" };
    jest
      .spyOn(tokenService, "validateAccessToken")
      .mockReturnValue(decoded as any);

    const result = tokenService.getUserPayload("Bearer validToken");

    expect(result).toEqual({
      id: 42,
      email: "user@example.com",
      role: "user",
    });
  });

  test("getUserPayload should throw for missing Authorization header", () => {
    expect(() => tokenService.getUserPayload("")).toThrow(
      "Missing or malformed Authorization header",
    );
  });

  test("getUserPayload should throw for malformed Authorization header", () => {
    expect(() => tokenService.getUserPayload("InvalidHeader 123")).toThrow(
      "Missing or malformed Authorization header",
    );
  });
});
