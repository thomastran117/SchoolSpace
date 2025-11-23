import prisma from "../resource/prisma";

import type { User } from "../models/user";

class UserRepository {
  public async findById(id: number): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      return user;
    } catch (err: any) {
      throw new Error(`[UserRepository] findById: ${err?.message ?? err}`);
    }
  }

  public async findAll(role?: "student" | "teacher"): Promise<User[]> {
    try {
      const where: any = {};

      if (role) {
        if (role !== "student" && role !== "teacher") {
          throw new Error(`Invalid role filter: '${role}'`);
        }

        where.role = role;
      }

      const users = await prisma.user.findMany({
        where,
        orderBy: { id: "asc" },
      });

      return users;
    } catch (err: any) {
      throw new Error(
        `[UserRepository] findAll failed: ${err?.message ?? err}`,
      );
    }
  }

  public async create(
    email: string,
    role: string = "undefined",
    provider: string = "local",
    password?: string,
    microsoftId?: any,
    googleId?: any,
  ): Promise<User> {
    try {
      const user = await prisma.user.create({
        data: {
          email,
          password,
          role: role as any,
          microsoftId,
          googleId,
          provider: provider as any,
        },
      });
      return user;
    } catch (err: any) {
      throw new Error(`[UserRepository] create failed: ${err?.message ?? err}`);
    }
  }

  public async update(
    id: number,
    password?: string,
    username?: string,
    name?: string,
    avatar?: string,
    phone?: string,
    address?: string,
    faculty?: string,
    school?: string,
  ): Promise<User> {
    try {
      const data: any = {
        password,
        username,
        name,
        avatar,
        phone,
        address,
        faculty,
        school,
      };

      Object.keys(data).forEach((key) => {
        if (data[key] === undefined) delete data[key];
      });

      if (Object.keys(data).length === 0) {
        throw new Error("No fields provided for update");
      }

      const user = await prisma.user.update({
        where: { id },
        data,
      });

      return user;
    } catch (err: any) {
      throw new Error(`[UserRepository] update failed: ${err?.message ?? err}`);
    }
  }

  public async delete(id: number): Promise<boolean> {
    try {
      await prisma.user.delete({ where: { id } });
      return true;
    } catch (err: any) {
      throw new Error(`[UserRepository] create failed: ${err?.message ?? err}`);
    }
  }

  public async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      return user;
    } catch (err: any) {
      throw new Error(`[UserRepository] create failed: ${err?.message ?? err}`);
    }
  }
}

export { UserRepository };
