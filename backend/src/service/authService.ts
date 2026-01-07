/**
 * @file authService.ts
 * @description
 * Handles all user authentication and registration logic — including
 * email/password, Google/Microsoft OAuth, and JWT lifecycle management.
 *
 * @module service
 * @version 2.0.0
 * @auth Thomas
 */
// Imports
import bcrypt from "bcrypt";

import env from "../config/envConfigs";
import type { AuthResponse } from "../models/auth";
import type { EmailQueue } from "../queue/emailQueue";
import type { UserRepository } from "../repository/userRepository";
import { HttpError, httpError } from "../utility/httpUtility";
import logger from "../utility/logger";
import type { OAuthService } from "./oauthService";
import type { TokenService } from "./tokenService";
import type { WebService } from "./webService";

const { frontendClient: FRONTEND_CLIENT } = env;

class AuthService {
  private readonly userRepository: UserRepository;
  private readonly emailQueue: EmailQueue;
  private readonly tokenService: TokenService;
  private readonly oauthService: OAuthService;
  private readonly webService: WebService;

  private readonly DUMMY_HASH =
    "$2b$10$CwTycUXWue0Thq9StjUM0uJ8T8YtAUD3bFIxVYbcEdb87qfEzS1mS";

  constructor(
    dependencies:{
    userRepository: UserRepository,
    emailQueue: EmailQueue,
    tokenService: TokenService,
    oauthService: OAuthService,
    webService: WebService
    }
  ) {
    this.userRepository = dependencies.userRepository;
    this.emailQueue = dependencies.emailQueue;
    this.tokenService = dependencies.tokenService;
    this.oauthService = dependencies.oauthService;
    this.webService = dependencies.webService;
  }

  /**
   * Authenticates a user using email + password (local login).
   *
   * Performs optional Google reCAPTCHA verification, validates the user's
   * credentials using a constant-time hash comparison, and issues both
   * access and refresh tokens.
   *
   * @param email - The user's email address.
   * @param password - The plaintext password provided by the user.
   * @param remember - Whether the refresh token should expire later (persistent login).
   * @param captcha - Google reCAPTCHA token to validate (if enabled).
   *
   * @returns AuthResponse containing access token, refresh token, and user metadata.
   *
   * @throws {HttpError} 401 - When captcha verification fails or credentials are invalid.
   * @throws {HttpError} 500 - On unexpected internal errors.
   */
  public async loginUser(
    email: string,
    password: string,
    remember: boolean,
    captcha: string
  ): Promise<AuthResponse> {
    try {
      const result = await this.webService.verifyGoogleCaptcha(captcha);
      if (!result) httpError(401, "Invalid captcha");

      const user = await this.userRepository.findByEmail(email);
      const hashToCheck = user?.password ?? this.DUMMY_HASH;

      const passwordMatches = await this.comparePassword(password, hashToCheck);
      if (!user || !passwordMatches || !user.password) {
        httpError(401, "Invalid credentials");
      }

      const { accessToken, refreshToken } =
        await this.tokenService.generateTokens(
          user.id,
          user.username || user.email,
          user.role,
          user.avatar ?? undefined,
          remember
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

  /**
   * Authenticates a user using email + password (local login).
   *
   * Performs optional Google reCAPTCHA verification, generates the signup information and
   * sends the verification with an email
   *
   * May skip email verification if configured to do so
   *
   * @param email - The user's email address.
   * @param password - The plaintext password provided by the user.
   * @param role - The user's desired role for the system.
   * @param captcha - Google reCAPTCHA token to validate (if enabled).
   *
   * @returns boolean whether the signup process is successful.
   *
   * @throws {HttpError} 401 - When captcha verification fails or credentials are invalid.
   * @throws {HttpError} 500 - On unexpected internal errors.
   */
  public async signupUser(
    email: string,
    password: string,
    role: string,
    captcha: string
  ): Promise<boolean> {
    try {
      const result = await this.webService.verifyGoogleCaptcha(captcha);
      if (!result) httpError(401, "Invalid captcha");

      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) httpError(409, "Email already in use");

      const hashedPassword = await this.hashPassword(password);
      const { code } = await this.tokenService.createEmailCode(
        email,
        hashedPassword,
        role
      );

      if (!code) return true;

      await this.emailQueue.enqueueVerifyEmail(email, code);

      return true;
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }
      logger.error(`[AuthService] signupUser failed: ${err?.message ?? err}`);
      httpError(500, "Internal server error");
    }
  }

  /**
   * Completes a user signup process by verifying whether the token was issued by theServer
   *
   * @param token - The verify token to validate
   * @returns Returns the user metadata
   *
   * @throws {Error} If the verification fails
   */
  public async verifyUser(email: string, token: string, captcha: string) {
    try {
      const result = await this.webService.verifyGoogleCaptcha(captcha);
      if (!result) httpError(401, "Invalid captcha");

      const { password, role } = await this.tokenService.verifyEmailCode(
        email,
        token
      );

      const user = await this.userRepository.create({
        email,
        role: role as any,
        provider: "local" as any,
        password,
      });

      await this.emailQueue.enqueueWelcomeEmail(email);

      return user;
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }
      logger.error(`[AuthService] verifyUser failed: ${err?.message ?? err}`);
      httpError(500, "Internal server error");
    }
  }

  /**
   * Starts the forgot password chain - if the user email exist, the server will
   * send a reset link
   *
   * @param email - Email provided by the user
   * @returns Void - the service is designed to always return success
   *
   * @throws {Error} If the process fails
   */
  public async forgotPassword(email: string) {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return;
      }

