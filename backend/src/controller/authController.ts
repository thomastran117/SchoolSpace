/**
 * @file authController.ts
 * @description
 * Handles authentication API requests and responses
 *
 * @module controller
 * @version 1.0.0
 * @auth Thomas
 */

import type { Request, Response, NextFunction } from "express";

// Auth Services
import {
  loginUser,
  signupUser,
  verifyUser,
  microsoftOAuth,
  googleOAuth,
  generateNewTokens,
  authLogout,
} from "../service/auth-service";

// Utilities
import logger from "../utility/logger";
import config from "../config/envManager";
import { httpError, sendCookie } from "../utility/httpUtility";
import { TypedRequest, TypedResponse } from "../types/express";
import {
  LoginDto,
  SignupDto,
  MicrosoftDto,
  GoogleDto,
  AuthResponseDto,
} from "../dto/authSchema";

const localAuthenticate = async (
  req: TypedRequest<LoginDto>,
  res: TypedResponse<AuthResponseDto>,
  next: NextFunction,
) => {
  try {
    const { email, password, remember, captcha } = req.body;

    const rememberFlag = remember ?? false;

    const { accessToken, refreshToken, username, avatar, role } =
      await loginUser(email, password, rememberFlag, captcha);

    sendCookie(res, refreshToken);

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      role,
      avatar: avatar ?? undefined,
      username: username ?? undefined,
    });
  } catch (err) {
    next(err);
  }
};

const localSignup = async (
  req: TypedRequest<SignupDto>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password, role, captcha } = req.body;

    await signupUser(email, password, role, captcha);

    res.status(201).json({ message: "Email sent. Please verify." });
  } catch (err) {
    next(err);
  }
};

const localVerifyEmail = async (
  req: Request<{}, {}, {}>,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!config.isEmailEnabled()) {
      logger.warn("Email verification is not available");
      httpError(
        503,
        "Email verification is not available. You don't need to access this route at this time.",
      );
    }

    const token = req.query.token as string | undefined;
    if (!token) httpError(400, "Missing token");

    await verifyUser(token);

    res.status(201).json({
      message: "User verified — please log in.",
    });
  } catch (err) {
    next(err);
  }
};

const microsoftAuthenticate = async (
  req: TypedRequest<MicrosoftDto>,
  res: TypedResponse<AuthResponseDto>,
  next: NextFunction,
) => {
  try {
    if (!config.isMicrosoftEnabled()) {
      logger.warn("Microsoft OAuth is not available");
      httpError(
        503,
        "Microsoft OAuth is not available. Please use another login method.",
      );
    }

    const { id_token: idToken } = req.body ?? {};
    if (!idToken) httpError(400, "Missing id_token");

    const { accessToken, refreshToken, role, username, avatar } =
      await microsoftOAuth(idToken);

    sendCookie(res, refreshToken);

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      role,
      avatar: avatar ?? undefined,
      username: username ?? undefined,
    });
  } catch (err) {
    next(err);
  }
};

const googleAuthenticate = async (
  req: TypedRequest<GoogleDto>,
  res: TypedResponse<AuthResponseDto>,
  next: NextFunction,
) => {
  try {
    const { id_token: googleToken } = req.body;
    if (!googleToken) httpError(400, "Google token missing");

    const { accessToken, refreshToken, role, username, avatar } =
      await googleOAuth(googleToken);

    sendCookie(res, refreshToken);

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      role,
      avatar: avatar ?? undefined,
      username: username ?? undefined,
    });
  } catch (err) {
    next(err);
  }
};

const refreshAccessToken = async (
  req: Request,
  res: TypedResponse<AuthResponseDto>,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) httpError(401, "Missing refresh token");

    const { accessToken, refreshToken, role, username, avatar } =
      await generateNewTokens(token);

    sendCookie(res, refreshToken);

    return res.status(200).json({
      message: "Granting new access token",
      accessToken,
      role,
      avatar: avatar ?? undefined,
      username: username ?? undefined,
    });
  } catch (err) {
    next(err);
  }
};

const logoutRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(200).json({ message: "Already logged out" });
    }

    await authLogout(token);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};

export {
  localAuthenticate,
  localSignup,
  localVerifyEmail,
  microsoftAuthenticate,
  googleAuthenticate,
  logoutRefreshToken,
  refreshAccessToken,
};
