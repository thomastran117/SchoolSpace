/**
 * @file TokenService.ts
 * @description
 * Handles JWT lifecycle — access, refresh, and email verification tokens:
 * - Access/refresh generation & validation
 * - Token rotation and revocation
 * - Email verification token creation and consumption
 *
 * @module service
 * @version 2.0.0
 * @auth Thomas
 */

import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { randomBytes } from "crypto";
import { httpError, HttpError } from "../utility/httpUtility";
import type {
  TokenPayloadBase,
  RefreshTokenPayload,
  VerifyTokenPayload,
  UserPayload,
} from "../models/token";
import type { CacheService } from "../service/cacheService";
import env from "../config/envConfigs";
import logger from "../utility/logger";

const {
  jwt_secret_access: JWT_SECRET_ACCESS,
  jwt_secret_refresh: JWT_SECRET_REFRESH,
  jwt_secret_verify: JWT_SECRET_VERIFY,
} = env;

const ACCESS_EXPIRY = "30m";
const SHORT_REFRESH_EXPIRY = "1d";
const LONG_REFRESH_EXPIRY = "7d";

class BasicTokenService {
  public getUserPayload(token: string): UserPayload {
    try {
      const decoded = this.validateAccessToken(token);
      return {
        id: decoded.userId,
        role: decoded.role,
        email: decoded.username,
      };
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }
      logger.error(
        `[BasicTokenService] getUserPayload failed: ${err?.message ?? err}`,
      );
      httpError(500, "Internal server error");
    }
  }

  public validateAccessToken(token: string): TokenPayloadBase {
    try {
      return jwt.verify(token, JWT_SECRET_ACCESS) as TokenPayloadBase;
    } catch (err: any) {
      if (err.name === "TokenExpiredError")
        httpError(401, "Expired access token");
      else if (err.name === "JsonWebTokenError")
        httpError(401, "Invalid access token");

      logger.error(
        `[BasicTokenService] validateAccessToken failed: ${err?.message ?? err}`,
      );

      httpError(500, "Internal server error");
    }
  }
}

class TokenService extends BasicTokenService {
  private readonly cacheService: CacheService;
  constructor(cacheService: CacheService) {
    super();
    this.cacheService = cacheService;
  }

