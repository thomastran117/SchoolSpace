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

import bcrypt from "bcrypt";
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
const VERIFY_TTL = 15 * 60; // 15 minutes
const MAX_ATTEMPTS = 5;

class TokenService extends BasicTokenService {
  private readonly cacheService: CacheService;

  constructor(cacheService: CacheService) {
    super();
    this.cacheService = cacheService;
  }

  private createAccessToken(
    id: string,
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
      id: string;
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
    id: string,
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
        id: string;
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

  public async createEmailCode(
    email: string,
    passwordHash: string,
    role: string,
  ): Promise<{ code: string }> {
    try {
      const code = this.generateOtp();
      const codeHash = await bcrypt.hash(code, 10);

      await this.cacheService.set(
        `verify:email:${email}`,
        {
          codeHash,
          passwordHash,
          role,
          attempts: 0,
        },
        VERIFY_TTL,
      );

      return { code };
    } catch (err: any) {
      logger.error(
        `[TokenService] createEmailVerification failed: ${err?.message ?? err}`,
      );
      httpError(500, "Internal server error");
    }
  }

  public async verifyEmailCode(email: string, code: string) {
    try {
      const key = `verify:email:${email}`;

      const data = await this.cacheService.get<{
        codeHash: string;
        passwordHash: string;
        role: string;
        attempts: number;
      }>(key);

      if (!data) {
        httpError(400, "Verification code expired or invalid");
      }

      if (data.attempts >= MAX_ATTEMPTS) {
        await this.cacheService.delete(key);
        httpError(429, "Too many verification attempts");
      }

      const isValid = await bcrypt.compare(code, data.codeHash);

      if (!isValid) {
        await this.cacheService.set(
          key,
          { ...data, attempts: data.attempts + 1 },
          VERIFY_TTL,
        );
        httpError(400, "Invalid verification code");
      }

      await this.cacheService.delete(key);

      return {
        email,
        password: data.passwordHash,
        role: data.role,
      };
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[TokenService] verifyEmailCode failed: ${err?.message ?? err}`,
      );
      httpError(500, "Internal server error");
    }
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

export { TokenService };
