interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  role: string;
  id: number;
  username?: string | null;
  avatar?: string | null;
}

export type { AuthResponse };
