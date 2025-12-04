import { BaseRepository } from "./baseRepository";
import type { Provider, Role, User } from "../models/user";
import prisma from "../resource/prisma";

class UserRepository extends BaseRepository {
  constructor() {
    super({ maxRetries: 3, baseDelay: 150 });
  }

  public async findById(id: number): Promise<User | null> {
    return this.withRetry("UserRepository.findById", async () =>
      prisma.user.findUnique({ where: { id } })
    );
  }

  public async findByEmail(email: string): Promise<User | null> {
    return this.withRetry("UserRepository.findByEmail", async () =>
      prisma.user.findUnique({ where: { email } })
    );
  }

  public async findByUsername(username: string): Promise<User | null> {
    return this.withRetry("UserRepository.findByUsername", async () =>
      prisma.user.findUnique({ where: { username } })
    );
  }

  public async findByGoogleId(googleId: string): Promise<User | null> {
    return this.withRetry("UserRepository.findByGoogleId", async () =>
      prisma.user.findUnique({ where: { googleId } })
    );
  }

  public async findByMicrosoftId(msId: string): Promise<User | null> {
    return this.withRetry("UserRepository.findByMicrosoftId", async () =>
      prisma.user.findUnique({ where: { microsoftId: msId } })
    );
  }

  public async findMicrosoftUser(
    msIssuer: string,
    msTenantId: string,
    microsoftId: string
  ): Promise<User | null> {
    return this.withRetry("UserRepository.findMicrosoftUser", async () =>
      prisma.user.findFirst({
        where: { microsoftId, msIssuer, msTenantId },
      })
    );
  }

  public async findAll(role?: Role): Promise<User[]> {
    return this.withRetry("UserRepository.findAll", async () =>
      prisma.user.findMany({
        where: role ? { role } : {},
        orderBy: { id: "asc" },
      })
    );
  }

  public async countByAvatar(url: string): Promise<number> {
    return this.withRetry("UserRepository.countByAvatar", async () =>
      prisma.user.count({ where: { avatar: url } })
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

    return this.withRetry("UserRepository.filterUsers", async () =>
      prisma.user.findMany({
        where,
        orderBy: { id: "asc" },
      })
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
    return this.withRetry("UserRepository.create", async () =>
      prisma.user.create({ data })
    );
  }

  public async update(id: number, data: Partial<Omit<User, "id">>): Promise<User> {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );

    if (Object.keys(cleanData).length === 0) {
      throw new Error("[UserRepository.update] No fields provided for update");
    }

    return this.withRetry("UserRepository.update", async () =>
      prisma.user.update({
        where: { id },
        data: cleanData,
      })
    );
  }

  public async delete(id: number): Promise<boolean> {
    await this.withRetry("UserRepository.delete", async () =>
      prisma.user.delete({ where: { id } })
    );
    return true;
  }
}

export { UserRepository };
