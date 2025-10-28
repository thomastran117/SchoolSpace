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
  verifyMicrosoftIdTokenAndSignIn,
  loginOrCreateFromGoogle,
  generateNewTokens,
  authLogout,
} from "../service/authService";

// Utilities
import logger from "../utility/logger";
import config from "../config/envManager";
import {
  requireFields,
  httpError,
  assertAllowed,
  sendCookie,
} from "../utility/httpUtility";
import {
  isBoolean,
  validateEmail,
} from "../utility/validateUtility";

/* -------------------------------------------------------------
 * Controllers
 * ----------------------------------------------------------- */

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    requireFields(["email", "password", "captcha"], req.body);
    const { email, password, remember, captcha } = req.body;

    if (!validateEmail(email)) httpError(400, "Invalid email format");

    const rememberBool = isBoolean(remember);

    const {
      accessToken,
      refreshToken,
      role,
      username,
      avatar,
    } = await loginUser(email, password, rememberBool, captcha );

    sendCookie(res, refreshToken);

    res.status(200).json({
      message: "Login successful",
      accessToken,
      role,
      avatar,
      username,
    });
  } catch (err) {
    next(err);
  }
};

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    requireFields(["email", "password", "role", "captcha"], req.body);
    const { email, password, role, captcha } = req.body;

    assertAllowed(role, ["student", "teacher", "assistant"], "role");
    if (!validateEmail(email)) httpError(400, "Invalid email format");

    await signupUser( email, password, role, captcha );

    res.status(201).json({ message: "Email sent. Please verify." });
  } catch (err) {
    next(err);
  }
};

export const verify_email = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!config.isEmailEnabled()) {
      logger.warn("Email verification is not available");
      httpError(
        503,
        "Email verification is not available. You don't need to access this route at this time."
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

export const microsoftVerify = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!config.isMicrosoftEnabled()) {
      logger.warn("Microsoft OAuth is not available");
      httpError(
        503,
        "Microsoft OAuth is not available. Please use another login method."
      );
    }

    const { id_token: idToken } = req.body ?? {};
    if (!idToken) httpError(400, "Missing id_token");

    const {
      accessToken,
      refreshToken,
      role,
      username,
      avatar,
    } = await verifyMicrosoftIdTokenAndSignIn(idToken);

    sendCookie(res, refreshToken);

    res.status(200).json({
      message: "Login successful",
      accessToken,
      role,
      avatar,
      username,
    });
  } catch (err) {
    next(err);
  }
};

export const googleVerify = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token: googleToken } = req.body;
    if (!googleToken) httpError(400, "Google token missing");

    const {
      accessToken,
      refreshToken,
      role,
      username,
      avatar,
    } = await loginOrCreateFromGoogle(googleToken);

    sendCookie(res, refreshToken);

    res.status(200).json({
      message: "Login successful",
      accessToken,
      role,
      avatar,
      username,
    });
  } catch (err) {
    next(err);
  }
};

export const newAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) httpError(401, "Missing refresh token");

    const {
      accessToken,
      refreshToken,
      role,
      username,
      avatar,
    } = await generateNewTokens(token);

    sendCookie(res, refreshToken);

    res.status(200).json({
      accessToken,
      role,
      avatar,
      username,
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
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
