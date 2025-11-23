/**
 * @file authService.ts
 * @description
 * Handles all user authentication and registration logic — including
 * email/password, Google/Microsoft OAuth, and JWT lifecycle management.
 *
 * @module service
 * @version 1.0.0
 * @auth Thomas
 */

import bcrypt from "bcrypt";
import env from "../config/envConfigs";
import { HttpError, httpError } from "../utility/httpUtility";
import logger from "../utility/logger";

import type { AuthResponse } from "../models/auth";
import type { UserRepository } from "../repository/userRepository";
import type { EmailService } from "./emailService";
import type { OAuthService } from "./oauthService";
import type { TokenService } from "./tokenService";
import type { WebService } from "./webService";

const { frontend_client: FRONTEND_CLIENT } = env;

class AuthService {
  private readonly userRepository: UserRepository;
  private readonly emailService: EmailService;
  private readonly tokenService: TokenService;
  private readonly oauthService: OAuthService;
  private readonly webService: WebService;

  private readonly DUMMY_HASH =
    "$2b$10$CwTycUXWue0Thq9StjUM0uJ8T8YtAUD3bFIxVYbcEdb87qfEzS1mS";

  constructor(
    userRepository: UserRepository,
    emailService: EmailService,
    tokenService: TokenService,
    oauthService: OAuthService,
    webService: WebService,
  ) {
    this.userRepository = userRepository;
    this.emailService = emailService;
    this.tokenService = tokenService;
    this.oauthService = oauthService;
    this.webService = webService;
  }

  public async loginUser(
    email: string,
    password: string,
    remember: boolean,
    captcha: string,
  ): Promise<AuthResponse> {
    try {
      if (env.isCaptchaEnabled()) {
        const result = this.webService.verifyGoogleCaptcha(captcha ?? "");
        if (!result) httpError(401, "Invalid captcha");
      } else {
        logger.warn("Google Captcha is not available");
      }

      const user = await this.userRepository.findByEmail(email);

      const hashToCheck = user?.password ?? this.DUMMY_HASH;
      const passwordMatches = await bcrypt.compare(password, hashToCheck);
      if (!user || !passwordMatches || !user.password) {
        httpError(401, "Invalid credentials");
      }

      const { accessToken, refreshToken } =
        await this.tokenService.generateTokens(
          user.id,
          user.username || user.email,
          user.role,
          user.avatar ?? undefined,
          remember,
        );

      return {
        accessToken,
        refreshToken,
        role: user.role,
        id: user.id,
        username: user.username,
        avatar: user.avatar,
      };
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }
      logger.error(`[AuthService] loginUser failed: ${err?.message ?? err}`);
      httpError(500, "Internal server error");
    }
  }

  public async signupUser(
    email: string,
    password: string,
    role: string,
    captcha: string,
  ): Promise<boolean> {
    try {
      if (env.isCaptchaEnabled()) {
        const result = await this.webService.verifyGoogleCaptcha(captcha ?? "");
        if (!result) httpError(401, "Invalid captcha");
      } else {
        logger.warn("Google Captcha is not available");
      }

      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) httpError(409, "Email already in use");

      const hashedPassword = await bcrypt.hash(password, 10);
      const token = await this.tokenService.createVerifyToken(
        email,
        hashedPassword,
        role,
      );

      if (env.isEmailEnabled()) {
        const url = `${FRONTEND_CLIENT}/auth/verify?token=${encodeURIComponent(
          token,
        )}`;
        await this.emailService.sendVerificationEmail(email, url);
      } else {
        logger.warn("Email verification is not available");
        await this.userRepository.create(email, role, "local", hashedPassword);
      }
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }
      logger.error(`[AuthService] signupUser failed: ${err?.message ?? err}`);
      httpError(500, "Internal server error");
    }

    return true;
  }

  public async verifyUser(token: string) {
    try {
      const { email, password, role } =
        await this.tokenService.validateVerifyToken(token);
      const user = await this.userRepository.create(
        email,
        role,
        "local",
        password,
      );

      if (env.isEmailEnabled()) {
        await this.emailService.sendWelcomeEmail(email);
      }

      return user;
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }
      logger.error(`[AuthService] verifyUser failed: ${err?.message ?? err}`);
      httpError(500, "Internal server error");
    }
  }

  public async microsoftOAuth(idToken: string): Promise<AuthResponse> {
    try {
      const claims = await this.oauthService.verifyMicrosoftToken(idToken);

      const microsoftSub = (claims as any).sub || (claims as any).oid;
      const email = (claims as any).email || (claims as any).preferred_username;
      const name = (claims as any).name || "";

      if (!email) httpError(400, "Microsoft email missing");
      if (!microsoftSub) httpError(400, "Microsoft subject missing");

      let user = await this.userRepository.findByEmail(email);

      if (!user) {
        user = await this.userRepository.create(
          email,
          "notdefined",
          "microsoft",
          undefined,
          microsoftSub,
        );
      }

      const { accessToken, refreshToken } =
        await this.tokenService.generateTokens(
          user.id,
          user.username || user.email,
          user.role,
          user.avatar ?? undefined,
        );

      return {
        accessToken,
        refreshToken,
        role: user.role,
        id: user.id,
        username: user.username || user.email,
        avatar: user.avatar,
      };
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }
      logger.error(
        `[AuthService] microsoftOauth failed: ${err?.message ?? err}`,
      );
      httpError(500, "Internal server error");
    }
  }

  public async googleOAuth(googleToken: string): Promise<AuthResponse> {
    try {
      const googleUser = await this.oauthService.verifyGoogleToken(googleToken);
      if (!googleUser?.email) httpError(401, "Invalid Google token");

      let user = await this.userRepository.findByEmail(googleUser.email);

      if (!user) {
        user = await this.userRepository.create(
          googleUser.email!,
          "notdefined",
          "google",
          undefined,
          undefined,
          googleUser.sub,
        );
      }

      const { accessToken, refreshToken } =
        await this.tokenService.generateTokens(
          user.id,
          user.username || user.email,
          user.role,
          user.avatar ?? undefined,
        );

      return {
        accessToken,
        refreshToken,
        role: user.role,
        id: user.id,
        username: user.username || user.email,
        avatar: user.avatar,
      };
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }
      logger.error(`[AuthService] googleOAuth failed: ${err?.message ?? err}`);
      httpError(500, "Internal server error");
    }
  }

  public async generateNewTokens(oldToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    role: string;
    username: string;
    avatar?: string;
  }> {
    try {
      const { accessToken, refreshToken, role, username, avatar } =
        await this.tokenService.rotateRefreshToken(oldToken);
      return { accessToken, refreshToken, role, username, avatar };
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }
      logger.error(
        `[AuthService] generateNewTokens failed: ${err?.message ?? err}`,
      );
      httpError(500, "Internal server error");
    }
  }

  public async authLogout(token: string): Promise<boolean> {
    try {
      return await this.tokenService.logoutToken(token);
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }
      logger.error(`[AuthService] authLogout failed: ${err?.message ?? err}`);
      httpError(500, "Internal server error");
    }
  }
}

export { AuthService };
