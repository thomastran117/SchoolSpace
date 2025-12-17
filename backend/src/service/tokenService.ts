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

import env from "../config/envConfigs";
import type { CacheService } from "../service/cacheService";

import { httpError, HttpError } from "../utility/httpUtility";
import logger from "../utility/logger";
import { BasicTokenService } from "./basicTokenService";

const { jwtSecretAccess: JWT_SECRET_ACCESS } = env;

const ACCESS_EXPIRY = "30m";
const SHORT_REFRESH_TTL = 24 * 60 * 60; // 1 day
const LONG_REFRESH_TTL = 7 * 24 * 60 * 60; // 7 days
const VERIFY_TOKEN_TTL = 15 * 60; // 15 minutes
const USED_VERIFY_TTL = 24 * 60 * 60; // 24 hours

class TokenService extends BasicTokenService {
  private readonly cacheService: CacheService;

  constructor(cacheService: CacheService) {
    super();
    this.cacheService = cacheService;
  }

  private createAccessToken(
    id: number,
    username: string,
    role: string,
    avatar?: string,
  ): string {
    const payload = { userId: id, username, role, avatar };
    return jwt.sign(payload, JWT_SECRET_ACCESS, { expiresIn: ACCESS_EXPIRY });
  }

  private async saveRefreshToken(
    token: string,
    payload: {
      id: number;
      username: string;
      role: string;
      avatar?: string;
      remember?: boolean;
    },
    ttlSeconds: number,
  ): Promise<void> {
    try {
      await this.cacheService.set(`refresh:${token}`, payload, ttlSeconds);
    } catch (err: any) {
      logger.warn(
        `[TokenService] saveRefreshToken failed (non-fatal): ${err?.message ?? err}`,
      );
    }
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

      const refreshToken = uuidv4();
      const ttl = remember ? LONG_REFRESH_TTL : SHORT_REFRESH_TTL;

      await this.saveRefreshToken(
        refreshToken,
        { id, username, role, avatar, remember },
        ttl,
      );

      return { accessToken, refreshToken };
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[TokenService] generateTokens failed: ${err?.message ?? err}`,
      );
      httpError(500, "Internal server error");
    }
  }

  public async validateRefreshToken(token: string) {
    try {
      const data = await this.cacheService.get<{
        id: number;
        username: string;
        role: string;
        avatar?: string;
        remember?: boolean;
      }>(`refresh:${token}`);

      if (!data) {
        httpError(401, "Refresh token revoked or expired");
      }

      return data;
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[TokenService] validateRefreshToken failed: ${err?.message ?? err}`,
      );
      httpError(401, "Refresh token revoked or expired");
    }
  }

  public async isRefreshTokenValid(token: string): Promise<boolean> {
    try {
      await this.validateRefreshToken(token);
      return true;
    } catch (err: any) {
      if (err instanceof HttpError && err.statusCode === 401) {
        return false;
      }
      throw err;
    }
  }

  public async rotateRefreshToken(oldToken: string) {
    try {
      const payload = await this.validateRefreshToken(oldToken);

      await this.cacheService.delete(`refresh:${oldToken}`);

      const accessToken = this.createAccessToken(
        payload.id,
        payload.username,
        payload.role,
        payload.avatar,
      );

      const newRefresh = uuidv4();
      const ttl = payload.remember ? LONG_REFRESH_TTL : SHORT_REFRESH_TTL;

      await this.saveRefreshToken(newRefresh, payload, ttl);

      return {
        accessToken,
        refreshToken: newRefresh,
        role: payload.role,
        username: payload.username,
        avatar: payload.avatar,
        id: payload.id,
      };
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[TokenService] rotateRefreshToken failed: ${err?.message ?? err}`,
      );
      httpError(500, "Internal server error");
    }
  }

  public async logoutToken(token: string): Promise<boolean> {
    try {
      await this.cacheService.delete(`refresh:${token}`);
      return true;
    } catch {
      return true;
    }
  }

  public async createVerifyToken(
    email: string,
    passwordHash: string,
    role: string,
  ): Promise<string> {
    try {
      const existingToken = await this.cacheService.get<string>(
        `verify:email:${email}`,
      );

      if (existingToken) {
        // Extend existing token TTL
        await this.cacheService.set(
          `verify:${existingToken}`,
          { email, passwordHash, role },
          VERIFY_TOKEN_TTL,
        );

        return existingToken;
      }

      const token = uuidv4();
      const payload = { email, passwordHash, role };

      await this.cacheService.set(`verify:${token}`, payload, VERIFY_TOKEN_TTL);

      await this.cacheService.set(
        `verify:email:${email}`,
        token,
        VERIFY_TOKEN_TTL,
      );

      return token;
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[TokenService] createVerifyToken failed: ${err?.message ?? err}`,
      );
      httpError(500, "Internal server error");
    }
  }

  public async validateVerifyToken(token: string) {
    try {
      const data = await this.cacheService.get<{
        email: string;
        passwordHash: string;
        role: string;
      }>(`verify:${token}`);

      if (!data) {
        httpError(400, "Token missing, expired or already used");
      }

      await this.cacheService.delete(`verify:${token}`);
      await this.cacheService.delete(`verify:email:${data.email}`);

      await this.cacheService.set(`used:${token}`, "1", USED_VERIFY_TTL);

      return {
        email: data.email,
        password: data.passwordHash,
        role: data.role,
      };
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[TokenService] validateVerifyToken failed: ${err?.message ?? err}`,
      );
      httpError(500, "Internal server error");
    }
  }
}

export { TokenService };
