/**
 * @file route.js
 * @description Main route file to serve all API routes
 *
 * @module route
 *
 * @author Thomas
 * @version 1.0.0
 *
 */

/**
 * Imports
 */
const express = require("express");
const authRoute = require("./authRoute");
const couresRoute = require("./courseRoute");
const enrollRoute = require("./enrollRoute");
const userRoute = require("./userRoute");
const { makeRequireAuth } = require("../middleware/authConfig");

const router = express.Router();

/**
 * @routse auth
 * @description Handles authentication
 * @access Public
 */
router.use("/auth", authRoute);

// Protected routes, requires authenication
router.use(makeRequireAuth);

/**
 * @routse courses
 * @description Handles courses
 * @access Private
 */
router.use("/courses", couresRoute);

/**
 * @routse enrollment
 * @description Handles course enrolllment
 * @access Private
 */
router.use("/course-enroll", enrollRoute);

/**
 * @routse user
 * @description Handles user management + deletion
 * @access Private
 */
router.use("/user", userRoute);

// Export the function
module.exports = router;
