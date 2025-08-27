const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_SECRET_2 = process.env.JWT_SECRET_2;
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
    const error = new Error("Invalid or expired token");
    error.statusCode = 401;
    throw error;
  }
};

const getUserPayload = async (authHeader) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const error = new Error("Missing token");
    error.statusCode = 401;
    throw error;
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
