const bcrypt = require("bcrypt");
const prisma = require("../resource/prisma");
const { createToken } = require("./tokenService");
const microsoftOAuth = require("./oauth/microsoftService");
const googleOAuth = require("./oauth/googleService");
const redis = require("../resource/redis");
const { sendEmail } = require("../service/emailService");
const { randomBytes } = require("crypto");
const jwt = require("jsonwebtoken");

const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const token = await createToken(user.id, user.email, user.role);
  return { token: token, role: user.role };
};

const signupUser = async (email, password, role) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const error = new Error("User already exists");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const jti = randomBytes(32).toString("base64url");

  await redis.set(
    `verify:${jti}`,
    JSON.stringify({ email, passwordHash: hashedPassword, role }),
    "EX",
    15 * 60,
  );

  const token = jwt.sign(
    { sub: email, jti, purpose: "email-verify" },
    process.env.JWT_SECRET_2,
    { expiresIn: "15m" },
  );

  const url = `${process.env.FRONTEND_CLIENT}/verify?token=${encodeURIComponent(token)}`;
  await sendEmail(email, url);
  return { message: "Verification email sent" };
};

const verifyUser = async (token) => {
  const payload = jwt.verify(token, process.env.JWT_SECRET_2);
  if (payload.purpose !== "email-verify") {
    const error = new Error("Invalid token purpose");
    error.statusCode = 400;
    throw error;
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
    const error = new Error("Token missing or used");
    error.statusCode = 400;
    throw error;
  }

  let data;
  try {
    data = JSON.parse(pendingStr);
  } catch {
    const error = new Error("Corrupted token state");
    error.statusCode = 400;
    throw error;
  }

  const { email, passwordHash, role } = data;
  if (email !== payload.sub) {
    const error = new Error("Email mismatched");
    error.statusCode = 401;
    throw error;
  }

  try {
    const user = await prisma.user.create({
      data: { email, password: passwordHash, role },
    });
    return user;
  } catch (e) {
    if (e && e.code === "P2002") return { message: "Already verified" };
    const error = new Error("Token unable to be used");
    error.statusCode = 400;
    throw error;
  } finally {
    await redis.setex(`used:${payload.jti}`, 24 * 60 * 60, "1");
  }
};

const startMicrosoftOAuth = async () => {
  return microsoftOAuth.start();
};

const finishMicrosoftOAuth = async (callbackParams, expected) => {
  const profile = await microsoftOAuth.finish(callbackParams, expected);
  if (!profile.email) {
    const error = new Error("Microsoft email missing");
    error.statusCode = 400;
    throw error;
  }

  let user = await prisma.user.findUnique({ where: { email: profile.email } });

  if (!user) {
    user = await prisma.user.findFirst({ where: { microsoftId: profile.sub } });
  }

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: profile.email,
        name: profile.name,
        provider: "microsoft",
        password: null,
        microsoftId: profile.sub,
      },
    });
  } else if (!user.microsoftId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        microsoftId: profile.sub,
        provider: "microsoft",
        name: user.name || profile.name,
      },
    });
  }

  const token = await createToken(user.id, user.email, user.role);
  return {
    token,
    role: user.role,
    user: { id: user.id, email: user.email, name: user.name },
  };
};

const startGoogleOAuth = async () => {
  return googleOAuth.start();
};

const finishGoogleOAuth = async (callbackParams, expected) => {
  const { profile } = await googleOAuth.finish(callbackParams, expected);

  let user = await prisma.user.findUnique({ where: { email: profile.email } });

  if (!user) {
    user = await prisma.user.findFirst({ where: { googleId: profile.sub } });
  }

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: profile.email,
        name: profile.name,
        avatar: profile.picture,
        provider: "google",
        password: null,
        googleId: profile.sub,
      },
    });
  } else if (!user.googleId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        googleId: profile.sub,
        provider: "google",
        name: user.name || profile.name,
        avatar: user.avatar || profile.picture,
      },
    });
  }

  const token = await createToken(user.id, user.email, user.role);
  return {
    token,
    role: user.role,
    user: { id: user.id, email: user.email, name: user.name },
  };
};

module.exports = {
  signupUser,
  loginUser,
  verifyUser,
  startMicrosoftOAuth,
  finishMicrosoftOAuth,
  startGoogleOAuth,
  finishGoogleOAuth,
};
