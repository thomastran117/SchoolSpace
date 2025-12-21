/**
 * @file auth-routes.ts
 * @description Authentication routes (login, signup, OAuth, etc.)
 */

import type { FastifyInstance } from "fastify";
import {
  AppleSchema,
  ChangePasswordSchema,
  ForgotPasswordSchema,
  GoogleSchema,
  LoginSchema,
  MicrosoftSchema,
  SignupSchema,
  VerifySchema,
} from "../dto/authSchema";

import { useController } from "../hooks/controllerHook";
import { validate } from "../hooks/validateHook";

async function authRoutes(app: FastifyInstance) {
  /**
   * @route POST /auth/login
   */
  app.post(
    "/login",
    { preValidation: validate(LoginSchema, "body") },
    useController("AuthController", (c) => c.localAuthenticate),
  );

  /**
   * @route POST /auth/signup
   */
  app.post(
    "/signup",
    { preValidation: validate(SignupSchema, "body") },
    useController("AuthController", (c) => c.localSignup),
  );

  /**
   * @route GET /auth/verify
   */
  app.post(
    "/verify",
    { preValidation: validate(VerifySchema, "body") },
    useController("AuthController", (c) => c.localVerifyEmail),
  );

  /**
   * @route POST /auth/forgot-password
   */
  app.post(
    "/forgot-password",
    { preValidation: validate(ForgotPasswordSchema, "body") },
    useController("AuthController", (c) => c.localForgotPassword),
  );

  /**
   * @route POST /auth/change-password
   */
  app.post(
    "/change-password",
    { preValidation: validate(ChangePasswordSchema, "body") },
    useController("AuthController", (c) => c.localChangePassword),
  );

  /**
   * @route POST /auth/microsoft/verify
   */
  app.post(
    "/microsoft/verify",
    { preValidation: validate(MicrosoftSchema, "body") },
    useController("AuthController", (c) => c.microsoftAuthenticate),
  );

  /**
   * @route POST /auth/google/verify
   */
  app.post(
    "/google/verify",
    { preValidation: validate(GoogleSchema, "body") },
    useController("AuthController", (c) => c.googleAuthenticate),
  );

  /**
   * @route POST /auth/apple/verify
   */
  app.post(
    "/apple/verify",
    { preValidation: validate(AppleSchema, "body") },
    useController("AuthController", (c) => c.appleAuthenticate),
  );

  /**
   * @route GET /auth/refresh
   */
  app.get(
    "/refresh",
    useController("AuthController", (c) => c.refreshAccessToken),
  );

  /**
   * @route POST /auth/logout
   */
  app.post(
    "/logout",
    useController("AuthController", (c) => c.logoutRefreshToken),
  );
}

export { authRoutes };
