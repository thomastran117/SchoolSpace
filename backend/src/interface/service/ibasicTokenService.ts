interface IBasicTokenService {
  validateAccessToken(token: string): {
    userId: number;
    username: string;
    role: string;
    avatar?: string;
  };
  getUserPayload(token: string): { id: number; role: string; email: string };
  decodeUserId(token: string): string | null;
}

export type { IBasicTokenService };
