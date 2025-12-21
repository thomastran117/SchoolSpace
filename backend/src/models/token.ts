interface UserPayload {
  id: string;
  email: string;
  role: string;
}

interface TokenPayloadBase {
  userId: string;
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
  RefreshTokenPayload,
  TokenPayloadBase,
  UserPayload,
  VerifyTokenPayload,
};
