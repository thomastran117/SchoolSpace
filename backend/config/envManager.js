import dotenv from "dotenv";
import logger from "../utility/logger.js";
dotenv.config();

const asInt = (v, fallback) => (v == null ? fallback : parseInt(v, 10));
const asBool = (v, fallback) =>
  v == null ? fallback : /^(1|true|yes|on)$/i.test(String(v));

function req(key) {
  const v = process.env[key];
  if (v == null || v === "") {
    logger.error(`Missing required environment variable: ${key}`)
    process.exit(1);
  }
  return v;
}

function opt(key, def) {
  const v = process.env[key];
  return v == null || v === "" ? def : v;
}

export const config = {
  database_url: req("DATABASE_URL"),
  jwt_secret: opt("JWT_SECRET", "dev-secret"),
  jwt_secret_2: opt("JWT_SECRET_2", "dev-secret-2"),
  cors_whitelist: opt("CORS_WHITELIST", "http://localhost:3040"),
  frontend_client: opt("FRONTEND_CLIENT", "http://localhost:3040"),
  google_client_id: req("GOOGLE_CLIENT_ID"),
  google_client_secret: req("GOOGLE_CLIENT_SECRET"),
  google_redirect_uri: req("GOOGLE_REDIRECT_URI"),
  ms_client_id: req("MS_CLIENT_ID"),
  ms_client_secret: req("MS_CLIENT_SECRET"),
  ms_redirect_uri: req("MS_REDIRECT_URI"),
  ms_tenant_id: req("MS_TENANT_ID"),
  email_user: opt("EMAIL_USER", ""),
  email_pass: opt("EMAIL_PASS", "")
};

Object.freeze(config);
