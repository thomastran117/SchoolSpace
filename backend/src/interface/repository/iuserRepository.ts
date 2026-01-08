import type { Provider, Role, User } from "../../models/user";

interface IUserRepository {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  findMicrosoftUser(
    msIssuer: string,
    msTenantId: string,
    microsoftId: string
  ): Promise<User | null>;
  findAll(role?: Role): Promise<User[]>;
  findByIds(ids: number[]): Promise<User[]>;
  findByUsernames(usernames: string[]): Promise<User[]>;
  filterUsers(opts: {
    role?: Role;
    provider?: Provider;
    email?: string;
    search?: string;
  }): Promise<User[]>;
  create(data: {
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
  }): Promise<User>;
  update(
    id: number,
    data: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>
  ): Promise<User>;
  delete(id: number): Promise<boolean>;
}

export type { IUserRepository };
