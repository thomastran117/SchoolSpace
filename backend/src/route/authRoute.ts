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
import container from "../resource/container";
import { validate } from "../middleware/validateMiddleware";
import {
  LoginSchema,
  SignupSchema,
  MicrosoftSchema,
  GoogleSchema,
} from "../dto/authSchema";
import { AuthController } from "../controller/authController";
const router: Router = express.Router();
const authController: AuthController = container.authController;

/**
 * @route POST /auth/login
 * @description Logs in a user with email and password.
 * @access Public
 */
router.post("/login", validate(LoginSchema), authController.localAuthenticate);

/**
 * @route POST /auth/signup
 * @description Registers a new user with email and password.
 * @access Public
 */
router.post("/signup", validate(SignupSchema), authController.localSignup);

/**
 * @route GET /auth/verify
 * @description Verifies a user's email address via a token.
 * @access Public
 */
router.get("/verify", authController.localVerifyEmail);

/**
 * @route POST /auth/microsoft/verify
 * @description Initiates Microsoft OAuth login flow.
 * @access Public
 */
router.post(
  "/microsoft/verify",
  validate(MicrosoftSchema),
  authController.microsoftAuthenticate,
);

/**
 * @route POST /auth/google/verify
 * @description Initiates Google OAuth login flow.
 * @access Public
 */
router.post(
  "/google/verify",
  validate(GoogleSchema),
  authController.googleAuthenticate,
);

/**
 * @route GET /auth/refresh
 * @description Refreshes access token
 * @access Public
 */
router.get("/refresh", authController.refreshAccessToken);

/**
 * @route GET /auth/logout
 * @description Clears refresh token
 * @access Public
 */
router.post("/logout", authController.logoutRefreshToken);

// Export the router
export default router;
