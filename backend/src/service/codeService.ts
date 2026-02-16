import crypto from "crypto";
import { env } from "process";

import {
  InternalServerError,
  TooManyRequestError,
  UnauthorizedError,
} from "../error";
import type { CacheService } from "../service/cacheService";
import logger from "../utility/logger";

type CodeRecord = { courseId: number };

const HMAC_SECRET = env.codeSecret;

class CodeService {
  private readonly cache: CacheService;

  private readonly CODE_TTL_SEC = 15 * 60;
  private readonly COOLDOWN_TTL_SEC = 60;
  private readonly MAX_ATTEMPTS = 8;

  constructor(dependencies: { cacheService: CacheService }) {
    this.cache = dependencies.cacheService;
  }

  public async generateEnrollmentCode(
    courseId: number
  ): Promise<string | null> {
    try {
      const cooldownKey = this.cooldownKey(courseId);
      const onCooldown = await this.cache.exists(cooldownKey);

      if (onCooldown) {
        return null;
      }

      const code = this.generateHumanCode(12);
      const token = this.tokenize(code);

      const key = this.codeKey(token);
      await this.cache.set<CodeRecord>(key, { courseId }, this.CODE_TTL_SEC);

      await this.cache.set(cooldownKey, 1, this.COOLDOWN_TTL_SEC);

      return code;
    } catch (err: any) {
      logger.error(
        `[CodeService] generateEnrollmentCode failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async redeemEnrollmentCodeByCode(params: {
    userId: number;
    code: string;
  }): Promise<number> {
    const { userId, code } = params;

    try {
      const normCode = this.normalizeCode(code);
      const token = this.tokenize(normCode);

      const attemptsKey = this.attemptsKey(token, userId);
      const attempts = await this.cache.increment(
        attemptsKey,
        1,
        this.CODE_TTL_SEC
      );
      if (attempts > this.MAX_ATTEMPTS)
        throw new TooManyRequestError({ message: "Too many attempts" });

      const record = await this.cache.get<CodeRecord>(this.codeKey(token));
      if (!record?.courseId)
        throw new UnauthorizedError({ message: "Invalid code" });

      const ttl =
        (await this.cache.ttl(this.codeKey(token))) ?? this.CODE_TTL_SEC;
      const usedKey = this.usedKey(record.courseId, userId);

      const marked = await this.cache.setIfNotExists(
        usedKey,
        1,
        Math.max(1, ttl)
      );
      if (!marked) throw new UnauthorizedError({ message: "Invalid code" });

      return record.courseId;
    } catch (err: any) {
      logger.error(
        `[CodeService] redeemEnrollmentCodeByCode failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  private tokenize(code: string): string {
    if (!HMAC_SECRET) {
      throw new Error("ENROLL_CODE_SECRET is not set");
    }
    return crypto
      .createHmac("sha256", HMAC_SECRET)
      .update(code)
      .digest("base64url");
  }

  private normalizeCode(code: string): string {
    return code
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "");
  }

  private generateHumanCode(length: number): string {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const bytes = crypto.randomBytes(length);
    let out = "";
    for (let i = 0; i < length; i++)
      out += alphabet[bytes[i] % alphabet.length];
    return out;
  }

  private codeKey(token: string) {
    return `enroll:code:${token}`;
  }

  private usedKey(courseId: number, userId: number) {
    return `enroll:used:course:${courseId}:user:${userId}`;
  }

  private attemptsKey(token: string, userId: number) {
    return `enroll:attempts:code:${token}:user:${userId}`;
  }

  private cooldownKey(courseId: number) {
    return `enroll:cooldown:course:${courseId}`;
  }
}

export { CodeService };