      if (user.provider == "google" || user.provider == "microsoft") {
        return;
      }
      const { code } = await this.tokenService.createEmailCode(
        email,
        "empty",
        "empty"
      );

      if (!code) return;
      await this.emailQueue.enqueueVerifyEmail(email, code); //change to forgot password

      return;
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }
      logger.error(
        `[AuthService] forgotPassword failed: ${err?.message ?? err}`
      );
      httpError(500, "Internal server error");
    }
  }

  /**
   * Finishes the reset password chain
   *
   * @param token - The verify token to validate
   * @param password - The new plaintext password provided by the user
   * @returns Void
   *
   * @throws {Error} If the process fails
   */
  public async changePassword(token: string, password: string) {
    try {
      const { email } = await this.tokenService.verifyEmailCode(
        "something",
        token
      );
      const hashedPassword = await this.hashPassword(password);
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        httpError(404, "User not found");
      }
      await this.userRepository.update(user.id, { password: hashedPassword });
      return;
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }
      logger.error(
        `[AuthService] changePassword failed: ${err?.message ?? err}`
      );
      httpError(500, "Internal server error");
    }
  }

  /**
   * Authenicates an User using Microsoft OAuth 2.0
   *
   * @param microsoftToken - The microsoft token to validate using Microsoft's OAuth 2.0 service
   * @returns access token, refreh token and user information
   *
   * @throws {Error} If the authenication fails or is not successful
   */
  public async microsoftOAuth(microsoftToken: string): Promise<AuthResponse> {
    try {
      const claims =
        await this.oauthService.verifyMicrosoftToken(microsoftToken);

      const microsoftSub = (claims as any).sub || (claims as any).oid;
      const email = (claims as any).email || (claims as any).preferred_username;
      const name = (claims as any).name || "";

      if (!email) httpError(400, "Microsoft email missing");
      if (!microsoftSub) httpError(400, "Microsoft subject missing");

      let user = await this.userRepository.findByEmail(email);

      if (!user) {
        user = await this.userRepository.create({
          email,
          role: "notdefined" as any,
          provider: "microsoft" as any,
          microsoftId: microsoftSub,
        });
      }

      const { accessToken, refreshToken } =
        await this.tokenService.generateTokens(
          user.id,
          user.username || user.email,
          user.role,
          user.avatar ?? undefined
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
        `[AuthService] microsoftOauth failed: ${err?.message ?? err}`
      );
      httpError(500, "Internal server error");
    }
  }

  /**
   * Authenicates an User using Google OAuth 2.0
   *
   * @param googleToken - The google token to validate using Google's OAuth 2.0 service
   * @returns access token, refreh token and user information
   *
   * @throws {Error} If the authenication fails or is not successful
   */
  public async googleOAuth(googleToken: string): Promise<AuthResponse> {
    try {
      const googleUser = await this.oauthService.verifyGoogleToken(googleToken);
      if (!googleUser?.email) httpError(401, "Invalid Google token");

      let user = await this.userRepository.findByEmail(googleUser.email);

      if (!user) {
        user = await this.userRepository.create({
          email: googleUser.email!,
          role: "notdefined" as any,
          provider: "google" as any,
          googleId: googleUser.sub,
        });
      }

      const { accessToken, refreshToken } =
        await this.tokenService.generateTokens(
          user.id,
          user.username || user.email,
          user.role,
          user.avatar ?? undefined
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

  /**
   * Authenicates an User using Apple OAuth 2.0
   *
   * @param appletoken - The apple token to validate using Apple's OAuth 2.0 service
   * @returns access token, refreh token and user information
   *
   * @throws {Error} If the authenication fails or is not successful
   */
  public async appleOAuth(appleToken: string) {
    try {
      return;
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }
      logger.error(`[AuthService] appleOAuth failed: ${err?.message ?? err}`);
      httpError(500, "Internal server error");
    }
  }

  /**
   * Logouts an User by invalidating their assigned refresh token
   *
   * @param token - The refresh token to invalidate
   * @returns Boolean whether the logout was successful
   *
   * @throws {Error} If the invalidation fails
   */
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
        `[AuthService] generateNewTokens failed: ${err?.message ?? err}`
      );
      httpError(500, "Internal server error");
    }
  }

  /**
   * Logouts an User by invalidating their assigned refresh token
   *
   * @param token - The refresh token to invalidate
   * @returns Boolean whether the logout was successful
   *
   * @throws {Error} If the invalidation fails
   */
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

  /**
   * Compares a plain password against a bcrypt hashed password
   *
   * @param plainPassword - The plaintext password to compare
   * @param hashPassword - The hashPassword from the Database
   * @returns Boolean whether the two passwords matches
   *
   * @throws {Error} If the comparison operation fails
   */
  private async comparePassword(
    plainPassword: string,
    hashPassword: string
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashPassword);
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }
      logger.error(`[AuthService] authLogout failed: ${err?.message ?? err}`);
      httpError(500, "Internal server error");
    }
  }

  /**
   * Hashes a plaintext password using bcrypt with a cost factor of 10.
   *
   * @param password - The plaintext password to hash.
   * @returns The hashed password string.
   *
   * @throws {Error} If the hashing operation fails.
   */
  private async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, 10);
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }
      logger.error(`[AuthService] hashPassword failed: ${err?.message ?? err}`);
      httpError(500, "Internal server error");
    }
  }
}

export { AuthService };
