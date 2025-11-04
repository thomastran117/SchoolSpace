/**
 * @file envConfigs.ts
 * @description
 * Centralized configuration manager for environment variables.
 *
 * - Loads and validates environment variables using `dotenv`.
 * - Provides type-safe accessors for required and optional variables.
 * - Supports feature detection (Google OAuth, Microsoft OAuth, Email, Captcha).
 *
 * @module config
 * @version 2.0.0
 * @auth Thomas
 */

import dotenv from "dotenv";
import logger from "../utility/logger";

dotenv.config();

function asInt(v: string | undefined | null, fallback: number): number {
  return v == null ? fallback : parseInt(v, 10);
}

function asBool(v: string | undefined | null, fallback: boolean): boolean {
  return v == null ? fallback : /^(1|true|yes|on)$/i.test(String(v));
}

class EnvConfig {
  private static _instance: EnvConfig;

  public readonly database_url: string;
  public readonly redis_url: string;
  public readonly mongo_url?: string;
  public readonly jwt_secret_access: string;
  public readonly jwt_secret_refresh: string;
  public readonly jwt_secret_verify: string;
  public readonly cors_whitelist: string;
  public readonly frontend_client: string;
  public readonly google_client_id?: string;
  public readonly google_captcha_secret?: string;
  public readonly ms_client_id?: string;
  public readonly ms_tenant_id?: string;
  public readonly email_user?: string;
  public readonly email_pass?: string;

  private constructor() {
    this.database_url = this.req("DATABASE_URL");
    this.redis_url = this.req("REDIS_URL");
    this.mongo_url = this.opt("MONGO_URL");
    this.jwt_secret_access = this.opt("JWT_SECRET_ACCESS", "dev-secret")!;
    this.jwt_secret_refresh = this.opt("JWT_SECRET_REFRESH", "dev-secret-2")!;
    this.jwt_secret_verify = this.opt("JWT_SECRET_VERIFY", "dev-secret-3")!;
    this.cors_whitelist = this.opt("CORS_WHITELIST", "http://localhost:3040")!;
    this.frontend_client = this.opt(
      "FRONTEND_CLIENT",
      "http://localhost:3040",
    )!;
    this.google_client_id = this.opt("GOOGLE_CLIENT_ID");
    this.google_captcha_secret = this.opt("GOOGLE_CAPTCHA_SECRET");
    this.ms_client_id = this.opt("MS_CLIENT_ID");
    this.ms_tenant_id = this.opt("MS_TENANT_ID");
    this.email_user = this.opt("EMAIL_USER");
    this.email_pass = this.opt("EMAIL_PASS");

    Object.freeze(this);
  }

  public static get instance(): EnvConfig {
    if (!this._instance) {
      this._instance = new EnvConfig();
    }
    return this._instance;
  }

  private req(key: string): string {
    const v = process.env[key];
    if (v == null || v === "") {
      logger.error(`Missing required environment variable: ${key}`);
      process.exit(1);
    }
    return v;
  }

  private opt(key: string, def?: string): string | undefined {
    const v = process.env[key];
    return v == null || v === "" ? def : v;
  }

  public isGoogleEnabled(): boolean {
    return !!this.google_client_id;
  }

  public isMicrosoftEnabled(): boolean {
    return !!(this.ms_client_id && this.ms_tenant_id);
  }

  public isEmailEnabled(): boolean {
    return !!(this.email_user && this.email_pass);
  }

  public isCaptchaEnabled(): boolean {
    return !!this.google_captcha_secret;
  }

  public asInt(v: string | undefined | null, fallback: number): number {
    return asInt(v, fallback);
  }

  public asBool(v: string | undefined | null, fallback: boolean): boolean {
    return asBool(v, fallback);
  }
}

const env = EnvConfig.instance;
export default env;
