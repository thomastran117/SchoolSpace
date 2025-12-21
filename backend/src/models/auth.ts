interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  role: string;
  id: string;
  username?: string | null;
  avatar?: string | null;
}

export type { AuthResponse };
