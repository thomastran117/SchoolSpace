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
import env from "@config/envConfigs";
import { BadRequestError } from "@error/badRequestError";
import { HttpError } from "@error/httpError";
import { InternalServerError } from "@error/internalServerError";
import { TooManyRequestError } from "@error/tooManyRequestError";
import { UnauthorizedError } from "@error/unauthorizedError";
import { BasicTokenService } from "@service/basicTokenService";
import type { CacheService } from "@service/cacheService";
import logger from "@utility/logger";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const { jwtSecretAccess: JWT_SECRET_ACCESS } = env;

const ACCESS_EXPIRY = "30m";
const SHORT_REFRESH_TTL = 24 * 60 * 60; // 1 day
const LONG_REFRESH_TTL = 7 * 24 * 60 * 60; // 7 days
const VERIFY_TTL = 15 * 60; // 15 minutes
const MAX_ATTEMPTS = 5;

type EmailVerificationCache = {
  codeHash: string;
  passwordHash: string;
  role: string;
  attempts: number;
  createdAt: number;
};

class TokenService extends BasicTokenService {
  private readonly cacheService: CacheService;

  constructor(dependencies: { cacheService: CacheService }) {
    super();
    this.cacheService = dependencies.cacheService;
  }

  private createAccessToken(
    id: number,
    username: string,
    role: string,
    avatar?: string
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
    ttlSeconds: number
  ): Promise<void> {
    try {
      await this.cacheService.set(`refresh:${token}`, payload, ttlSeconds);
    } catch (err: any) {
      logger.warn(
        `[TokenService] saveRefreshToken failed (non-fatal): ${err?.message ?? err}`
      );
    }
  }

  public async generateTokens(
    id: number,
    username: string,
    role: string,
    avatar?: string,
    remember?: boolean
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const accessToken = this.createAccessToken(id, username, role, avatar);

      const refreshToken = uuidv4();
      const ttl = remember ? LONG_REFRESH_TTL : SHORT_REFRESH_TTL;

      await this.saveRefreshToken(
        refreshToken,
        { id, username, role, avatar, remember },
        ttl
      );

      return { accessToken, refreshToken };
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[TokenService] generateTokens failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
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
        throw new UnauthorizedError({ message: "Invalid refresh token" });
      }

      return data;
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[TokenService] validateRefreshToken failed: ${err?.message ?? err}`
      );
      throw new UnauthorizedError({ message: "Invalid refresh token" });
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
        payload.avatar
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
        `[TokenService] rotateRefreshToken failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
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
    role: string
  ): Promise<{ code?: string; alreadySent: boolean }> {
    try {
      const key = `verify:email:${email}`;
      const existing = await this.cacheService.get<EmailVerificationCache>(key);

      if (existing) {
        return { alreadySent: true };
      }

      const code = this.generateOtp();
      const codeHash = await bcrypt.hash(code, 10);

      await this.cacheService.set(
        key,
        {
          codeHash,
          passwordHash,
          role,
          attempts: 0,
          createdAt: Date.now(),
        },
        VERIFY_TTL
      );

      return { code, alreadySent: false };
    } catch (err: any) {
      logger.error(
        `[TokenService] createEmailCode failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async verifyEmailCode(email: string, code: string) {
    try {
      const key = `verify:email:${email}`;

      const data = await this.cacheService.get<EmailVerificationCache>(key);
      if (!data) {
        throw new BadRequestError({
          message: "Verification code expired or invalid",
        });
      }

      if (data.attempts >= MAX_ATTEMPTS) {
        await this.cacheService.delete(key);
        throw new TooManyRequestError({
          message: "Too many verification attempts",
        });
      }

      const isValid = await bcrypt.compare(code, data.codeHash);

      if (!isValid) {
        await this.cacheService.set(
          key,
          { ...data, attempts: data.attempts + 1 },
          undefined
        );
        throw new BadRequestError({ message: "Invalid verification code" });
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
        `[TokenService] verifyEmailCode failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

export { TokenService };
export default TokenService;
