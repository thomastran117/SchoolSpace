/**
 * @file token.ts
 * @description
 * Token related models
 *
 * @module models
 * @version 1.0.0
 * @auth Thomas
 */ interface UserPayload {
  id: number;
  email: string;
  role: string;
}

export type { UserPayload };
