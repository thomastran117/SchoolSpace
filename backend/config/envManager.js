const dotenv = require("dotenv");
const logger = require("../utility/logger");
dotenv.config();

const asInt = (v, fallback) => (v == null ? fallback : parseInt(v, 10));
const asBool = (v, fallback) =>
  v == null ? fallback : /^(1|true|yes|on)$/i.test(String(v));

function req(key) {
  const v = process.env[key];
  if (v == null || v === "") {
    logger.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
  return v;
}

function opt(key, def) {
  const v = process.env[key];
  return v == null || v === "" ? def : v;
}

const config = {
  database_url: req("DATABASE_URL"),
  redis_url: req("REDIS_URL"),
  jwt_secret: opt("JWT_SECRET", "dev-secret"),
  jwt_secret_2: opt("JWT_SECRET_2", "dev-secret-2"),
  cors_whitelist: opt("CORS_WHITELIST", "http://localhost:3040"),
  frontend_client: opt("FRONTEND_CLIENT", "http://localhost:3040"),
  google_client_id: opt("GOOGLE_CLIENT_ID", undefined),
  google_client_secret: opt("GOOGLE_CLIENT_SECRET", undefined),
  google_redirect_uri: opt("GOOGLE_REDIRECT_URI", undefined),
  ms_client_id: opt("MS_CLIENT_ID", undefined),
  ms_client_secret: opt("MS_CLIENT_SECRET", undefined),
  ms_redirect_uri: opt("MS_REDIRECT_URI", undefined),
  ms_tenant_id: opt("MS_TENANT_ID", undefined),
  email_user: opt("EMAIL_USER", undefined),
  email_pass: opt("EMAIL_PASS", undefined),
    isGoogleEnabled() {
    return !!(this.google_client_id && this.google_client_secret && this.google_redirect_uri);
  },
  isMicrosoftEnabled() {
    return !!(this.ms_client_id && this.ms_redirect_uri && this.ms_tenant_id && this.ms_client_secret);
  },
   isEmailEnabled() {
    return !!(this.email_user && this.email_pass);
  }, 
};

Object.freeze(config);

module.exports = config;
