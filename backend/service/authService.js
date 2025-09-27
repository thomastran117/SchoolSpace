import bcrypt from "bcrypt";
import prisma from "../resource/prisma.js";
import {
  createAccessToken,
  validateRefreshToken,
  generateTokens,
  rotateRefreshToken,
} from "./tokenService.js";
import redis from "../resource/redis.js";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../service/emailService.js";
import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import { httpError } from "../utility/httpUtility.js";
import config from "../config/envManager.js";
import { verifyMicrosoftIdToken } from "./oauth/microsoftService.js";
import * as googleService from "./oauth/googleService.js";

const { frontend_client: FRONTEND_CLIENT, jwt_secret_2: JWT_SECRET_2 } = config;

const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    httpError(401, "Invalid credentials");
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    httpError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = generateTokens(
    user.id,
    user.email,
    user.role,
  );
  return { accessToken, refreshToken, role: user.role, id: user.id };
};

const signupUser = async (email, password, role) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    httpError(409, "Email already in use");
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
    JWT_SECRET_2,
    { expiresIn: "15m" },
  );

  const url = `${FRONTEND_CLIENT}/verify?token=${encodeURIComponent(token)}`;
  await sendVerificationEmail(email, url);
  return { message: "Verification email sent" };
};

const verifyUser = async (token) => {
  const payload = jwt.verify(token, JWT_SECRET_2);
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

  try {
    const user = await prisma.user.create({
      data: { email, password: passwordHash, role },
    });
    await sendWelcomeEmail(email);
    return user;
  } catch (e) {
    if (e && e.code === "P2002") return { message: "Already verified" };
    httpError(400, "Token unable to be used");
  } finally {
    await redis.setex(`used:${payload.jti}`, 24 * 60 * 60, "1");
  }
};

const verifyMicrosoftIdTokenAndSignIn = async (idToken) => {
  const claims = await verifyMicrosoftIdToken(idToken);

  const microsoftSub = claims.sub || claims.oid;
  const email = claims.email || claims.preferred_username;
  const name = claims.name || "";

  if (!email) throw httpError(400, "Microsoft email missing");
  if (!microsoftSub) throw httpError(400, "Microsoft subject missing");

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.findFirst({
      where: { microsoftId: microsoftSub },
    });
  }

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name,
        provider: "microsoft",
        password: null,
        microsoftId: microsoftSub,
        role: "notdefined",
      },
    });
  } else if (!user.microsoftId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        microsoftId: microsoftSub,
        provider: "microsoft",
        name: user.name || name,
      },
    });
  }

  const { accessToken, refreshToken } = generateTokens(
    user.id,
    user.email,
    user.role,
  );
  return { accessToken, refreshToken, role: user.role, id: user.id };
};

const loginOrCreateFromGoogle = async (googleToken) => {
  const googleUser = await googleService.verifyGoogleToken(googleToken);

  if (!googleUser?.email) {
    httpError(401, "Invalid Google token");
  }

  let user = await prisma.user.findUnique({
    where: { email: googleUser.email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: googleUser.email,
        name: googleUser.name,
        avatar: googleUser.picture,
        googleId: googleUser.sub,
        provider: "google",
      },
    });
  }

  const { accessToken, refreshToken } = generateTokens(
    user.id,
    user.email,
    user.role,
  );
  return { accessToken, refreshToken, role: user.role, id: user.id };
};

const signupUserWOVerify = async (email, password, role) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    httpError(409, "Email already in use");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password: hashedPassword, role },
  });

  return user;
};

const generateRefreshToken = async (oldToken, res) => {
  const decoded = validateRefreshToken(oldToken);
  if (!decoded) {
    httpError(401, "Invalid refresh token");
  }

  const newAccessToken = createAccessToken(
    decoded.userId,
    decoded.email,
    decoded.role,
  );
  const newRefreshToken = rotateRefreshToken(decoded.userId, decoded.exp);

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({ accessToken: newAccessToken });
};

export {
  signupUser,
  loginUser,
  verifyUser,
  generateRefreshToken,
  verifyMicrosoftIdTokenAndSignIn,
  loginOrCreateFromGoogle,
  signupUserWOVerify,
};
