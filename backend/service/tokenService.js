const jwt = require("jsonwebtoken");
const { httpError } = require("../utility/httpUtility");
const config = require("../config/envManager");

const { jwt_secret: JWT_SECRET, jwt_secret_2: JWT_SECRET_2 } = config;

const JWT_EXPIRY = "6h";
const JWT_EXPIRY_2 = "30m";
const VERIFY_EXP_MINUTES = 60;

const createToken = async (userId, email, role) => {
  const payload = { userId, email, role };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

const validateToken = async (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    httpError(401, "Invalid or expired token");
  }
};

const getUserPayload = async (authHeader) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    httpError(401, "Missing token");
  }
  const token = authHeader.split(" ")[1];
  const decoded = await validateToken(token);
  return { id: decoded.userId, role: decoded.role };
};

module.exports = {
  createToken,
  getUserPayload,
  validateToken,
};
