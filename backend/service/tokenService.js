const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const redis = require("../resource/redis");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_SECRET_2 = process.env.JWT_SECRET_2;
const JWT_EXPIRY = "6h";
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

const nowS = () => Math.floor(Date.now() / 1000);
const genJti = () => crypto.randomBytes(16).toString("hex");

const createVerificationToken = async (email) => {
  const jti = genJti();
  const exp = nowS() + VERIFY_EXP_MINUTES * 60;

  const token = jwt.sign(
    { email, typ: "email_verify", jti, exp, iat: nowS() },
    JWT_SECRET_2,
    { algorithm: "HS256" }
  );

  return { token, jti, exp };
};

const validateVerificationToken = async (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET_2);
    if (decoded.typ !== "email_verify") {
      const err = new Error("Wrong token type");
      err.statusCode = 400;
      throw err;
    }
    return decoded;
  } catch {
    const error = new Error("Invalid or expired verification token");
    error.statusCode = 401;
    throw error;
  }
};

const keyForJti = (jti) => `verify:jti:${jti}`;
const keyForDraft = (jti) => `verify:draft:${jti}`;

async function storeVerificationJti(jti, expUnixSeconds) {
  const ttl = Math.max(1, expUnixSeconds - nowS());
  await redis.set(keyForJti(jti), "1", "EX", ttl, "NX");
}

async function consumeVerificationJti(jti) {
  if (typeof redis.getdel === "function") {
    return Boolean(await redis.getdel(keyForJti(jti)));
  }
  const lua = `
    local v = redis.call("GET", KEYS[1])
    if v then redis.call("DEL", KEYS[1]) end
    return v
  `;
  return Boolean(await redis.eval(lua, 1, keyForJti(jti)));
}

async function storeSignupDraft(jti, draft, expUnixSeconds) {
  const ttl = Math.max(1, expUnixSeconds - nowS());
  await redis.set(keyForDraft(jti), JSON.stringify(draft), "EX", ttl, "NX");
}

async function loadAndConsumeSignupDraft(jti) {
  if (typeof redis.getdel === "function") {
    const s = await redis.getdel(keyForDraft(jti));
    return s ? JSON.parse(s) : null;
  }
  const lua = `
    local v = redis.call("GET", KEYS[1])
    if v then redis.call("DEL", KEYS[1]) end
    return v
  `;
  const s = await redis.eval(lua, 1, keyForDraft(jti));
  return s ? JSON.parse(s) : null;
}

module.exports = {
  createToken,
  getUserPayload,
  validateToken,
  createVerificationToken,
  validateVerificationToken,
  storeVerificationJti,
  consumeVerificationJti,
  storeSignupDraft,
  loadAndConsumeSignupDraft,
};
