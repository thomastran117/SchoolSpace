/**
 * @file authRoute.js
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
const express = require("express");
const {
  login,
  signup,
  microsoftStart,
  microsoftCallback,
  verify_email,
  googleStart,
  googleCallback,
  updateRole,
} = require("../controller/authController");

const router = express.Router();

/**
 * @route POST /auth/login
 * @description Logs in a user with email and password.
 * @access Public
 */
router.post("/login", login);

/**
 * @route POST /auth/signup
 * @description Registers a new user with email and password.
 * @access Public
 */
router.post("/signup", signup);

/**
 * @route PUT /auth/role
 * @description Updates an OAuth user with their designated role
 * @access Private
 */
router.put("/role", updateRole);

/**
 * @route GET /auth/verify
 * @description Verifies a user's email address via a token.
 * @access Public
 */
router.get("/verify", verify_email);

/**
 * @route GET /auth/microsoft/start
 * @description Initiates Microsoft OAuth login flow.
 * @access Public
 */
router.get("/microsoft/start", microsoftStart);

/**
 * @route GET /auth/microsoft/callback
 * @description Handles Microsoft OAuth callback and token exchange.
 * @access Public
 */
router.get("/microsoft/callback", microsoftCallback);

/**
 * @route GET /auth/google/start
 * @description Initiates Google OAuth login flow.
 * @access Public
 */
router.get("/google/start", googleStart);

/**
 * @route GET /auth/google/callback
 * @description Handles Google OAuth callback and token exchange.
 * @access Public
 */
router.get("/google/callback", googleCallback);

// Export the router
module.exports = router;
