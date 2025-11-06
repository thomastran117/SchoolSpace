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
import prisma from "../resource/prisma";
import env from "../config/envConfigs";
import type { TokenPayload } from "google-auth-library";
import { OAuth2Client } from "google-auth-library";
import logger from "../utility/logger";
import { httpError } from "../utility/httpUtility";

import { verifyMicrosoftIdToken } from "./oauth/microsoft-service";
import { verifyGoogleCaptcha } from "./webService";

import type { TokenService } from "./tokenService";
import type { EmailService } from "./emailService";

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  role: string;
  id: number;
  username?: string | null;
  avatar?: string | null;
}

const { frontend_client: FRONTEND_CLIENT, google_client_id: GOOGLE_CLIENT_ID } =
  env;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

class AuthService {
  private readonly emailService: EmailService;
  private readonly tokenService: TokenService;

  constructor(emailService: EmailService, tokenService: TokenService) {
    this.emailService = emailService;
    this.tokenService = tokenService;
  }

  public async loginUser(
    email: string,
    password: string,
    remember: boolean,
    captcha: string,
  ): Promise<AuthResponse> {
    if (env.isCaptchaEnabled()) {
      const result = await verifyGoogleCaptcha(captcha ?? "");
      if (!result) httpError(401, "Invalid captcha");
    } else {
      logger.warn("Google Captcha is not available");
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) httpError(401, "Invalid credentials");

    if (!user.password) httpError(401, "This account uses OAuth login only");

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) httpError(401, "Invalid credentials");

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
  }

  public async signupUser(
    email: string,
    password: string,
    role: string,
    captcha: string,
  ): Promise<boolean> {
    if (env.isCaptchaEnabled()) {
      const result = await verifyGoogleCaptcha(captcha ?? "");
      if (!result) httpError(401, "Invalid captcha");
    } else {
      logger.warn("Google Captcha is not available");
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
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
      await prisma.user.create({
        data: { email, password: hashedPassword, role: role as any },
      });
    }

    return true;
  }

  public async verifyUser(token: string) {
    const { email, password, role } =
      await this.tokenService.validateVerifyToken(token);
    const user = await prisma.user.create({
      data: { email, password, role: role as any },
    });

    if (env.isEmailEnabled()) {
      await this.emailService.sendWelcomeEmail(email);
    }

    return user;
  }

  public async microsoftOAuth(idToken: string): Promise<AuthResponse> {
    const claims = await verifyMicrosoftIdToken(idToken);

    const microsoftSub = (claims as any).sub || (claims as any).oid;
    const email = (claims as any).email || (claims as any).preferred_username;
    const name = (claims as any).name || "";

    if (!email) httpError(400, "Microsoft email missing");
    if (!microsoftSub) httpError(400, "Microsoft subject missing");

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.findFirst({
        where: { microsoftId: microsoftSub },
      });
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          provider: "microsoft",
          password: null,
          microsoftId: microsoftSub,
          role: "notdefined",
        },
      });
    } else if (!user.microsoftId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          microsoftId: microsoftSub,
          provider: "microsoft",
          name: user.name || name,
        },
      });
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
  }

  public async googleOAuth(googleToken: string): Promise<AuthResponse> {
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload: TokenPayload | undefined = ticket.getPayload();

    if (!payload || !payload.sub) {
      httpError(401, "Invalid Google token payload");
    }

    const googleUser = {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      sub: payload.sub,
    };

    if (!googleUser?.email) httpError(401, "Invalid Google token");

    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: googleUser.email!,
          name: googleUser.name,
          avatar: googleUser.picture,
          googleId: googleUser.sub,
          provider: "google",
          role: "notdefined",
        },
      });
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
  }

  public async generateNewTokens(oldToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    role: string;
    username: string;
    avatar?: string;
  }> {
    const { accessToken, refreshToken, role, username, avatar } =
      await this.tokenService.rotateRefreshToken(oldToken);
    return { accessToken, refreshToken, role, username, avatar };
  }

  public async authLogout(token: string): Promise<boolean> {
    return await this.tokenService.logoutToken(token);
  }
}

export { AuthService };
