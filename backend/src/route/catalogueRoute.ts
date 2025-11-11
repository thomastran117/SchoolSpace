/**
 * @file catalogueRoutes.ts
 * @description Routes for managing course catalogue templates
 */
import { AuthGuard } from "../middleware/authMiddleware";
import type { Router, Request, Response, NextFunction } from "express";
import express from "express";
import container from "../container";
import { validate } from "../middleware/validateMiddleware";
import type { CatalogueController } from "../controller/catalogueController";
import {
  CreateCatalogueSchema,
  UpdateCatalogueSchema,
  QueryCatalogueSchema,
} from "../dto/catalogueSchema";
import { IdParamSchema } from "../dto/idSchema";

const router: Router = express.Router();

/* -------------------------------------------------------------
 * Scoped controller helper (mirrors Auth/User routes)
 * ----------------------------------------------------------- */
const useScopedController =
  (
    handler: (
      controller: CatalogueController,
      req: Request,
      res: Response,
      next: NextFunction,
    ) => Promise<any> | any,
  ) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const scope = container.createScope();
    const controller = scope.resolve<CatalogueController>(
      "CatalogueController",
    );

    try {
      await handler(controller, req, res, next);
    } catch (err) {
      next(err);
    } finally {
      scope.dispose();
    }
  };

/* -------------------------------------------------------------
 * Routes
 * ----------------------------------------------------------- */

/**
 * @route POST /catalogue
 * @desc Create a new course template (Admin only)
 */
router.post(
  "/",
  AuthGuard,
  validate(CreateCatalogueSchema, "body"),
  useScopedController((controller, req, res, next) =>
    controller.createCourseTemplate(req, res, next),
  ),
);

/**
 * @route PUT /catalogue/:id
 * @desc Update an existing course template (Admin only)
 */
router.put(
  "/:id",
  AuthGuard,
  validate(IdParamSchema, "params"),
  validate(UpdateCatalogueSchema, "body"),
  useScopedController((controller, req, res, next) =>
    controller.updateCourseTemplate(req, res, next),
  ),
);

/**
 * @route DELETE /catalogue/:id
 * @desc Delete a course template (Admin only)
 */
router.delete(
  "/:id",
  AuthGuard,
  validate(IdParamSchema, "params"),
  useScopedController((controller, req, res, next) =>
    controller.deleteCourseTemplate(req, res, next),
  ),
);

/**
 * @route GET /catalogue/:id
 * @desc Get a single course template by numeric ID
 */
router.get(
  "/:id",
  validate(IdParamSchema, "params"),
  useScopedController((controller, req, res, next) =>
    controller.getCourseTemplate(req, res, next),
  ),
);

/**
 * @route GET /catalogue
 * @desc Get all or filtered course templates
 * @query term, available, search
 */
router.get(
  "/",
  validate(QueryCatalogueSchema, "query"),
  useScopedController((controller, req, res, next) =>
    controller.getCourseTemplates(req, res, next),
  ),
);

export default router;