  public async generateTokens(
    id: number,
    username: string,
    role: string,
    avatar?: string,
    remember?: boolean,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const accessToken = this.createAccessToken(id, username, role, avatar);
      const refreshToken = this.createRefreshToken(
        id,
        username,
        role,
        avatar,
        remember,
      );

      const decoded = jwt.decode(refreshToken) as RefreshTokenPayload;
      await this.saveRefreshToken(decoded.jti, id, decoded.exp);

      return { accessToken, refreshToken };
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }
      logger.error(
        `[TokenService] generateTokens failed: ${err?.message ?? err}`,
      );
      httpError(500, "Internal server error");
    }
  }

  private createAccessToken(
    userId: number,
    username: string,
    role: string,
    avatar?: string,
  ): string {
    try {
      const payload = { userId, username, role, avatar };
      return jwt.sign(payload, JWT_SECRET_ACCESS, { expiresIn: ACCESS_EXPIRY });
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }
      logger.error(
        `[TokenService] createAccessToken failed: ${err?.message ?? err}`,
      );
      httpError(500, "Internal server error");
    }
  }

  private createRefreshToken(
    userId: number,
    username: string,
    role: string,
    avatar?: string,
    remember?: boolean,
  ): string {
    try {
      const jti = uuidv4();
      const payload: TokenPayloadBase & { jti: string } = {
        userId,
        username,
        role,
        avatar,
        remember,
        jti,
      };
      const expiresIn = remember ? LONG_REFRESH_EXPIRY : SHORT_REFRESH_EXPIRY;
      return jwt.sign(payload, JWT_SECRET_REFRESH, { expiresIn });
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }
      logger.error(
        `[TokenService] createRefreshToken failed: ${err?.message ?? err}`,
      );
      httpError(500, "Internal server error");
    }
  }

  public async validateRefreshToken(
    token: string,
  ): Promise<RefreshTokenPayload> {
    try {
      const decoded = jwt.verify(
        token,
        JWT_SECRET_REFRESH,
      ) as RefreshTokenPayload;
      const exists = await this.cacheService.get<string>(
        `refresh:${decoded.jti}`,
      );
      if (!exists) {
        httpError(401, "Refresh token revoked or already used");
      }
      return decoded;
    } catch (err: any) {
      if (err.name === "TokenExpiredError")
        httpError(401, "Expired refresh token");
      else if (err.name === "JsonWebTokenError")
        httpError(401, "Invalid refresh token");

      logger.error(
        `[TokenService] validateRefreshToken failed: ${err?.message ?? err}`,
      );

      httpError(500, "Internal server error");
    }
  }

  private async saveRefreshToken(
    jti: string,
    userId: number,
    exp: number,
  ): Promise<void> {
    try {
      const ttl = exp - Math.floor(Date.now() / 1000);
      await this.cacheService.set(`refresh:${jti}`, userId.toString(), ttl);
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }
      logger.error(
        `[TokenService] saveRefreshToken failed: ${err?.message ?? err}`,
      );
      httpError(500, "Internal server error");
    }
  }

  public async rotateRefreshToken(oldToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    role: string;
    username: string;
    avatar?: string;
    id: number;
  }> {
    try {
      const decoded = await this.validateRefreshToken(oldToken);
      await this.cacheService.delete(`refresh:${decoded.jti}`);

      const accessToken = this.createAccessToken(
        decoded.userId,
        decoded.username,
        decoded.role,
        decoded.avatar,
      );
      const refreshToken = this.createRefreshToken(
        decoded.userId,
        decoded.username,
        decoded.role,
        decoded.avatar,
        decoded.remember,
      );

      const newDecoded = jwt.decode(refreshToken) as RefreshTokenPayload;
      await this.saveRefreshToken(
        newDecoded.jti,
        decoded.userId,
        newDecoded.exp,
      );

      return {
        accessToken,
        refreshToken,
        role: decoded.role,
        username: decoded.username,
        avatar: decoded.avatar,
        id: decoded.userId,
      };
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }
      logger.error(
        `[TokenService] rotateRefreshToken failed: ${err?.message ?? err}`,
      );
      httpError(500, "Internal server error");
    }
  }

  public async createVerifyToken(
    email: string,
    passwordHash: string,
    role: string,
  ): Promise<string> {
    try {
      const jti = randomBytes(32).toString("base64url");
      const verifyData = { email, passwordHash, role };

      await this.cacheService.set(`verify:${jti}`, verifyData, 15 * 60);

      const tokenPayload = { sub: email, jti, purpose: "email-verify" };
      return jwt.sign(tokenPayload, JWT_SECRET_VERIFY, { expiresIn: "15m" });
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }
      logger.error(
        `[TokenService] createVerifyToken failed: ${err?.message ?? err}`,
      );
      httpError(500, "Internal server error");
    }
  }

  public async validateVerifyToken(
    token: string,
  ): Promise<{ email: string; password: string; role: string }> {
    let payload: VerifyTokenPayload;

    try {
      payload = jwt.verify(token, JWT_SECRET_VERIFY) as VerifyTokenPayload;

      if (payload.purpose !== "email-verify") {
        httpError(400, "Invalid token purpose");
      }

      const data = await this.cacheService.get<{
        email: string;
        passwordHash: string;
        role: string;
      }>(`verify:${payload.jti}`);

      if (!data) {
        httpError(400, "Token missing or already used");
      }

      await this.cacheService.delete(`verify:${payload.jti}`);
      await this.cacheService.set(`used:${payload.jti}`, "1", 24 * 60 * 60);

      if (data!.email !== payload.sub) {
        httpError(401, "Email mismatch");
      }

      return {
        email: data!.email,
        password: data!.passwordHash,
        role: data!.role,
      };
    } catch (err: any) {
      if (err.name === "TokenExpiredError")
        httpError(401, "Expired verify token");
      else if (err.name === "JsonWebTokenError")
        httpError(401, "Invalid verify token");

      logger.error(
        `[TokenService] validateVerifyToken failed: ${err?.message ?? err}`,
      );

      httpError(500, "Internal server error");
    }
  }

  public async logoutToken(token: string): Promise<boolean> {
    try {
      const decoded = await this.validateRefreshToken(token);
      await this.cacheService.delete(`refresh:${decoded.jti}`);
      return true;
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }
      logger.error(`[TokenService] logoutToken failed: ${err?.message ?? err}`);
      httpError(500, "Internal server error");
    }
  }
}

export { BasicTokenService, TokenService };
