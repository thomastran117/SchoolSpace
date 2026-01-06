type Provider = "local" | "google" | "microsoft";
type Role = "notdefined" | "student" | "teacher" | "assistant" | "admin";

type UserCreateInput = {
  email: string;
  provider: Provider;
  role?: Role;
  password?: string | null;
  googleId?: string | null;
  microsoftId?: string | null;
  msTenantId?: string | null;
  msIssuer?: string | null;
  username?: string | null;
  name?: string | null;
  avatar?: string | null;
  phone?: string | null;
  address?: string | null;
  faculty?: string | null;
  school?: string | null;
};

interface User {
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

type SafeUser = Omit<
  User,
  | "password"
  | "phone"
  | "address"
  | "googleId"
  | "microsoftId"
  | "msTenantId"
  | "msIssuer"
  | "provider"
>;

export type { Provider, Role, SafeUser, User, UserCreateInput };
