// External libraries
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

// Internal config & utilities
import config from "../config/envManager.js";
import { httpError } from "../utility/httpUtility.js";

// Resources
import prisma from "../resource/prisma.js";
import redis from "../resource/redis.js";

const { jwt_secret: JWT_SECRET, jwt_secret_2: JWT_SECRET_2 } = config;

const ACCESS_EXPIRY = "30m";
const REFRESH_EXPIRY = "7d";

const getUserPayload = (authHeader) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    httpError(401, "Missing token");
  }
  const token = authHeader.split(" ")[1];
  const decoded = validateAccessToken(token);
  return { id: decoded.userId, role: decoded.role };
};

const createAccessToken = (userId, email, role) => {
  const payload = { userId, email, role };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRY });
};

const validateAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    httpError(401, "Invalid or expired access token");
  }
};

const createRefreshToken = (userId) => {
  const jti = uuidv4();
  const payload = { userId, jti };

  return jwt.sign(payload, JWT_SECRET_2, { expiresIn: REFRESH_EXPIRY });
};

const validateRefreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET_2);

    const exists = await redis.get(`refresh:${decoded.jti}`);
    if (!exists) {
      httpError(401, "Refresh token revoked or already used");
    }

    return decoded;
  } catch {
    httpError(401, "Invalid or expired refresh token");
  }
};

const saveRefreshToken = async (jti, userId, exp) => {
  const ttl = exp - Math.floor(Date.now() / 1000);
  await redis.setex(`refresh:${jti}`, ttl, userId.toString());
};

const rotateRefreshToken = async (oldToken) => {
  const decoded = await validateRefreshToken(oldToken);
  if (!decoded) httpError(401, "Invalid refresh token");

  await redis.del(`refresh:${decoded.jti}`);
  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user) httpError(401, "User not found");

  const accessToken = createAccessToken(user.id, user.email, user.role);
  const refreshToken = createRefreshToken(user.id);

  const newDecoded = jwt.decode(refreshToken);
  await saveRefreshToken(newDecoded.jti, newDecoded.userId, newDecoded.exp);

  return { accessToken, refreshToken };
};

const createVerifyToken = async (email, passwordHash, role) => {
  const jti = randomBytes(32).toString("base64url");

  await redis.set(
    `verify:${jti}`,
    JSON.stringify({ email, passwordHash, role }),
    "EX",
    15 * 60,
  );

  const token = jwt.sign(
    { sub: email, jti, purpose: "email-verify" },
    JWT_SECRET_2,
    { expiresIn: "15m" },
  );
  return token;
};

const generateTokens = async (id, email, role) => {
  const accessToken = createAccessToken(id, email, role);
  const refreshToken = createRefreshToken(id);

  const decoded = jwt.decode(refreshToken);
  await saveRefreshToken(decoded.jti, id, decoded.exp);

  return { accessToken, refreshToken };
};

const validateVerifyToken = async (token) => {
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET_2);
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      httpError(400, "Invalid or malformed token");
    }
    if (err.name === "TokenExpiredError") {
      httpError(400, "Token expired");
    }
    throw err;
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
    httpError(400, "Token missing or used");
  }

  let data;
  try {
    data = JSON.parse(pendingStr);
  } catch {
    httpError(400, "Corrupted token");
  }

  const { email, passwordHash, role } = data;
  if (email !== payload.sub) {
    httpError(401, "Email mismatch");
  }

  await redis.setex(`used:${payload.jti}`, 24 * 60 * 60, "1");
  return { email, password: passwordHash, role };
};

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
