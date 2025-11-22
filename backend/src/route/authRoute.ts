/**
 * @file auth-route.ts
 * @description Authentication routes (login, signup, OAuth, etc.)
 */

import type { NextFunction, Request, Response, Router } from "express";
import express from "express";
import {
  GoogleSchema,
  LoginSchema,
  MicrosoftSchema,
  SignupSchema,
} from "../dto/authSchema";
import { validate } from "../middleware/validateMiddleware";
import type { ControllerInstance, ControllerKey } from "../types/controller";

const router: Router = express.Router();

function useController<K extends ControllerKey>(
  key: K,
  selector: (instance: ControllerInstance<K>) => any,
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const controller = req.resolve<ControllerInstance<K>>(key);
      const fn = selector(controller);

      return await fn.call(controller, req, res, next);
    } catch (err) {
      next(err);
    }
  };
}

/**
 * @route POST /auth/login
 */
router.post(
  "/login",
  validate(LoginSchema, "body"),
  useController("AuthController", (c) => c.localAuthenticate),
);
/**
 * @route POST /auth/signup
 */
router.post(
  "/signup",
  validate(SignupSchema, "body"),
  useController("AuthController", (c) => c.localSignup),
);

/**
 * @route GET /auth/verify
 */
router.get(
  "/verify",
  useController("AuthController", (c) => c.localVerifyEmail),
);

/**
 * @route POST /auth/microsoft/verify
 */
router.post(
  "/microsoft/verify",
  validate(MicrosoftSchema, "body"),
  useController("AuthController", (c) => c.microsoftAuthenticate),
);

/**
 * @route POST /auth/google/verify
 */
router.post(
  "/google/verify",
  validate(GoogleSchema, "body"),
  useController("AuthController", (c) => c.googleAuthenticate),
);

/**
 * @route GET /auth/refresh
 */
router.get(
  "/refresh",
  useController("AuthController", (c) => c.refreshAccessToken),
);

/**
 * @route POST /auth/logout
 */
router.post(
  "/logout",
  useController("AuthController", (c) => c.logoutRefreshToken),
);

export default router;
