import type { Provider, Role, User } from "../models/user";
import { BaseRepository } from "./baseRepository";

class UserRepository extends BaseRepository {
  constructor() {
    super({ maxRetries: 3, baseDelay: 150 });
  }

  public async findById(id: number): Promise<User | null> {
    return this.executeAsync(
      () => this.prisma.user.findUnique({ where: { id } }),
      { deadlineMs: 800 }
    );
  }

  public async findByEmail(email: string): Promise<User | null> {
    return this.executeAsync(
      () => this.prisma.user.findUnique({ where: { email } }),
      { deadlineMs: 800 }
    );
  }

  public async findByUsername(username: string): Promise<User | null> {
    return this.executeAsync(
      () => this.prisma.user.findUnique({ where: { username } }),
      { deadlineMs: 800 }
    );
  }

  public async findByGoogleId(googleId: string): Promise<User | null> {
    return this.executeAsync(
      () => this.prisma.user.findUnique({ where: { googleId } }),
      { deadlineMs: 800 }
    );
  }

  public async findMicrosoftUser(
    msIssuer: string,
    msTenantId: string,
    microsoftId: string
  ): Promise<User | null> {
    return this.executeAsync(
      () =>
        this.prisma.user.findUnique({
          where: {
            microsoftId_msIssuer_msTenantId: {
              microsoftId,
              msIssuer,
              msTenantId,
            },
          },
        }),
      { deadlineMs: 800 }
    );
  }

  public async findAll(role?: Role): Promise<User[]> {
    return this.executeAsync(
      () =>
        this.prisma.user.findMany({
          where: role ? { role } : undefined,
          orderBy: { createdAt: "asc" },
        }),
      { deadlineMs: 800 }
    );
  }

  public async findByIds(ids: number[]): Promise<User[]> {
    if (!ids.length) return [];

    return this.executeAsync(
      () =>
        this.prisma.user.findMany({
          where: { id: { in: ids } },
        }),
      { deadlineMs: 1200 }
    );
  }

  public async findByUsernames(usernames: string[]): Promise<User[]> {
    if (!usernames.length) return [];

    return this.executeAsync(
      () =>
        this.prisma.user.findMany({
          where: { username: { in: usernames } },
        }),
      { deadlineMs: 1200 }
    );
  }

  public async countByAvatar(url: string): Promise<number> {
    return this.executeAsync(
      () => this.prisma.user.count({ where: { avatar: url } }),
      { deadlineMs: 800 }
    );
  }

  public async filterUsers(opts: {
    role?: Role;
    provider?: Provider;
    email?: string;
    search?: string;
  }): Promise<User[]> {
    const { role, provider, email, search } = opts;

    return this.executeAsync(
      () =>
        this.prisma.user.findMany({
          where: {
            role,
            provider,
            email,
            ...(search && {
              OR: [
                { email: { contains: search } },
                { username: { contains: search } },
                { name: { contains: search } },
              ],
            }),
          },
          orderBy: { createdAt: "asc" },
        }),
      { deadlineMs: 800 }
    );
  }

  public async create(data: {
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
  }): Promise<User> {
    return this.executeAsync(
      async () => {
        return await this.prisma.user.create({ data });
      },
      { deadlineMs: 1000 }
    );
  }

  public async update(
    id: number,
    data: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>
  ): Promise<User> {
    if ("version" in data)
      throw new Error("Version cannot be updated directly");

    return this.executeAsync(
      async () => {
        const result = await this.prisma.user.update({
          where: { id },
          data: {
            ...data,
          },
        });

        return result;
      },
      { deadlineMs: 1000 }
    );
  }

  public async delete(id: number): Promise<boolean> {
    return this.executeAsync(
      async () => {
        await this.prisma.user.delete({ where: { id } });
        return true;
      },
      { deadlineMs: 1000 }
    );
  }
}

export { UserRepository };
