// External libraries
import bcrypt from "bcrypt";

// Internal core modules
import prisma from "../resource/prisma.js";
import config from "../config/envManager.js";
import logger from "../utility/logger.js";
import { httpError } from "../utility/httpUtility.js";

// Token & authentication services
import {
  validateVerifyToken,
  createVerifyToken,
  generateTokens,
  rotateRefreshToken,
  logoutToken,
} from "./tokenService.js";

// Email services
import {
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../service/emailService.js";

// OAuth providers
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

  const hashedPassword = await bcrypt.hash(password, 10);

  logger.info(hashedPassword);
  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    httpError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateTokens(
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

  const token = await createVerifyToken(email, hashedPassword, role);

  const url = `${FRONTEND_CLIENT}/verify?token=${encodeURIComponent(token)}`;
  await sendVerificationEmail(email, url);
  return { message: "Verification email sent" };
};

const verifyUser = async (token) => {
  const { email, password, role } = await validateVerifyToken(token);
  const user = await prisma.user.create({
    data: { email, password, role },
  });
  await sendWelcomeEmail(email);
  return user;
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

  const { accessToken, refreshToken } = await generateTokens(
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

  const { accessToken, refreshToken } = await generateTokens(
    user.id,
    user.email,
    user.role,
  );
  return { accessToken, refreshToken, role: user.role, id: user.id };
};

const generateNewTokens = async (oldToken) => {
  const { accessToken, refreshToken } = await rotateRefreshToken(oldToken);

  return { accessToken, refreshToken };
};

const authLogout = async (token) => {
  return logoutToken(token);
};

export {
  signupUser,
  loginUser,
  verifyUser,
  generateNewTokens,
  verifyMicrosoftIdTokenAndSignIn,
  loginOrCreateFromGoogle,
  signupUserWOVerify,
  authLogout,
};
