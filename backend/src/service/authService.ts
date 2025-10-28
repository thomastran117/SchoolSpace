/**
 * @file authService.ts
 * @description
 * Handles all user authentication and registration logic — including
 * email/password, Google/Microsoft OAuth, and JWT lifecycle management.
 *
 * @module service
 * @version 1.0.0
 * @auth Thomas
 */

import bcrypt from "bcrypt";
import prisma from "../resource/prisma";
import type { Role } from "@prisma/client";
import config from "../config/envManager";
import logger from "../utility/logger";
import { httpError } from "../utility/httpUtility";

// Token service imports
import {
  validateVerifyToken,
  createVerifyToken,
  generateTokens,
  rotateRefreshToken,
  logoutToken,
} from "./tokenService";

// Email service imports
import {
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../service/emailService";

// OAuth services
import { verifyMicrosoftIdToken } from "./oauth/microsoftService";
import { verifyGoogleToken, verifyGoogleCaptcha } from "./oauth/googleService";

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  role: string;
  id: number;
  username?: string | null;
  avatar?: string | null;
}

const { frontend_client: FRONTEND_CLIENT } = config;

const loginUser = async (
  email: string,
  password: string,
  remember: boolean,
  captcha: string,
): Promise<AuthResponse> => {
  if (config.isCaptchaEnabled()) {
    const result = await verifyGoogleCaptcha(captcha ?? "");
    if (!result) httpError(401, "Invalid captcha");
  } else {
    logger.warn("Google Captcha is not available");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) httpError(401, "Invalid credentials");

  if (!user.password) httpError(401, "This account uses OAuth login only");

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) httpError(401, "Invalid credentials");

  const { accessToken, refreshToken } = await generateTokens(
    user.id,
    user.username || user.email,
    user.role,
    user.avatar ?? undefined,
    remember,
  );

  return {
    accessToken,
    refreshToken,
    role: user.role,
    id: user.id,
    username: user.username,
    avatar: user.avatar,
  };
};

/**
 * Registers user and sends verification email.
 */
const signupUser = async (
  email: string,
  password: string,
  role: string,
  captcha: string,
): Promise<boolean> => {
  if (config.isCaptchaEnabled()) {
    const result = await verifyGoogleCaptcha(captcha ?? "");
    if (!result) httpError(401, "Invalid captcha");
  } else {
    logger.warn("Google Captcha is not available");
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) httpError(409, "Email already in use");

  const hashedPassword = await bcrypt.hash(password, 10);
  const token = await createVerifyToken(email, hashedPassword, role);

  if (config.isEmailEnabled()) {
    const url = `${FRONTEND_CLIENT}/auth/verify?token=${encodeURIComponent(
      token,
    )}`;
    await sendVerificationEmail(email, url);
  } else {
    logger.warn("Email verification is not available");
    await prisma.user.create({
      data: { email, password: hashedPassword, role: role as Role },
    });
  }

  return true;
};

/**
 * Verifies email verification token and creates user account.
 */
const verifyUser = async (token: string) => {
  const { email, password, role } = await validateVerifyToken(token);
  const user = await prisma.user.create({
    data: { email, password, role: role as Role },
  });

  if (config.isEmailEnabled()) {
    await sendWelcomeEmail(email);
  }

  return user;
};

/**
 * Authenticates or registers user via Microsoft OAuth.
 */
const verifyMicrosoftIdTokenAndSignIn = async (
  idToken: string,
): Promise<AuthResponse> => {
  const claims = await verifyMicrosoftIdToken(idToken);

  const microsoftSub = (claims as any).sub || (claims as any).oid;
  const email = (claims as any).email || (claims as any).preferred_username;
  const name = (claims as any).name || "";

  if (!email) httpError(400, "Microsoft email missing");
  if (!microsoftSub) httpError(400, "Microsoft subject missing");

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
    user.username || user.email,
    user.role,
    user.avatar ?? undefined,
  );

  return {
    accessToken,
    refreshToken,
    role: user.role,
    id: user.id,
    username: user.username || user.email,
    avatar: user.avatar,
  };
};

const loginOrCreateFromGoogle = async (
  googleToken: string,
): Promise<AuthResponse> => {
  const googleUser = await verifyGoogleToken(googleToken);
  if (!googleUser?.email) httpError(401, "Invalid Google token");

  let user = await prisma.user.findUnique({
    where: { email: googleUser.email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: googleUser.email!,
        name: googleUser.name,
        avatar: googleUser.picture,
        googleId: googleUser.sub,
        provider: "google",
        role: "notdefined",
      },
    });
  }

  const { accessToken, refreshToken } = await generateTokens(
    user.id,
    user.username || user.email,
    user.role,
    user.avatar ?? undefined,
  );

  return {
    accessToken,
    refreshToken,
    role: user.role,
    id: user.id,
    username: user.username || user.email,
    avatar: user.avatar,
  };
};

/**
 * Rotates refresh token and issues new tokens.
 */
const generateNewTokens = async (
  oldToken: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
  role: string;
  username: string;
  avatar?: string;
}> => {
  const { accessToken, refreshToken, role, username, avatar } =
    await rotateRefreshToken(oldToken);
  return { accessToken, refreshToken, role, username, avatar };
};

/**
 * Logs out user by invalidating refresh token.
 */
const authLogout = async (token: string): Promise<boolean> => {
  return await logoutToken(token);
};

export {
  loginUser,
  signupUser,
  verifyUser,
  verifyMicrosoftIdTokenAndSignIn,
  loginOrCreateFromGoogle,
  generateNewTokens,
  authLogout,
};
