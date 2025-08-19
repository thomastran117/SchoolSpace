const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_SECRET_2 = process.env.JWT_SECRET_2;
const JWT_EXPIRY = "6h";

const createToken = async (userId, email, role) => {
  const payload = { userId, email, role };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

const getUserPayload = async (authHeader) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const error = new Error("Missing token");
    error.statusCode = 401;
    throw error;
  }

  const token = authHeader.split(" ")[1];
  const { userId, role } = await validateToken(token);
  return { id: userId, role };
};

const validateToken = async (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (err) {
    const error = new Error("Invalid or expired token");
    error.statusCode = 401;
    throw error;
  }
};


module.exports = {
  getUserPayload,
  createToken
};