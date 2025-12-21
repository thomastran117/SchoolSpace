/**
 * @file authController.ts
 * @description
 * Handles authentication API requests and responses
 *
 * @module controller
 * @version 2.0.0
 * @auth Thomas
 */

import { httpError, HttpError } from "../utility/httpUtility";
import logger from "../utility/logger";

import type { FastifyReply, FastifyRequest } from "fastify";

import type {
  AppleDto,
  AuthResponseDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  GoogleDto,
  LoginDto,
  MicrosoftDto,
  SignupDto,
  VerifyDto,
} from "../dto/authSchema";
import type { TokenQuery } from "../dto/query";
import type { AuthService } from "../service/authService";

class AuthController {
  private readonly authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;

    this.localAuthenticate = this.localAuthenticate.bind(this);
    this.localSignup = this.localSignup.bind(this);
    this.localVerifyEmail = this.localVerifyEmail.bind(this);
    this.localForgotPassword = this.localForgotPassword.bind(this);
    this.localChangePassword = this.localChangePassword.bind(this);
    this.googleAuthenticate = this.googleAuthenticate.bind(this);
    this.microsoftAuthenticate = this.microsoftAuthenticate.bind(this);
    this.appleAuthenticate = this.appleAuthenticate.bind(this);
    this.refreshAccessToken = this.refreshAccessToken.bind(this);
    this.logoutRefreshToken = this.logoutRefreshToken.bind(this);
  }

  public async localAuthenticate(
    req: FastifyRequest<{ Body: LoginDto }>,
    reply: FastifyReply,
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

      reply.setCookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      return reply.code(200).send({
        message: "Login successful",
        accessToken,
        role,
        avatar: avatar ?? undefined,
        username: username ?? undefined,
      } satisfies AuthResponseDto);
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }

      logger.error(
        `[AuthController] localAuthenticate failed: ${err?.message ?? err}`,
      );

      throw new HttpError(500, "Internal server error");
    }
  }

  public async localSignup(
    req: FastifyRequest<{ Body: SignupDto }>,
    reply: FastifyReply,
  ) {
    try {
      const { email, password, role, captcha } = req.body;

      await this.authService.signupUser(email, password, role, captcha);

      return reply.code(200).send({
        message: "Email verification sent. Please verify.",
      });
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }

      logger.error(
        `[AuthController] localSignup failed: ${err?.message ?? err}`,
      );

      throw new HttpError(500, "Internal server error");
    }
  }

  public async localVerifyEmail(
    req: FastifyRequest<{ Body: VerifyDto }>,
    reply: FastifyReply,
  ) {
    try {
      const { email, code, captcha } = req.body;

      await this.authService.verifyUser(email, code, captcha);

      return reply.code(200).send({
        message: "Please login now.",
      });
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }

      logger.error(
        `[AuthController] localVerifyEmail failed: ${err?.message ?? err}`,
      );

      throw new HttpError(500, "Internal server error");
    }
  }

  public async localForgotPassword(
    req: FastifyRequest<{ Body: ForgotPasswordDto }>,
    reply: FastifyReply,
  ) {
    try {
      const { email } = req.body;
      await this.authService.forgotPassword(email);

      return reply.code(200).send({
        message: "If an account exist, an email has been sent",
      });
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }

      logger.error(
        `[AuthController] localVerifyEmail failed: ${err?.message ?? err}`,
      );

      throw new HttpError(500, "Internal server error");
    }
  }

  public async localChangePassword(
    req: FastifyRequest<{ Body: ChangePasswordDto; Querystring: TokenQuery }>,
    reply: FastifyReply,
  ) {
    try {
      const token = req.query.token;
      if (!token) httpError(400, "Missing token");

      const { password } = req.body;
      await this.authService.changePassword(token, password);

      return reply.code(200).send({
        message: "Password change sucessfully",
      });
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }

      logger.error(
        `[AuthController] localVerifyEmail failed: ${err?.message ?? err}`,
      );

      throw new HttpError(500, "Internal server error");
    }
  }

  public async microsoftAuthenticate(
    req: FastifyRequest<{ Body: MicrosoftDto }>,
    reply: FastifyReply,
  ) {
    try {
      const { id_token: idToken } = req.body ?? {};
      if (!idToken) httpError(400, "Missing id_token");

      const { accessToken, refreshToken, role, username, avatar } =
        await this.authService.microsoftOAuth(idToken);

      reply.setCookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      return reply.code(200).send({
        message: "Login successful",
        accessToken,
        role,
        avatar: avatar ?? undefined,
        username: username ?? undefined,
      } satisfies AuthResponseDto);
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }

      logger.error(
        `[AuthController] microsoftAuthenticate failed: ${err?.message ?? err}`,
      );

      throw new HttpError(500, "Internal server error");
    }
  }

  public async googleAuthenticate(
    req: FastifyRequest<{ Body: GoogleDto }>,
    reply: FastifyReply,
  ) {
    try {
      const { id_token: googleToken } = req.body;
      if (!googleToken) httpError(400, "Google token missing");

      const { accessToken, refreshToken, role, username, avatar } =
        await this.authService.googleOAuth(googleToken);

      reply.setCookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });

      return reply.code(200).send({
        message: "Login successful",
        accessToken,
        role,
        avatar: avatar ?? undefined,
        username: username ?? undefined,
      } satisfies AuthResponseDto);
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }

      logger.error(
        `[AuthController] googleAuthenticate failed: ${err?.message ?? err}`,
      );

      throw new HttpError(500, "Internal server error");
    }
  }

  public async appleAuthenticate(
    req: FastifyRequest<{ Body: AppleDto }>,
    reply: FastifyReply,
  ) {
    try {
      const { id_token: appleToken } = req.body;
      if (!appleToken) httpError(400, "Apple token missing");

      const { accessToken, refreshToken, role, username, avatar } =
        await this.authService.googleOAuth(appleToken); //change to appleOAuth later

      reply.setCookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      return reply.code(200).send({
        message: "Login successful",
        accessToken,
        role,
        avatar: avatar ?? undefined,
        username: username ?? undefined,
      } satisfies AuthResponseDto);
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }

      logger.error(
        `[AuthController] appleAuthenticate failed: ${err?.message ?? err}`,
      );

      throw new HttpError(500, "Internal server error");
    }
  }

  public async refreshAccessToken(req: FastifyRequest, reply: FastifyReply) {
    try {
      const token = req.cookies.refreshToken;
      if (!token) httpError(401, "Missing refresh token");

      const { accessToken, refreshToken, role, username, avatar } =
        await this.authService.generateNewTokens(token);

      reply.setCookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      return reply.code(200).send({
        message: "Login successful",
        accessToken,
        role,
        avatar: avatar ?? undefined,
        username: username ?? undefined,
      } satisfies AuthResponseDto);
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }

      logger.error(
        `[AuthController] refreshAccessToken failed: ${err?.message ?? err}`,
      );

      throw new HttpError(500, "Internal server error");
    }
  }

  public async logoutRefreshToken(req: FastifyRequest, reply: FastifyReply) {
    try {
      const token = req.cookies.refreshToken;

      if (!token) {
        return reply.code(200).send({
          message: "Logged out already",
        });
      }

      await this.authService.authLogout(token);

      reply.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return reply.code(200).send({
        message: "Logged out sucessfully",
      });
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }

      logger.error(
        `[AuthController] logoutRefreshToken failed: ${err?.message ?? err}`,
      );

      throw new HttpError(500, "Internal server error");
    }
  }
}

export { AuthController };
