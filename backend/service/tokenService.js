/**
 * @file tokenService.js
 * @description Token Service file that handles access, verify and refresh token validation,
 * creation and life cycle
 *
 * @module service
 *
 * @author Thomas
 * @version 1.0.0
 *
 */

// External libraries
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { randomBytes } from "crypto";

// Internal config & utilities
import config from "../config/envManager.js";
import { httpError } from "../utility/httpUtility.js";
import logger from "../utility/logger.js";

// Resources
import redis from "../resource/redis.js";

const {
  jwt_secret_access: JWT_SECRET_ACCESS,
  jwt_secret_refresh: JWT_SECRET_REFRESH,
  jwt_secret_verify: JWT_SECRET_VERIFY,
} = config;

const ACCESS_EXPIRY = "30m";
const REFRESH_EXPIRY = "7d";

/**
 * Extracts user payload (id, role) from Authorization header.
 * @param {string} authHeader - The Authorization header containing "Bearer <token>".
 * @returns {{ id: string, role: string }}
 * @throws {Error} If token is missing or invalid.
 */
const getUserPayload = (authHeader) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    httpError(401, "Missing token");
  }
  const token = authHeader.split(" ")[1];
  const decoded = validateAccessToken(token);
  return { id: decoded.userId, role: decoded.role };
};

/**
 * Generates a new access and refresh token pair.
 * @param {string} id - User ID.
 * @param {string} email - User email.
 * @param {string} role - User role.
 * @returns {Promise<{ accessToken: string, refreshToken: string }>}
 */
const generateTokens = async (id, email, role) => {
  const accessToken = createAccessToken(id, email, role);
  const refreshToken = createRefreshToken(id, email, role);

  const decoded = jwt.decode(refreshToken);
  await saveRefreshToken(decoded.jti, id, decoded.exp);

  return { accessToken, refreshToken };
};

/**
 * Creates a signed access token.
 * @private
 */
const createAccessToken = (userId, email, role) => {
  const payload = { userId, email, role };
  return jwt.sign(payload, JWT_SECRET_ACCESS, { expiresIn: ACCESS_EXPIRY });
};

/**
 * Validates an access token.
 * @param {string} token
 * @returns {object} Decoded payload.
 * @throws {Error} If token is invalid or expired.
 */
export const validateAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET_ACCESS);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      httpError(401, "Expired access token");
    }
    httpError(401, "Invalid access token");
  }
};

/**
 * Creates a signed refresh token with a unique jti and user payload.
 * @private
 */
const createRefreshToken = (userId, email, role) => {
  const jti = uuidv4();
  const payload = { userId, email, role, jti };
  return jwt.sign(payload, JWT_SECRET_REFRESH, { expiresIn: REFRESH_EXPIRY });
};

/**
 * Validates a refresh token against Redis.
 * @param {string} token
 * @returns {Promise<object>} Decoded payload.
 * @throws {Error} If token is invalid, expired, or revoked.
 */
const validateRefreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET_REFRESH);
    const exists = await redis.get(`refresh:${decoded.jti}`);

    if (!exists) {
      httpError(401, "Refresh token revoked or already used");
    }
    console.log(decoded);
    return decoded;
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      httpError(401, "Expired refresh token");
    }
    httpError(401, "Invalid refresh token");
  }
};


/**
 * Saves a refresh token to Redis with TTL matching expiration.
 * @private
 */
const saveRefreshToken = async (jti, userId, exp) => {
  const ttl = exp - Math.floor(Date.now() / 1000);
  await redis.setex(`refresh:${jti}`, ttl, userId.toString());
};

/**
 * Rotates refresh token: revokes old, issues new pair.
 * @param {string} id - User ID.
 * @param {string} email - User email.
 * @param {string} role - User role.
 * @returns {Promise<{ accessToken: string, refreshToken: string }>}
 */
const rotateRefreshToken = async (oldToken) => {
  const decoded = await validateRefreshToken(oldToken);
  await redis.del(`refresh:${decoded.jti}`);
  const accessToken = createAccessToken(decoded.userId, decoded.email, decoded.role);
  const refreshToken = createRefreshToken(decoded.userId, decoded.email, decoded.role);

  const newDecoded = jwt.decode(refreshToken);
  await saveRefreshToken(newDecoded.jti, newDecoded.userId, newDecoded.exp);

  return { accessToken, refreshToken, role: decoded.role, email: decoded.email };
};

/**
 * Creates a short-lived verification token for email confirmation.
 * Stores verification data in Redis for later retrieval.
 * @param {string} email
 * @param {string} passwordHash
 * @param {string} role
 * @returns {Promise<string>} Verification token (JWT).
 */
const createVerifyToken = async (email, passwordHash, role) => {
  const jti = randomBytes(32).toString("base64url");

  await redis.set(
    `verify:${jti}`,
    JSON.stringify({ email, passwordHash, role }),
    "EX",
    15 * 60,
  );

  return jwt.sign(
    { sub: email, jti, purpose: "email-verify" },
    JWT_SECRET_VERIFY,
    {
      expiresIn: "15m",
    },
  );
};

/**
 * Validates and consumes a verification token.
 * @param {string} token
 * @returns {Promise<{ email: string, password: string, role: string }>}
 */
const validateVerifyToken = async (token) => {
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET_VERIFY);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      httpError(400, "Expired verify token");
    }
    httpError(400, "Invalid verify token");
  }

  if (payload.purpose !== "email-verify") {
    httpError(400, "Invalid token purpose");
  }

  let pendingStr;
  if (typeof redis.getdel === "function") {
    pendingStr = await redis.getdel(`verify:${payload.jti}`);
  } else {
    const [[, val]] = await redis
      .multi()
      .get(`verify:${payload.jti}`)
      .del(`verify:${payload.jti}`)
      .exec();
    pendingStr = val;
  }

  if (!pendingStr) {
    httpError(400, "Token missing or already used");
  }

  const data = JSON.parse(pendingStr);
  if (data.email !== payload.sub) {
    httpError(401, "Email mismatch");
  }

  await redis.setex(`used:${payload.jti}`, 24 * 60 * 60, "1");
  return { email: data.email, password: data.passwordHash, role: data.role };
};

/**
 * Logs out a user by invalidating their refresh token.
 * @param {string} token - Refresh token.
 * @returns {Promise<boolean>}
 */
const logoutToken = async (token) => {
  const decoded = await validateRefreshToken(token);
  await redis.del(`refresh:${decoded.jti}`);
  return true;
};

export {
  getUserPayload,
  generateTokens,
  rotateRefreshToken,
  validateVerifyToken,
  createVerifyToken,
  logoutToken,
};
