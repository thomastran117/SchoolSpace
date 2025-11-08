/**
 * @file authController.ts
 * @description
 * Handles authentication API requests and responses
 *
 * @module controller
 * @version 1.0.0
 * @auth Thomas
 */

import type { Request, Response, NextFunction } from "express";

import type { AuthService } from "../service/authService";
import logger from "../utility/logger";
import env from "../config/envConfigs";
import { httpError, sendCookie } from "../utility/httpUtility";
import type { TypedRequest, TypedResponse } from "../types/express";
import type {
  LoginDto,
  SignupDto,
  MicrosoftDto,
  GoogleDto,
  AuthResponseDto,
} from "../dto/authSchema";

class AuthController {
  private readonly authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
    this.localAuthenticate = this.localAuthenticate.bind(this);
    this.localSignup = this.localSignup.bind(this);
    this.localVerifyEmail = this.localVerifyEmail.bind(this);
    this.googleAuthenticate = this.googleAuthenticate.bind(this);
    this.microsoftAuthenticate = this.microsoftAuthenticate.bind(this);
    this.refreshAccessToken = this.refreshAccessToken.bind(this);
    this.logoutRefreshToken = this.logoutRefreshToken.bind(this);
  }

  public async localAuthenticate(
    req: TypedRequest<LoginDto>,
    res: TypedResponse<AuthResponseDto>,
    next: NextFunction,
  ) {
    try {
      const { email, password, remember, captcha } = req.body;

      const rememberFlag = remember ?? false;

      const { accessToken, refreshToken, username, avatar, role } =
        await this.authService.loginUser(
          email,
          password,
          rememberFlag,
          captcha,
        );

      sendCookie(res, refreshToken);

      return res.status(200).json({
        message: "Login successful",
        accessToken,
        role,
        avatar: avatar ?? undefined,
        username: username ?? undefined,
      });
    } catch (err) {
      next(err);
    }
  }

  public async localSignup(
    req: TypedRequest<SignupDto>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { email, password, role, captcha } = req.body;

      await this.authService.signupUser(email, password, role, captcha);

      res.status(201).json({ message: "Email sent. Please verify." });
    } catch (err) {
      next(err);
    }
  }

  public async localVerifyEmail(
    req: Request<object, object, object>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!env.isEmailEnabled()) {
        logger.warn("Email verification is not available");
        httpError(
          503,
          "Email verification is not available. You don't need to access this route at this time.",
        );
      }

      const token = req.query.token as string | undefined;
      if (!token) httpError(400, "Missing token");

      await this.authService.verifyUser(token);

      res.status(201).json({
        message: "User verified — please log in.",
      });
    } catch (err) {
      next(err);
    }
  }

  public async microsoftAuthenticate(
    req: TypedRequest<MicrosoftDto>,
    res: TypedResponse<AuthResponseDto>,
    next: NextFunction,
  ) {
    try {
      if (!env.isMicrosoftEnabled()) {
        logger.warn("Microsoft OAuth is not available");
        httpError(
          503,
          "Microsoft OAuth is not available. Please use another login method.",
        );
      }

      const { id_token: idToken } = req.body ?? {};
      if (!idToken) httpError(400, "Missing id_token");

      const { accessToken, refreshToken, role, username, avatar } =
        await this.authService.microsoftOAuth(idToken);

      sendCookie(res, refreshToken);

      return res.status(200).json({
        message: "Login successful",
        accessToken,
        role,
        avatar: avatar ?? undefined,
        username: username ?? undefined,
      });
    } catch (err) {
      next(err);
    }
  }

  public async googleAuthenticate(
    req: TypedRequest<GoogleDto>,
    res: TypedResponse<AuthResponseDto>,
    next: NextFunction,
  ) {
    try {
      const { id_token: googleToken } = req.body;
      if (!googleToken) httpError(400, "Google token missing");

      const { accessToken, refreshToken, role, username, avatar } =
        await this.authService.googleOAuth(googleToken);

      sendCookie(res, refreshToken);

      return res.status(200).json({
        message: "Login successful",
        accessToken,
        role,
        avatar: avatar ?? undefined,
        username: username ?? undefined,
      });
    } catch (err) {
      next(err);
    }
  }

  public async refreshAccessToken(
    req: Request,
    res: TypedResponse<AuthResponseDto>,
    next: NextFunction,
  ) {
    try {
      const token = req.cookies.refreshToken;
      if (!token) httpError(401, "Missing refresh token");

      const { accessToken, refreshToken, role, username, avatar } =
        await this.authService.generateNewTokens(token);

      sendCookie(res, refreshToken);

      return res.status(200).json({
        message: "Granting new access token",
        accessToken,
        role,
        avatar: avatar ?? undefined,
        username: username ?? undefined,
      });
    } catch (err) {
      next(err);
    }
  }

  public async logoutRefreshToken(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const token = req.cookies.refreshToken;

      if (!token) {
        return res.status(200).json({ message: "Already logged out" });
      }

      await this.authService.authLogout(token);

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.json({ message: "Logged out successfully" });
    } catch (err) {
      next(err);
    }
  }
}

export { AuthController };
