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
  private readonly _rabbitMQUrl: string;
  private readonly _redisUrl: string;

  private readonly _paypalClientId?: string;
  private readonly _paypalSecretKey?: string;
  private readonly _paypalApi?: string;
  private readonly _paypalCurrency?: string;

  private constructor() {
    this._nodeEnv = (process.env.NODE_ENV as EnvMode) ?? "development";
    this._strictEnv = asBool(
      process.env.STRICT_ENV,
      this._nodeEnv === "production",
    );

    this._databaseUrl = this.reqWithDefault(
      "DATABASE_URL",
      "mysql://root:password123@localhost:3306/schoolapp",
    );

    this._redisUrl = this.reqWithDefault("REDIS_URL", "redis://localhost:6379");

    this._rabbitMQUrl = this.reqWithDefault("RABBITMQ_URL", "amqp://guest:guest@localhost:5672");

    this._paypalClientId = this.opt("PAYPAL_CLIENT_ID");
    this._paypalSecretKey = this.opt("PAYPAL_SECRET_KEY");

    this._paypalApi = this.opt(
      "PAYPAL_API",
      "https://api-m.sandbox.paypal.com",
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
      if (this._strictEnv) {
        logger.error(
          `[EnvConfig] Missing required env var "${key}" (strict mode enabled)`,
        );
        process.exit(1);
      }

      logger.warn(`[EnvConfig] "${key}" not set → using default: ${def}`);
      return def;
    }

    return v;
  }

  private opt(key: string, def?: string): string | undefined {
    const v = process.env[key];
    return !v ? def : v;
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

  get rabbitMqUrl(): string {
    return this._rabbitMQUrl;
  }

  get redisUrl(): string {
    return this._redisUrl;
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

  get emailUsername(): string | undefined {
    return this.emailUsername;
  }

  get emailPassword(): string | undefined {
    return this.emailPassword;
  }

  public asInt(v: string | undefined | null, fallback: number): number {
    return asInt(v, fallback);
  }

  public asBool(v: string | undefined | null, fallback: boolean): boolean {
    return asBool(v, fallback);
  }
}

export default EnvConfig.instance;
