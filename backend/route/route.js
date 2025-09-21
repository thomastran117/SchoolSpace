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

const express = require("express");
const authRoute = require("./authRoute");
const courseRoute = require("./courseRoute");
const enrollRoute = require("./enrollRoute");
const userRoute = require("./userRoute");
const { makeRequireAuth } = require("../middleware/authTokenMiddleware");
const { httpError } = require("../utility/httpUtility");
const listRoutesFromRouter = require("../utility/listRoutes");

const router = express.Router();

/**
 * @route auth
 * @description Handles authentication
 * @access Public
 */
router.use("/auth", authRoute);

/**
 * @route courses
 * @description Handles courses
 * @access Private
 */
router.use("/courses", makeRequireAuth, courseRoute);

/**
 * @route enrollment
 * @description Handles course enrollment
 * @access Private
 */
router.use("/course-enroll", makeRequireAuth, enrollRoute);

/**
 * @route user
 * @description Handles user management + deletion
 * @access Private
 */
router.use("/user", makeRequireAuth, userRoute);

router.get("/help", (req, res) => {
  const routes = listRoutesFromRouter(router).map(r => ({
    path: req.baseUrl + (r.path === "/" ? "" : r.path),
    methods: r.methods,
  }));
  res.json({ routes });
});

router.use((req, res, next) => {
  httpError(404, `Route '${req.originalUrl}' does not exist`);
});

module.exports = router;
