/**
 * @file auth.ts
 * @description
 * Auth related models
 *
 * @module models
 * @version 1.0.0
 * @auth Thomas
 */
interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  role: string;
  id: number;
  username?: string | null;
  avatar?: string | null;
}

export type { AuthResponse };
