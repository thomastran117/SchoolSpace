class EnvironmentManager {
  public readonly cors_whitelist: string;
  public readonly frontend_client: string;
  public readonly zod_configuration?: string;
  public readonly database_url: string;
  public readonly redis_url: string;
  public readonly mongo_url: string;

  public readonly jwt_secret_access: string;

  public readonly google_client_id?: string;
  public readonly google_captcha_secret?: string;

  public readonly ms_client_id?: string;
  public readonly ms_tenant_id?: string;

  public readonly email_user?: string;
  public readonly email_pass?: string;

  public readonly paypal_client_id?: string;
  public readonly paypal_secret_key?: string;
  public readonly paypal_api?: string;
  public readonly paypal_currency?: string;

  constructor(env: NodeJS.ProcessEnv = process.env) {
    this.database_url = this.req(env, "DATABASE_URL");
    this.redis_url = this.req(env, "REDIS_URL");
    this.mongo_url = this.req(env, "MONGO_URL");
    this.jwt_secret_access = this.opt(env, "JWT_SECRET_ACCESS", "dev-secret")!;
    this.cors_whitelist = this.opt(
      env,
      "CORS_WHITELIST",
      "http://localhost:3040",
    )!;
    this.frontend_client = this.opt(
      env,
      "FRONTEND_CLIENT",
      "http://localhost:3040",
    )!;
    this.zod_configuration = this.opt(env, "ZOD_CONFIGURATION", "passthrough");
    this.google_client_id = this.opt(env, "GOOGLE_CLIENT_ID");
    this.google_captcha_secret = this.opt(env, "GOOGLE_CAPTCHA_SECRET");
    this.ms_client_id = this.opt(env, "MS_CLIENT_ID");
    this.ms_tenant_id = this.opt(env, "MS_TENANT_ID");
    this.email_user = this.opt(env, "EMAIL_USER");
    this.email_pass = this.opt(env, "EMAIL_PASS");
    this.paypal_client_id = this.opt(env, "PAYPAL_CLIENT_ID");
    this.paypal_secret_key = this.opt(env, "PAYPAL_SECRET_KEY");
    this.paypal_api = this.opt(
      env,
      "PAYPAL_API",
      "https://api-m.sandbox.paypal.com",
    );
    this.paypal_currency = this.opt(env, "PAYMENT_CURRENCY", "CAD");

    Object.freeze(this);
  }

  private req(env: NodeJS.ProcessEnv, key: string): string {
    const v = env[key];
    if (!v) throw new Error(`Missing required environment variable: ${key}`);
    return v;
  }

  private opt(
    env: NodeJS.ProcessEnv,
    key: string,
    def?: string,
  ): string | undefined {
    const v = env[key];
    return v ? v : def;
  }
}

export { EnvironmentManager };
