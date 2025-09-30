/**
 * @file authController.js
 * @description Auth Controller file that handles HTTP request, response and calls
 * the proper Auth Service method
 *
 * @module controller
 *
 * @author Thomas
 * @version 1.0.0
 *
 */

// Auth Service Imports
import {
  loginUser,
  signupUser,
  verifyUser,
  signupUserWOVerify,
  verifyMicrosoftIdTokenAndSignIn,
  loginOrCreateFromGoogle,
  generateNewTokens,
  authLogout,
} from "../service/authService.js";

// Internal config & utilities
import logger from "../utility/logger.js";
import config from "../config/envManager.js";
import {
  requireFields,
  httpError,
  assertAllowed,
} from "../utility/httpUtility.js";

/**
 * Handles user login with email/password.
 *
 * @route POST /auth/login
 * @param {import("express").Request} req - Express request (expects email, password).
 * @param {import("express").Response} res - Express response.
 * @param {Function} next - Express error handler.
 */
const login = async (req, res, next) => {
  try {
    requireFields(["email", "password"], req.body);
    const { email, password } = req.body;

    if (!validateEmail(email)) httpError(400, "Invalid email format");

    const { accessToken, refreshToken, role } = await loginUser(
      email,
      password,
    );

    sendCookie(res, refreshToken);

    res.status(200).json({
      message: "Login successful",
      accessToken,
      role,
      email,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Handles new user signup (with or without email verification).
 *
 * @route POST /auth/signup
 */
const signup = async (req, res, next) => {
  try {
    requireFields(["email", "password", "role"], req.body);
    const { email, password, role } = req.body;

    assertAllowed(role, ["student", "teacher", "assistant"]);
    if (!validateEmail(email)) httpError(400, "Invalid email format");

    if (config.isEmailEnabled()) {
      await signupUser(email, password, role);
      res.status(201).json({ message: "Email sent. Please verify." });
    } else {
      await signupUserWOVerify(email, password, role);
      res.status(201).json({ message: "Verification skipped. Please login." });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Verifies email signup via verification token.
 *
 * @route GET /auth/verify
 */
const verify_email = async (req, res, next) => {
  try {
    if (!config.isEmailEnabled()) {
      logger.warn("Email verification is not available");
      httpError(
        503,
        "Email verification is not available. You don't need to access this route at the moment.",
      );
    }

    const { token } = req.query;
    if (!token) httpError(400, "Missing token");

    await verifyUser(token);

    res
      .status(201)
      .json({ message: "User created successfully. Please log in now." });
  } catch (err) {
    next(err);
  }
};

/**
 * Handles Microsoft OAuth login/signup.
 *
 * @route POST /auth/microsoft
 */
const microsoftVerify = async (req, res, next) => {
  try {
    if (!config.isMicrosoftEnabled()) {
      logger.warn("Microsoft OAuth is not available");
      httpError(
        503,
        "Microsoft OAuth is not available. Please use another login method",
      );
    }

    const { id_token: idToken } = req.body || {};
    if (!idToken) httpError(400, "Missing id_token");

    const { accessToken, refreshToken, role, email } =
      await verifyMicrosoftIdTokenAndSignIn(idToken);

    sendCookie(res, refreshToken);

    res.status(200).json({
      message: "Login successful",
      accessToken,
      role,
      email,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Handles Google OAuth login/signup.
 *
 * @route POST /auth/google
 */
const googleVerify = async (req, res, next) => {
  try {
    const { token: googleToken } = req.body;
    if (!googleToken) httpError(400, "Google token missing");

    const { accessToken, refreshToken, role, email } =
      await loginOrCreateFromGoogle(googleToken);

    sendCookie(res, refreshToken);

    res.status(200).json({
      message: "Login successful",
      accessToken,
      role,
      email,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Issues a new access/refresh token pair using refresh token.
 *
 * @route POST /auth/refresh
 */
const newAccessToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) httpError(401, "Missing refresh token");

    const { accessToken, refreshToken, role, email } = await generateNewTokens(token);

    sendCookie(res, refreshToken);

    res.status(200).json({
      accessToken,
      role,
      email,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Logs out the user by invalidating refresh token.
 *
 * @route POST /auth/logout
 */
const logout = async (req, res, next) => {
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
    logger.debug(err);
    next(err);
  }
};

/**
 * Utility: Validates email format.
 *
 * @param {string} email
 * @returns {boolean}
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Utility: Sends refresh token as HTTP-only cookie.
 *
 * @param {import("express").Response} res
 * @param {string} refreshToken
 */
const sendCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
};

export {
  login,
  signup,
  logout,
  microsoftVerify,
  verify_email,
  googleVerify,
  newAccessToken,
};
