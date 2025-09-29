/**
 * @file envManager.js
 * @description  All environment variables are mounted and requested from the config class
 * Doing this will allow all variables to be consistent across the application
 *
 * Refer to SETUP.md to setup environment variables. CONFIGURATION.md will contain a full description
 * of each variable
 *
 * NOTE: Database and Redis URL are mandatory, everything else is optional as there is a default
 * @module config
 *
 * @author Thomas
 * @version 1.0.0
 *
 */

// External libraries
import dotenv from "dotenv";

// Internal core modules
import logger from "../utility/logger.js";

dotenv.config();

/**
 * Parses a value into an integer, or returns fallback if null/undefined.
 *
 * @param {string|undefined|null} v - Value to parse.
 * @param {number} fallback - Default value if v is not provided.
 * @returns {number} Parsed integer or fallback.
 */
const asInt = (v, fallback) => (v == null ? fallback : parseInt(v, 10));

/**
 * Parses a value into a boolean, or returns fallback if null/undefined.
 *
 * @param {string|undefined|null} v - Value to parse.
 * @param {boolean} fallback - Default value if v is not provided.
 * @returns {boolean} Parsed boolean or fallback.
 */
const asBool = (v, fallback) =>
  v == null ? fallback : /^(1|true|yes|on)$/i.test(String(v));

/**
 * Retrieves a required environment variable.
 *
 * @param {string} key - Environment variable key.
 * @returns {string} Environment variable value.
 * @throws Will log error and terminate process if variable is missing.
 */
function req(key) {
  const v = process.env[key];
  if (v == null || v === "") {
    logger.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
  return v;
}

/**
 * Retrieves an optional environment variable.
 *
 * @param {string} key - Environment variable key.
 * @param {string|undefined} def - Default value if not set.
 * @returns {string|undefined} Value or fallback.
 */
function opt(key, def) {
  const v = process.env[key];
  return v == null || v === "" ? def : v;
}

/**
 * Application configuration manager.
 *
 * - Loads environment variables using `dotenv`.
 * - Provides type-safe accessors for required and optional vars.
 * - Includes convenience methods for checking feature availability
 *   (Google, Microsoft, Email integrations).
 *
 * @property {string} database_url - Database connection string (required).
 * @property {string} redis_url - Redis connection string (required).
 * @property {string|undefined} mongo_url - MongoDB connection string (optional).
 * @property {string} jwt_secret_access - Primary JWT secret (default: "dev-secret").
 * @property {string} jwt_secret_refresh - Secondary JWT secret (default: "dev-secret-2").
 * @property {string} jwt_secret_refresh - Tertiary JWT secret (default: "dev-secret-3").
 * @property {string} cors_whitelist - Allowed CORS origins (default: "http://localhost:3040").
 * @property {string} frontend_client - Frontend client URL (default: "http://localhost:3040").
 * @property {string|undefined} google_client_id - Google OAuth client ID.
 * @property {string|undefined} ms_client_id - Microsoft OAuth client ID.
 * @property {string|undefined} ms_tenant_id - Microsoft tenant ID.
 * @property {string|undefined} email_user - SMTP email user.
 * @property {string|undefined} email_pass - SMTP email password.
 *
 * @method isGoogleEnabled - Returns true if all Google OAuth vars are set.
 * @method isMicrosoftEnabled - Returns true if all Microsoft OAuth vars are set.
 * @method isEmailEnabled - Returns true if email credentials are set.
 */
const config = {
  database_url: req("DATABASE_URL"),
  redis_url: req("REDIS_URL"),
  mongo_url: opt("MONGO_URL", undefined),
  jwt_secret_access: opt("JWT_SECRET_ACCESS", "dev-secret"),
  jwt_secret_refresh: opt("JWT_SECRET_REFRESH", "dev-secret-2"),
  jwt_secret_verify: opt("JWT_SECRET_VERIFY", "dev-secret-3"),
  cors_whitelist: opt("CORS_WHITELIST", "http://localhost:3040"),
  frontend_client: opt("FRONTEND_CLIENT", "http://localhost:3040"),
  google_client_id: opt("GOOGLE_CLIENT_ID", undefined),
  ms_client_id: opt("MS_CLIENT_ID", undefined),
  ms_tenant_id: opt("MS_TENANT_ID", undefined),
  email_user: opt("EMAIL_USER", undefined),
  email_pass: opt("EMAIL_PASS", undefined),

  isGoogleEnabled() {
    return !!this.google_client_id;
  },
  isMicrosoftEnabled() {
    return !!(this.ms_client_id && this.ms_tenant_id);
  },
  isEmailEnabled() {
    return !!(this.email_user && this.email_pass);
  },
};

Object.freeze(config);

export default config;
