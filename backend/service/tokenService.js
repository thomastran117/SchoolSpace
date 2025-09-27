import jwt from "jsonwebtoken";
import { httpError } from "../utility/httpUtility.js";
import config from "../config/envManager.js";
import { v4 as uuidv4 } from "uuid";
import redis from "../resource/redis.js";

const { jwt_secret: JWT_SECRET, jwt_secret_2: JWT_SECRET_2 } = config;

const ACCESS_EXPIRY = "30m";
const REFRESH_EXPIRY = "7d";

const createAccessToken = (userId, email, role) => {
  const payload = { userId, email, role };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRY });
};

const createRefreshToken = (userId, exp) => {
  const jti = uuidv4();
  const payload = { userId, jti };

  const options = exp
    ? { expiresIn: Math.floor(exp - Date.now() / 1000) }
    : { expiresIn: REFRESH_EXPIRY };

  return jwt.sign(payload, JWT_SECRET_2, options);
};

const saveRefreshToken = async (jti, userId, exp) => {
  const ttl = exp - Math.floor(Date.now() / 1000);
  await redis.setex(`refresh:${jti}`, ttl, userId.toString());
};

const validateAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    httpError(401, "Invalid or expired access token");
  }
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

const getUserPayload = (authHeader) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    httpError(401, "Missing token");
  }
  const token = authHeader.split(" ")[1];
  const decoded = validateAccessToken(token);
  return { id: decoded.userId, role: decoded.role };
};

const generateTokens = async (id, email, role) => {
  const accessToken = createAccessToken(id, email, role);
  const refreshToken = createRefreshToken(id);

  const decoded = jwt.decode(refreshToken);
  await saveRefreshToken(decoded.jti, id, decoded.exp);

  return { accessToken, refreshToken };
};

const rotateRefreshToken = async (oldToken) => {
  const decoded = await validateRefreshToken(oldToken);

  await redis.del(`refresh:${decoded.jti}`);

  const accessToken = createAccessToken(decoded.userId, decoded.email, decoded.role);
  const refreshToken = createRefreshToken(decoded.userId, decoded.exp);

  const newDecoded = jwt.decode(refreshToken);
  await saveRefreshToken(newDecoded.jti, decoded.userId, newDecoded.exp);

  return { accessToken, refreshToken };
};

export {
  createAccessToken,
  createRefreshToken,
  validateAccessToken,
  validateRefreshToken,
  getUserPayload,
  generateTokens,
  rotateRefreshToken
};
