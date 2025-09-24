import jwt from "jsonwebtoken";
import { httpError } from "../utility/httpUtility.js";
import config from "../config/envManager.js";

const { jwt_secret: JWT_SECRET, jwt_secret_2: JWT_SECRET_2 } = config;

const ACCESS_EXPIRY = "30m";
const REFRESH_EXPIRY = "7d";

const createAccessToken = (userId, email, role) => {
  const payload = { userId, email, role };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRY });
};

const createRefreshToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET_2, { expiresIn: REFRESH_EXPIRY });
};

const validateAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    httpError(401, "Invalid or expired access token");
  }
};

const validateRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET_2);
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

export {
  createAccessToken,
  createRefreshToken,
  validateAccessToken,
  validateRefreshToken,
  getUserPayload,
};
