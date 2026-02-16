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
 * @version 3.0.0
 * @auth Thomas
 */
import dotenv from "dotenv";

import logger from "../utility/logger";

dotenv.config();

function asInt(v: string | undefined | null, fallback: number): number {
  const n = v == null ? NaN : parseInt(v, 10);
  return Number.isNaN(n) ? fallback : n;
}

function asBool(v: string | undefined | null, fallback: boolean): boolean {
  return v == null ? fallback : /^(1|true|yes|on)$/i.test(String(v));
}

type EnvMode = "development" | "test" | "production";

class EnvConfig {
  private static _instance: EnvConfig;

  private readonly _nodeEnv: EnvMode;
  private readonly _strictEnv: boolean;

  private readonly _databaseUrl: string;
  private readonly _databaseName: string;
  private readonly _databasePort: string;
  private readonly _databaseUsername: string;
  private readonly _databasePassword: string;
  private readonly _databaseHost: string;

  private readonly _redisUrl: string;
  private readonly _rabbitMQUrl: string;

  private readonly _corsWhitelist: string;
  private readonly _frontendClient: string;
  private readonly _zodConfiguration?: string;

  private readonly _jwtSecretAccess: string;
  private readonly _codeSecret: string;

  private readonly _googleClientId?: string;
  private readonly _googleCaptchaSecret?: string;

  private readonly _msClientId?: string;
  private readonly _msTenantId?: string;

  private readonly _emailUser?: string;
  private readonly _emailPass?: string;

  private readonly _paypalClientId?: string;
  private readonly _paypalSecretKey?: string;
  private readonly _paypalApi?: string;
  private readonly _paypalCurrency?: string;

  private constructor() {
    this._nodeEnv = (process.env.NODE_ENV as EnvMode) ?? "development";
    this._strictEnv = asBool(
      process.env.STRICT_ENV,
      this._nodeEnv === "production"
    );

    this._databaseUrl = this.reqWithDefault(
      "DATABASE_URL",
      "mysql://root:password123@localhost:3306/schoolspace"
    );
    this._databaseHost = this.reqWithDefault("DATABASE_HOST", "localhost");
    this._databaseName = this.reqWithDefault("DATABASE_NAME", "schoolspace");
    this._databasePassword = this.reqWithDefault(
      "DATABASE_PASSWORD",
      "password123"
    );
    this._databasePort = this.reqWithDefault("DATABASE_PORT", "3306");
    this._databaseUsername = this.reqWithDefault("DATABASE_USER", "root");

    this._redisUrl = this.reqWithDefault("REDIS_URL", "redis://localhost:6379");

    this._rabbitMQUrl = this.reqWithDefault(
      "RABBITMQ_URL",
      "amqp://guest:guest@localhost:5672"
    );

    this._jwtSecretAccess = this.reqWithDefault(
      "JWT_SECRET_ACCESS",
      "dev-secret"
    );
    this._codeSecret = this.reqWithDefault("CODE_SECRET", "dev-secret");

    this._corsWhitelist = this.opt("CORS_WHITELIST", "http://localhost:3040")!;

    this._frontendClient = this.opt(
      "FRONTEND_CLIENT",
      "http://localhost:3040"
    )!;

    this._zodConfiguration = this.opt("ZOD_CONFIGURATION", "passthrough");

    this._googleClientId = this.opt("GOOGLE_CLIENT_ID");
    this._googleCaptchaSecret = this.opt("GOOGLE_CAPTCHA_SECRET");

    this._msClientId = this.opt("MS_CLIENT_ID");
    this._msTenantId = this.opt("MS_TENANT_ID");

    this._emailUser = this.opt("EMAIL_USER");
    this._emailPass = this.opt("EMAIL_PASS");

    this._paypalClientId = this.opt("PAYPAL_CLIENT_ID");
    this._paypalSecretKey = this.opt("PAYPAL_SECRET_KEY");

    this._paypalApi = this.opt(
      "PAYPAL_API",
      "https://api-m.sandbox.paypal.com"
    );

    this._paypalCurrency = this.opt("PAYMENT_CURRENCY", "CAD");

    Object.freeze(this);
  }

