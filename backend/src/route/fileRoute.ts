/**
 * @file fileRoute.ts
 * @description
 * Express router for file handling (upload, retrieval, deletion).
 *
 * @module route
 * @version 1.0.0
 * @auth Thomas
 */

import type { Router, Request, Response, NextFunction } from "express";
import express from "express";
import container from "../resource/container";import multer from "multer";
import type { FileController } from "../controller/fileController";
import { safeUploadAvatar } from "../middleware/uploadMiddleware";
const router: Router = express.Router();

const useScopedController =
  (
    handler: (
      controller: FileController,
      req: Request,
      res: Response,
      next: NextFunction,
    ) => Promise<any> | any,
  ) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const scope = container.createScope();
    const controller = scope.resolve<FileController>("FileController");

    try {
      await handler(controller, req, res, next);
    } catch (err) {
      next(err);
    } finally {
      scope.dispose();
    }
  };

const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/upload",
  safeUploadAvatar(),
  useScopedController((controller, req, res, next) =>
    controller.handleUpload(req, res, next),
  ),
);

router.get(
  "/:type/:fileName",
  useScopedController((controller, req, res, next) =>
    controller.handleFetch(req, res, next),
  ),
);

export default router;
