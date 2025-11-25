import type { Provider, Role, User } from "../models/user";
import prisma from "../resource/prisma";

class UserRepository {
  public async findById(id: number): Promise<User | null> {
    try {
      return await prisma.user.findUnique({ where: { id } });
    } catch (err: any) {
      throw new Error(
        `[UserRepository] findById failed: ${err?.message ?? err}`,
      );
    }
  }

  public async findByEmail(email: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({ where: { email } });
    } catch (err: any) {
      throw new Error(
        `[UserRepository] findByEmail failed: ${err?.message ?? err}`,
      );
    }
  }

  public async findByUsername(username: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({ where: { username } });
    } catch (err: any) {
      throw new Error(
        `[UserRepository] findByUsername failed: ${err?.message ?? err}`,
      );
    }
  }

  public async findByGoogleId(googleId: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({ where: { googleId } });
    } catch (err: any) {
      throw new Error(
        `[UserRepository] findByGoogleId failed: ${err?.message ?? err}`,
      );
    }
  }

  public async findByMicrosoftId(msId: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({ where: { microsoftId: msId } });
    } catch (err: any) {
      throw new Error(
        `[UserRepository] findByMicrosoftId failed: ${err?.message ?? err}`,
      );
    }
  }

  public async findMicrosoftUser(
    msIssuer: string,
    msTenantId: string,
    microsoftId: string,
  ): Promise<User | null> {
    try {
      return await prisma.user.findFirst({
        where: {
          microsoftId,
          msIssuer,
          msTenantId,
        },
      });
    } catch (err: any) {
      throw new Error(
        `[UserRepository] findMicrosoftUser failed: ${err?.message ?? err}`,
      );
    }
  }

  public async findAll(role?: Role): Promise<User[]> {
    try {
      const where: any = {};
      if (role) where.role = role;

      return await prisma.user.findMany({
        where,
        orderBy: { id: "asc" },
      });
    } catch (err: any) {
      throw new Error(
        `[UserRepository] findAll failed: ${err?.message ?? err}`,
      );
    }
  }

  public async filterUsers(opts: {
    role?: Role;
    provider?: Provider;
    email?: string;
    search?: string;
  }): Promise<User[]> {
    try {
      const { role, provider, email, search } = opts;

      const where: any = {};

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

      return await prisma.user.findMany({
        where,
        orderBy: { id: "asc" },
      });
    } catch (err: any) {
      throw new Error(
        `[UserRepository] filterUsers failed: ${err?.message ?? err}`,
      );
    }
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
    try {
      return await prisma.user.create({ data });
    } catch (err: any) {
      throw new Error(`[UserRepository] create failed: ${err?.message ?? err}`);
    }
  }

  public async update(
    id: number,
    data: Partial<Omit<User, "id">>,
  ): Promise<User> {
    try {
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined),
      );

      if (Object.keys(cleanData).length === 0) {
        throw new Error("No fields provided for update");
      }

      return await prisma.user.update({
        where: { id },
        data: cleanData,
      });
    } catch (err: any) {
      throw new Error(`[UserRepository] update failed: ${err?.message ?? err}`);
    }
  }

  public async delete(id: number): Promise<boolean> {
    try {
      await prisma.user.delete({ where: { id } });
      return true;
    } catch (err: any) {
      throw new Error(`[UserRepository] delete failed: ${err?.message ?? err}`);
    }
  }
}

export { UserRepository };
