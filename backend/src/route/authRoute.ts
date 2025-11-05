/**
 * @file auth-route.ts
 * @description Authentication routes (login, signup, OAuth, etc.)
 */

import express, { Router, Request, Response, NextFunction } from "express";
import container from "../resource/container";
import { validate } from "../middleware/validateMiddleware";
import {
  LoginSchema,
  SignupSchema,
  MicrosoftSchema,
  GoogleSchema,
} from "../dto/authSchema";
import { AuthController } from "../controller/authController";

const router: Router = express.Router();

const useScopedController =
  (
    handler: (
      controller: AuthController,
      req: Request,
      res: Response,
      next: NextFunction,
    ) => Promise<any> | any,
  ) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const scope = container.createScope();
    const controller = scope.resolve<AuthController>("AuthController");

    try {
      await handler(controller, req, res, next);
    } catch (err) {
      next(err);
    } finally {
      scope.dispose();
    }
  };

/**
 * @route POST /auth/login
 */
router.post(
  "/login",
  validate(LoginSchema),
  useScopedController((controller, req, res, next) =>
    controller.localAuthenticate(req, res, next),
  ),
);

/**
 * @route POST /auth/signup
 */
router.post(
  "/signup",
  validate(SignupSchema),
  useScopedController((controller, req, res, next) =>
    controller.localSignup(req, res, next),
  ),
);

/**
 * @route GET /auth/verify
 */
router.get(
  "/verify",
  useScopedController((controller, req, res, next) =>
    controller.localVerifyEmail(req, res, next),
  ),
);

/**
 * @route POST /auth/microsoft/verify
 */
router.post(
  "/microsoft/verify",
  validate(MicrosoftSchema),
  useScopedController((controller, req, res, next) =>
    controller.microsoftAuthenticate(req, res, next),
  ),
);

/**
 * @route POST /auth/google/verify
 */
router.post(
  "/google/verify",
  validate(GoogleSchema),
  useScopedController((controller, req, res, next) =>
    controller.googleAuthenticate(req, res, next),
  ),
);

/**
 * @route GET /auth/refresh
 */
router.get(
  "/refresh",
  useScopedController((controller, req, res, next) =>
    controller.refreshAccessToken(req, res, next),
  ),
);

/**
 * @route POST /auth/logout
 */
router.post(
  "/logout",
  useScopedController((controller, req, res, next) =>
    controller.logoutRefreshToken(req, res, next),
  ),
);

export default router;
