export type Provider = "local" | "google" | "microsoft";
export type Role = "notdefined" | "student" | "teacher" | "assistant" | "admin";

export interface UserModel {
  id: number;
  email: string;
  password?: string | null;
  role: Role;

  username?: string | null;
  name?: string | null;
  avatar?: string | null;
  phone?: string | null;
  address?: string | null;
  faculty?: string | null;
  school?: string | null;

  googleId?: string | null;
  microsoftId?: string | null;
  msTenantId?: string | null;
  msIssuer?: string | null;

  provider: Provider;
}
