/**
 * @file envManager.ts
 * @description
 * Centralized configuration manager for environment variables.
 *
 * - Loads and validates environment variables using `dotenv`.
 * - Provides type-safe accessors for required and optional variables.
 * - Supports feature detection (Google OAuth, Microsoft OAuth, Email, Captcha).
 *
 * @module config
 * @version 1.0.0
 * @auth Thomas
 */

import dotenv from "dotenv";
import logger from "../utility/logger";

// Load environment variables from .env file
dotenv.config();

/* -------------------------------------------------------------
 * Helper Functions
 * ----------------------------------------------------------- */

/**
 * Parses a string value into an integer or returns a fallback.
 */
function asInt(v: string | undefined | null, fallback: number): number {
  return v == null ? fallback : parseInt(v, 10);
}

/**
 * Parses a string value into a boolean or returns a fallback.
 */
function asBool(v: string | undefined | null, fallback: boolean): boolean {
  return v == null ? fallback : /^(1|true|yes|on)$/i.test(String(v));
}

/**
 * Retrieves a required environment variable.
 * Logs and exits if the variable is missing.
 */
function req(key: string): string {
  const v = process.env[key];
  if (v == null || v === "") {
    logger.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
  return v;
}

/**
 * Retrieves an optional environment variable, or returns a default.
 */
function opt(key: string, def?: string): string | undefined {
  const v = process.env[key];
  return v == null || v === "" ? def : v;
}

/* -------------------------------------------------------------
 * Config Interface
 * ----------------------------------------------------------- */
export interface AppConfig {
  database_url: string;
  redis_url: string;
  mongo_url?: string;
  jwt_secret_access: string;
  jwt_secret_refresh: string;
  jwt_secret_verify: string;
  cors_whitelist: string;
  frontend_client: string;
  google_client_id?: string;
  google_captcha_secret?: string;
  ms_client_id?: string;
  ms_tenant_id?: string;
  email_user?: string;
  email_pass?: string;

  isGoogleEnabled(): boolean;
  isMicrosoftEnabled(): boolean;
  isEmailEnabled(): boolean;
  isCaptchaEnabled(): boolean;
}

/* -------------------------------------------------------------
 * Configuration Object
 * ----------------------------------------------------------- */
const config: AppConfig = {
  database_url: req("DATABASE_URL"),
  redis_url: req("REDIS_URL"),
  mongo_url: opt("MONGO_URL"),
  jwt_secret_access: opt("JWT_SECRET_ACCESS", "dev-secret")!,
  jwt_secret_refresh: opt("JWT_SECRET_REFRESH", "dev-secret-2")!,
  jwt_secret_verify: opt("JWT_SECRET_VERIFY", "dev-secret-3")!,
  cors_whitelist: opt("CORS_WHITELIST", "http://localhost:3040")!,
  frontend_client: opt("FRONTEND_CLIENT", "http://localhost:3040")!,
  google_client_id: opt("GOOGLE_CLIENT_ID"),
  google_captcha_secret: opt("GOOGLE_CAPTCHA_SECRET"),
  ms_client_id: opt("MS_CLIENT_ID"),
  ms_tenant_id: opt("MS_TENANT_ID"),
  email_user: opt("EMAIL_USER"),
  email_pass: opt("EMAIL_PASS"),

  isGoogleEnabled() {
    return !!this.google_client_id;
  },
  isMicrosoftEnabled() {
    return !!(this.ms_client_id && this.ms_tenant_id);
  },
  isEmailEnabled() {
    return !!(this.email_user && this.email_pass);
  },
  isCaptchaEnabled() {
    return !!this.google_captcha_secret;
  },
};

Object.freeze(config);

export default config;
