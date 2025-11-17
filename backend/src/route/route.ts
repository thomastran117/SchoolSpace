/**
 * @file route.ts
 * @description
 * Main route file to serve all API routes.
 *
 * @module route
 * @version 1.0.0
 * @auth Thomas
 */

import type { NextFunction, Request, Response, Router } from "express";
import express from "express";

import { AuthGuard } from "../middleware/authMiddleware";
import { httpError } from "../utility/httpUtility";
import authRoute from "./authRoute";
import catalogueRoute from "./catalogueRoute";
import fileRoute from "./fileRoute";
import paymentRoute from "./paymentRoute";
import userRoute from "./userRoute";

const router: Router = express.Router();

router.use("/auth", authRoute);
router.use("/payment", AuthGuard, paymentRoute);
router.use("/files", AuthGuard, fileRoute);
router.use("/users", AuthGuard, userRoute);
router.use("/catalogues", catalogueRoute);

router.use((req: Request, _res: Response, _next: NextFunction) => {
  httpError(404, `Route '${req.originalUrl}' does not exist`);
});

export default router;
