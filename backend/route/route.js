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

import express from "express";
import authRoute from "./authRoute.js";
import courseRoute from "./courseRoute.js";
import enrollRoute from "./enrollRoute.js";
import userRoute from "./userRoute.js";
import fileRoute from "./fileRoute.js";
import { makeRequireAuth } from "../middleware/authTokenMiddleware.js";
import { httpError } from "../utility/httpUtility.js";
import listRoutesFromRouter from "../utility/listRoutes.js";

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
router.use("/users", makeRequireAuth, userRoute);

router.use("/files", makeRequireAuth, fileRoute);

router.get("/help", (req, res) => {
  const routes = listRoutesFromRouter(router).map((r) => ({
    path: req.baseUrl + (r.path === "/" ? "" : r.path),
    methods: r.methods,
  }));
  res.json({ routes });
});

router.use((req, res, next) => {
  httpError(404, `Route '${req.originalUrl}' does not exist`);
});

export default router;
