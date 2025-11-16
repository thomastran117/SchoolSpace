interface UserPayload {
  id: number;
  email: string;
  role: string;
}

interface TokenPayloadBase {
  userId: number;
  username: string;
  role: string;
  avatar?: string;
  remember?: boolean;
}

interface RefreshTokenPayload extends TokenPayloadBase {
  jti: string;
  exp: number;
  iat: number;
}

interface VerifyTokenPayload {
  sub: string;
  jti: string;
  purpose: string;
  exp: number;
  iat: number;
}

export type {
  UserPayload,
  TokenPayloadBase,
  RefreshTokenPayload,
  VerifyTokenPayload,
};
