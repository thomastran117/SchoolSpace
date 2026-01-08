import type { Provider, Role } from "../generated/prisma/enums";
import type { UserModel as User } from "../generated/prisma/models/User";
import type { UserCreateInput } from "../models/user";
import prisma from "../resource/prisma";
import { BaseRepository } from "./baseRepository";

class UserRepository extends BaseRepository {
  constructor() {
    super({ maxRetries: 3, baseDelay: 150 });
  }

  public async findById(id: number): Promise<User | null> {
    return this.executeAsync(() => prisma.user.findUnique({ where: { id } }));
  }

  public async findByEmail(email: string): Promise<User | null> {
    return this.executeAsync(() =>
      prisma.user.findUnique({ where: { email } })
    );
  }

  public async findByUsername(username: string): Promise<User | null> {
    return this.executeAsync(() =>
      prisma.user.findUnique({ where: { username } })
    );
  }

  public async findByGoogleId(googleId: string): Promise<User | null> {
    return this.executeAsync(() =>
      prisma.user.findUnique({ where: { googleId } })
    );
  }

  public async findMicrosoftUser(
    msIssuer: string,
    msTenantId: string,
    microsoftId: string
  ): Promise<User | null> {
    return this.executeAsync(() =>
      prisma.user.findUnique({
        where: {
          microsoftId_msIssuer_msTenantId: {
            microsoftId,
            msIssuer,
            msTenantId,
          },
        },
      })
    );
  }

  public async findAll(role?: Role): Promise<User[]> {
    return this.executeAsync(() =>
      prisma.user.findMany({
        where: role ? { role } : undefined,
        orderBy: { createdAt: "asc" },
      })
    );
  }

  public async findByIds(ids: number[]): Promise<User[]> {
    if (!ids.length) return [];

    return this.executeAsync(
      () =>
        prisma.user.findMany({
          where: { id: { in: ids } },
        }),
      { deadlineMs: 1200 }
    );
  }

  public async findByUsernames(usernames: string[]): Promise<User[]> {
    if (!usernames.length) return [];

    return this.executeAsync(
      () =>
        prisma.user.findMany({
          where: { username: { in: usernames } },
        }),
      { deadlineMs: 1200 }
    );
  }

  public async countByAvatar(url: string): Promise<number> {
    return this.executeAsync(() =>
      prisma.user.count({ where: { avatar: url } })
    );
  }

  public async filterUsers(opts: {
    role?: Role;
    provider?: Provider;
    email?: string;
    search?: string;
  }): Promise<User[]> {
    const { role, provider, email, search } = opts;

    return this.executeAsync(() =>
      prisma.user.findMany({
        where: {
          role,
          provider,
          email,
          ...(search && {
            OR: [
              { email: { contains: search, mode: "insensitive" } },
              { username: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
            ],
          }),
        },
        orderBy: { createdAt: "asc" },
      })
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
    return this.executeAsync(async () => {
      return await prisma.user.create({ data });
    });
  }

  public async update(
    id: number,
    data: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>
  ): Promise<User> {
    if ("version" in data)
      throw new Error("Version cannot be updated directly");

    return this.executeAsync(async () => {
      const result = await prisma.user.update({
        where: { id },
        data: {
          ...data,
        },
      });

      return result;
    });
  }

  public async delete(id: number): Promise<boolean> {
    return this.executeAsync(async () => {
      await prisma.user.delete({ where: { id } });
      return true;
    });
  }
}

export { UserRepository };
