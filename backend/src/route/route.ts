/**
 * @file route.ts
 * @description
 * Main route file to serve all API routes.
 *
 * @module route
 * @version 1.0.0
 * @auth Thomas
 */

import express, { Request, Response, NextFunction, Router } from "express";

import authRoute from "./authRoute";
/*
import courseRoute from "./courseRoute";
import enrollRoute from "./enrollRoute";
import userRoute from "./userRoute";
import fileRoute from "./fileRoute";
*/
import { makeRequireAuth } from "../middleware/authTokenMiddleware";
import { httpError } from "../utility/httpUtility";

const router: Router = express.Router();

/**
 * @route /auth
 * @description Handles authentication
 * @access Public
 */
router.use("/auth", authRoute);

/**
 * @route /courses
 * @description Handles courses
 * @access Private
 */
//router.use("/courses", makeRequireAuth, courseRoute);

/**
 * @route /course-enroll
 * @description Handles course enrollment
 * @access Private
 */
//router.use("/course-enroll", makeRequireAuth, enrollRoute);

/**
 * @route /users
 * @description Handles user management + deletion
 * @access Private
 */
//Router.use("/users", makeRequireAuth, userRoute);

/**
 * @route /files
 * @description Handles file uploads and retrieval
 * @access Private
 */
//router.use("/files", makeRequireAuth, fileRoute);

/**
 * Catch-all for undefined routes
 */
router.use((req: Request, _res: Response, _next: NextFunction) => {
  httpError(404, `Route '${req.originalUrl}' does not exist`);
});

export default router;
