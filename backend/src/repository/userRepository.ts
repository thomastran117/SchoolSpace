import type { Provider, Role, User } from "../models/user";
import prisma from "../resource/prisma";
import { BaseRepository } from "./baseRepository";

class UserRepository extends BaseRepository {
  constructor() {
    super({ maxRetries: 3, baseDelay: 150 });
  }

  public async findById(id: number): Promise<User | null> {
    return this.executeAsync(async () =>
      prisma.user.findUnique({ where: { id } }),
    );
  }

  public async findByEmail(email: string): Promise<User | null> {
    return this.executeAsync(async () =>
      prisma.user.findUnique({ where: { email } }),
    );
  }

  public async findByUsername(username: string): Promise<User | null> {
    return this.executeAsync(async () =>
      prisma.user.findUnique({ where: { username } }),
    );
  }

  public async findByGoogleId(googleId: string): Promise<User | null> {
    return this.executeAsync(async () =>
      prisma.user.findUnique({ where: { googleId } }),
    );
  }

  public async findByMicrosoftId(msId: string): Promise<User | null> {
    return this.executeAsync(async () =>
      prisma.user.findUnique({ where: { microsoftId: msId } }),
    );
  }

  public async findMicrosoftUser(
    msIssuer: string,
    msTenantId: string,
    microsoftId: string,
  ): Promise<User | null> {
    return this.executeAsync(async () =>
      prisma.user.findFirst({
        where: { microsoftId, msIssuer, msTenantId },
      }),
    );
  }

  public async findAll(role?: Role): Promise<User[]> {
    return this.executeAsync(async () =>
      prisma.user.findMany({
        where: role ? { role } : {},
        orderBy: { id: "asc" },
      }),
    );
  }

  public async countByAvatar(url: string): Promise<number> {
    return this.executeAsync(async () =>
      prisma.user.count({ where: { avatar: url } }),
    );
  }

  public async filterUsers(opts: {
    role?: Role;
    provider?: Provider;
    email?: string;
    search?: string;
  }): Promise<User[]> {
    const where: any = {};
    const { role, provider, email, search } = opts;

    if (role) where.role = role;
    if (provider) where.provider = provider;
    if (email) where.email = email;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    return this.executeAsync(async () =>
      prisma.user.findMany({
        where,
        orderBy: { id: "asc" },
      }),
    );
  }

  public async create(data: {
    email: string;
    provider: Provider;
    role?: Role;
    password?: string;
    googleId?: string | null;
    microsoftId?: string | null;
    msTenantId?: string | null;
    msIssuer?: string | null;
    username?: string | null;
    name?: string | null;
    avatar?: string | null;
  }): Promise<User> {
    return this.executeAsync(async () => prisma.user.create({ data }));
  }

  public async update(
    id: number,
    data: Partial<Omit<User, "id">>,
  ): Promise<User> {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined),
    );

    if (Object.keys(cleanData).length === 0) {
      throw new Error("[UserRepository.update] No fields provided for update");
    }

    return this.executeAsync(async () =>
      prisma.user.update({
        where: { id },
        data: cleanData,
      }),
    );
  }

  public async delete(id: number): Promise<boolean> {
    await this.executeAsync(async () => prisma.user.delete({ where: { id } }));
    return true;
  }
}

export { UserRepository };
