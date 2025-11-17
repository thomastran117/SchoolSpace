/**
 * @file userRoute.js
 * @description Defines all user profile related routes and user fetching
 * @module route
 *
 * @version 1.0.0
 * @author Thomas
 */

/**
 * Imports
 */
import type { NextFunction, Request, Response, Router } from "express";
import express from "express";
import container from "../container";
import type { UserController } from "../controller/userController";
import { IdParamSchema } from "../dto/idSchema";
import { RoleSchema, UserSchema } from "../dto/userSchema";
import { safeUploadAvatar } from "../middleware/uploadMiddleware";
import { validate } from "../middleware/validateMiddleware";
const useScopedController =
  (
    handler: (
      controller: UserController,
      req: Request,
      res: Response,
      next: NextFunction,
    ) => Promise<any> | any,
  ) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const scope = container.createScope();
    const controller = scope.resolve<UserController>("UserController");

    try {
      await handler(controller, req, res, next);
    } catch (err) {
      next(err);
    } finally {
      scope.dispose();
    }
  };

const router: Router = express.Router();

router.post(
  "/avatar",
  safeUploadAvatar(),
  useScopedController((controller, req, res, next) =>
    controller.updateAvatar(req, res, next),
  ),
);

router.put(
  "/:id",
  validate(IdParamSchema, "params"),
  validate(UserSchema, "body"),
  useScopedController((controller, req, res, next) =>
    controller.updateUser(req, res, next),
  ),
);
router.put(
  "/",
  useScopedController((controller, req, res, next) =>
    controller.updateUser(req, res, next),
  ),
);

router.put(
  "/",
  validate(IdParamSchema, "params"),
  validate(RoleSchema, "body"),
  useScopedController((controller, req, res, next) =>
    controller.updateRole(req, res, next),
  ),
);
router.put(
  "/",
  validate(RoleSchema, "body"),
  useScopedController((controller, req, res, next) =>
    controller.updateRole(req, res, next),
  ),
);

router.delete(
  "/",
  validate(IdParamSchema, "params"),
  useScopedController((controller, req, res, next) =>
    controller.deleteUser(req, res, next),
  ),
);
router.delete(
  "/",
  useScopedController((controller, req, res, next) =>
    controller.deleteUser(req, res, next),
  ),
);

router.get(
  "/student/:id",
  validate(IdParamSchema, "params"),
  useScopedController((controller, req, res, next) =>
    controller.getStudentsByCourse(req, res, next),
  ),
);

router.get(
  "/teacher/:id",
  validate(IdParamSchema, "params"),
  useScopedController((controller, req, res, next) =>
    controller.getTeacherByCourse(req, res, next),
  ),
);

router.get(
  "/:id",
  validate(IdParamSchema, "params"),
  useScopedController((controller, req, res, next) =>
    controller.getUser(req, res, next),
  ),
);
router.get(
  "/",
  useScopedController((controller, req, res, next) =>
    controller.getUser(req, res, next),
  ),
);

export default router;
