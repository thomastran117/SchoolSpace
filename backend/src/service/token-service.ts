/**
 * @file Tok.ts
 * @description
 * Handles JWT lifecycle — access, refresh, and email verification tokens:
 * - Access/refresh generation & validation
 * - Token rotation and revocation
 * - Email verification token creation and consumption
 *
 * @module service
 * @version 1.0.0
 * @auth Thomas
 */

import jwt, { JwtPayload } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { randomBytes } from "crypto";
import config from "../config/envManager";
import { httpError } from "../utility/httpUtility";
import redis from "../resource/redis";
import {
  TokenPayloadBase,
  RefreshTokenPayload,
  VerifyTokenPayload,
  UserPayload,
} from "../models/token";
const {
  jwt_secret_access: JWT_SECRET_ACCESS,
  jwt_secret_refresh: JWT_SECRET_REFRESH,
  jwt_secret_verify: JWT_SECRET_VERIFY,
} = config;

const ACCESS_EXPIRY = "30m";
const SHORT_REFRESH_EXPIRY = "1d";
const LONG_REFRESH_EXPIRY = "7d";

/**
 * Extracts user payload (id, role) from Authorization header.
 */
function getUserPayload(authHeader: string): UserPayload {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    httpError(401, "Missing token");
  }

  const token = authHeader.split(" ")[1];
  const decoded = validateAccessToken(token);
  return { id: decoded.userId, role: decoded.role, email: decoded.username };
}

/**
 * Generates new access + refresh token pair and persists refresh in Redis.
 */
async function generateTokens(
  id: number,
  username: string,
  role: string,
  avatar?: string,
  remember?: boolean,
): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = createAccessToken(id, username, role, avatar);
  const refreshToken = createRefreshToken(id, username, role, avatar, remember);

  const decoded = jwt.decode(refreshToken) as RefreshTokenPayload;
  await saveRefreshToken(decoded.jti, id, decoded.exp);

  return { accessToken, refreshToken };
}

function createAccessToken(
  userId: number,
  username: string,
  role: string,
  avatar?: string,
): string {
  const payload = { userId, username, role, avatar };
  return jwt.sign(payload, JWT_SECRET_ACCESS, { expiresIn: ACCESS_EXPIRY });
}

function createRefreshToken(
  userId: number,
  username: string,
  role: string,
  avatar?: string,
  remember?: boolean,
): string {
  const jti = uuidv4();
  const payload: TokenPayloadBase & { jti: string } = {
    userId,
    username,
    role,
    avatar,
    remember,
    jti,
  };
  const expiresIn = remember ? LONG_REFRESH_EXPIRY : SHORT_REFRESH_EXPIRY;
  return jwt.sign(payload, JWT_SECRET_REFRESH, { expiresIn });
}

function validateAccessToken(token: string): TokenPayloadBase {
  try {
    return jwt.verify(token, JWT_SECRET_ACCESS) as TokenPayloadBase;
  } catch (err: any) {
    if (err.name === "TokenExpiredError")
      httpError(401, "Expired access token");
    httpError(401, "Invalid access token");
  }
}

async function validateRefreshToken(
  token: string,
): Promise<RefreshTokenPayload> {
  try {
    const decoded = jwt.verify(
      token,
      JWT_SECRET_REFRESH,
    ) as RefreshTokenPayload;
    const exists = await redis.get(`refresh:${decoded.jti}`);
    if (!exists) {
      httpError(401, "Refresh token revoked or already used");
    }
    return decoded;
  } catch (err: any) {
    if (err.name === "TokenExpiredError")
      httpError(401, "Expired refresh token");
    httpError(401, "Invalid refresh token");
  }
}

async function saveRefreshToken(
  jti: string,
  userId: number,
  exp: number,
): Promise<void> {
  const ttl = exp - Math.floor(Date.now() / 1000);
  await redis.setex(`refresh:${jti}`, ttl, userId.toString());
}

async function rotateRefreshToken(oldToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  role: string;
  username: string;
  avatar?: string;
  id: number;
}> {
  const decoded = await validateRefreshToken(oldToken);
  await redis.del(`refresh:${decoded.jti}`);

  const accessToken = createAccessToken(
    decoded.userId,
    decoded.username,
    decoded.role,
  );
  const refreshToken = createRefreshToken(
    decoded.userId,
    decoded.username,
    decoded.role,
    decoded.avatar,
    decoded.remember,
  );

  const newDecoded = jwt.decode(refreshToken) as RefreshTokenPayload;
  await saveRefreshToken(newDecoded.jti, decoded.userId, newDecoded.exp);

  return {
    accessToken,
    refreshToken,
    role: decoded.role,
    username: decoded.username,
    avatar: decoded.avatar,
    id: decoded.userId,
  };
}

/**
 * Creates a short-lived verification token for email confirmation.
 * Stores verification data in Redis for later retrieval.
 */
async function createVerifyToken(
  email: string,
  passwordHash: string,
  role: string,
): Promise<string> {
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
    { expiresIn: "15m" },
  );
}

/**
 * Validates and consumes a verification token.
 */
async function validateVerifyToken(
  token: string,
): Promise<{ email: string; password: string; role: string }> {
  let payload: VerifyTokenPayload;
  try {
    payload = jwt.verify(token, JWT_SECRET_VERIFY) as VerifyTokenPayload;
  } catch (err: any) {
    if (err.name === "TokenExpiredError")
      httpError(400, "Expired verify token");
    httpError(400, "Invalid verify token");
  }

  if (payload.purpose !== "email-verify") {
    httpError(400, "Invalid token purpose");
  }

  let pendingStr: string | null = null;
  if (typeof (redis as any).getdel === "function") {
    pendingStr = await (redis as any).getdel(`verify:${payload.jti}`);
  } else {
    const [[, val]] = await (redis as any)
      .multi()
      .get(`verify:${payload.jti}`)
      .del(`verify:${payload.jti}`)
      .exec();
    pendingStr = val;
  }

  if (!pendingStr) {
    httpError(400, "Token missing or already used");
  }

  const data = JSON.parse(pendingStr) as {
    email: string;
    passwordHash: string;
    role: string;
  };

  if (data.email !== payload.sub) {
    httpError(401, "Email mismatch");
  }

  await redis.setex(`used:${payload.jti}`, 24 * 60 * 60, "1");
  return { email: data.email, password: data.passwordHash, role: data.role };
}

/**
 * Logs out a user by invalidating their refresh token.
 */
async function logoutToken(token: string): Promise<boolean> {
  const decoded = await validateRefreshToken(token);
  await redis.del(`refresh:${decoded.jti}`);
  return true;
}

export {
  getUserPayload,
  generateTokens,
  rotateRefreshToken,
  validateVerifyToken,
  createVerifyToken,
  logoutToken,
};