  public static get instance(): EnvConfig {
    if (!this._instance) {
      this._instance = new EnvConfig();
    }
    return this._instance;
  }

  private reqWithDefault(key: string, def: string): string {
    const v = process.env[key];

    if (!v) {
      logger.warn(`[EnvConfig] "${key}" not set → using default: ${def}`);
      return def;
    }

    return v;
  }

  private opt(key: string, def?: string): string | undefined {
    const v = process.env[key];
    return !v ? def : v;
  }

  public validate(): void {
    const errors: string[] = [];

    const require = (cond: any, msg: string) => {
      if (!cond) errors.push(msg);
    };

    require(this._databaseUrl, "DATABASE_URL is required");
    require(this._redisUrl, "REDIS_URL is required");
    require(this._rabbitMQUrl, "RABBITMQ_URL is required");

    require(this._jwtSecretAccess !==
      "dev-secret", "JWT_SECRET_ACCESS must be set");

    if (errors.length > 0) {
      logger.error("[EnvConfig] Invalid environment configuration:");
      errors.forEach((e) => logger.error(" - " + e));
      throw new Error("Environment validation failed. Server will not start.");
    }

    logger.info("[EnvConfig] Environment validation passed");
  }

  get nodeEnv(): EnvMode {
    return this._nodeEnv;
  }

  get isProduction(): boolean {
    return this._nodeEnv === "production";
  }

  get databaseUrl(): string {
    return this._databaseUrl;
  }

  get databasePort(): string {
    return this._databasePort;
  }

  get databaseUser(): string {
    return this._databaseUsername;
  }

  get databaseName(): string {
    return this._databaseName;
  }

  get databaseHost(): string {
    return this._databaseHost;
  }

  get databasePassword(): string {
    return this._databasePassword;
  }

  get redisUrl(): string {
    return this._redisUrl;
  }

  get rabbitMqUrl(): string {
    return this._rabbitMQUrl;
  }

  get jwtSecretAccess(): string {
    return this._jwtSecretAccess;
  }

  get codeSecret(): string {
    return this._codeSecret;
  }

  get corsWhitelist(): string {
    return this._corsWhitelist;
  }

  get frontendClient(): string {
    return this._frontendClient;
  }

  get zodConfiguration(): string | undefined {
    return this._zodConfiguration;
  }

  get paypalApi(): string | undefined {
    return this._paypalApi;
  }

  get paypalSecret(): string | undefined {
    return this._paypalSecretKey;
  }

  get paypalClient(): string | undefined {
    return this._paypalClientId;
  }

  get paypalCurrency(): string | undefined {
    return this._paypalCurrency;
  }

  get googleClient(): string | undefined {
    return this._googleClientId;
  }

  get googleCaptcha(): string | undefined {
    return this._googleCaptchaSecret;
  }

  get microsoftClient(): string | undefined {
    return this._msClientId;
  }

  get microsoftTenant(): string | undefined {
    return this._msTenantId;
  }

  get emailUsername(): string | undefined {
    return this.emailUsername;
  }

  get emailPassword(): string | undefined {
    return this.emailPassword;
  }

  public isGoogleEnabled(): boolean {
    return !!this._googleClientId;
  }

  public isMicrosoftEnabled(): boolean {
    return !!(this._msClientId && this._msTenantId);
  }

  public isEmailEnabled(): boolean {
    return !!(this._emailUser && this._emailPass);
  }

  public isCaptchaEnabled(): boolean {
    return !!this._googleCaptchaSecret;
  }

  public asInt(v: string | undefined | null, fallback: number): number {
    return asInt(v, fallback);
  }

  public asBool(v: string | undefined | null, fallback: boolean): boolean {
    return asBool(v, fallback);
  }
}

export default EnvConfig.instance;
