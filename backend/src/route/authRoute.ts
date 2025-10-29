/**
 * @file auth-route.ts
 * @description Defines all authentication-related routes (login, signup, OAuth providers, email verification).
 *
 * @module route
 *
 * @version 1.0.0
 * @author Thomas
 */

/**
 * Imports
 */
import express, { Router } from "express";
import {
  login,
  signup,
  microsoftVerify,
  verify_email,
  googleVerify,
  newAccessToken,
  logout,
} from "../controller/authController";
import { validate } from "../middleware/validateMiddleware";
import {
  LoginSchema,
  SignupSchema,
  MicrosoftSchema,
  GoogleSchema,
} from "../dto/authSchema";

const router: Router = express.Router();

/**
 * @route POST /auth/login
 * @description Logs in a user with email and password.
 * @access Public
 */
router.post("/login", validate(LoginSchema), login);

/**
 * @route POST /auth/signup
 * @description Registers a new user with email and password.
 * @access Public
 */
router.post("/signup", validate(SignupSchema), signup);

/**
 * @route GET /auth/verify
 * @description Verifies a user's email address via a token.
 * @access Public
 */
router.get("/verify", verify_email);

/**
 * @route POST /auth/microsoft/verify
 * @description Initiates Microsoft OAuth login flow.
 * @access Public
 */
router.post("/microsoft/verify", validate(MicrosoftSchema), microsoftVerify);

/**
 * @route POST /auth/google/verify
 * @description Initiates Google OAuth login flow.
 * @access Public
 */
router.post("/google/verify", validate(GoogleSchema), googleVerify);

/**
 * @route GET /auth/refresh
 * @description Refreshes access token
 * @access Public
 */
router.get("/refresh", newAccessToken);

/**
 * @route GET /auth/logout
 * @description Clears refresh token
 * @access Public
 */
router.post("/logout", logout);

// Export the router
export default router;
