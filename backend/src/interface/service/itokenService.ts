import type { IBasicTokenService } from "./ibasicTokenService";

interface ITokenService extends IBasicTokenService {
  validate;
  isRefreshTokenValid(token: string): Promise<boolean>;
  rotateRefreshToken(oldToken: string): {
    accessToken: string;
    refreshToken: string;
    role: string;
    username: string;
    avatar: string;
    id: number;
  };
  logoutToken(token: string): boolean;
  createEmailCode(
    email: string,
    passwordHash: string,
    role: string
  ): { code?: string; alreadySent: boolean };
  verifyEmailCode(
    email: string,
    code: string
  ): { email: string; password: string; role: string };
}

export type { ITokenService };
