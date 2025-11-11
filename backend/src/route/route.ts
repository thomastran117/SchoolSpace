/**
 * @file route.ts
 * @description
 * Main route file to serve all API routes.
 *
 * @module route
 * @version 1.0.0
 * @auth Thomas
 */

import type { Request, Response, NextFunction, Router } from "express";
import express from "express";

import authRoute from "./authRoute";
import paymentRoute from "./paymentRoute";
import fileRoute from "./fileRoute";
import userRoute from "./userRoute";
import { httpError } from "../utility/httpUtility";
import { AuthGuard } from "../middleware/authMiddleware";

const router: Router = express.Router();

router.use("/auth", authRoute);
router.use("/payment", AuthGuard, paymentRoute);
router.use("/files", AuthGuard, fileRoute);
router.use("/users", AuthGuard, userRoute);

router.use((req: Request, _res: Response, _next: NextFunction) => {
  httpError(404, `Route '${req.originalUrl}' does not exist`);
});

export default router;
