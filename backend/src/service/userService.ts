import type { Role, User } from "@prisma/client";
import type { AuthResponse } from "../models/auth";
import prisma from "../resource/prisma";
import { httpError } from "../utility/httpUtility";
import type { FileService } from "./fileService";
import type { TokenService } from "./tokenService";

class UserService {
  private readonly tokenService: TokenService;
  private readonly fileService: FileService;

  constructor(tokenService: TokenService, fileService: FileService) {
    this.tokenService = tokenService;
    this.fileService = fileService;
  }

  public async updateAvatar(
    id: number,
    image: Express.Multer.File,
    token: string,
  ): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw httpError(404, "User not found");

    const { fileName, filePath, publicUrl } = await this.fileService.uploadFile(
      image.buffer,
      image.originalname,
      "profile",
    );

    const updated = await prisma.user.update({
      where: { id },
      data: { avatar: publicUrl, updatedAt: new Date() },
    });

    const { accessToken, refreshToken } =
      await this.tokenService.generateTokens(
        updated.id,
        updated.username || updated.email,
        updated.role,
        updated.avatar ?? undefined,
        true,
      );

    await this.tokenService.logoutToken(token);

    return {
      accessToken,
      refreshToken,
      role: updated.role,
      id: updated.id,
      username: updated.username,
      avatar: updated.avatar,
    };
  }

  public async updateRole(
    id: number,
    role: Role,
    token: string,
  ): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw httpError(404, "No user found");

    if (user.role !== "notdefined") {
      throw httpError(
        409,
        "The user role is set already. Contact support to change it",
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role, updatedAt: new Date() },
    });

    const { accessToken, refreshToken } =
      await this.tokenService.generateTokens(
        updated.id,
        updated.username || updated.email,
        updated.role,
        updated.avatar ?? undefined,
        true,
      );

    await this.tokenService.logoutToken(token);

    return {
      accessToken,
      refreshToken,
      role: updated.role,
      id: updated.id,
      username: updated.username,
      avatar: updated.avatar,
    };
  }

  public async updateUser(
    id: number,
    token: string,
    username?: string,
    name?: string,
    phone?: string,
    address?: string,
    faculty?: string,
    school?: string,
  ): Promise<AuthResponse> {
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id },
        },
      });

      if (existingUser) {
        throw httpError(
          409,
          `A user with the username "${username}" already exists. Choose another username.`,
        );
      }
    }

    const data = Object.fromEntries(
      Object.entries({
        username,
        name,
        phone,
        address,
        faculty,
        school,
        updatedAt: new Date(),
      }).filter(([_, v]) => v !== undefined && v !== null),
    );

    const updated = await prisma.user.update({
      where: { id },
      data,
    });

    const { accessToken, refreshToken } =
      await this.tokenService.generateTokens(
        updated.id,
        updated.username || updated.email,
        updated.role,
        updated.avatar ?? undefined,
        true,
      );

    await this.tokenService.logoutToken(token);

    return {
      accessToken,
      refreshToken,
      role: updated.role,
      id: updated.id,
      username: updated.username,
      avatar: updated.avatar,
    };
  }

  public async deleteUser(id: number): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw httpError(404, "User not found");

    await prisma.user.delete({ where: { id } });

    return true;
  }

  public async getUser(
    id: number,
  ): Promise<
    Pick<
      User,
      | "id"
      | "username"
      | "name"
      | "phone"
      | "address"
      | "faculty"
      | "school"
      | "role"
      | "avatar"
      | "createdAt"
      | "updatedAt"
    >
  > {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        phone: true,
        address: true,
        faculty: true,
        school: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) throw httpError(404, "User not found");
    return user;
  }

  public async getUsers(): Promise<
    Array<
      Pick<
        User,
        | "id"
        | "username"
        | "name"
        | "phone"
        | "address"
        | "faculty"
        | "school"
        | "role"
        | "avatar"
        | "createdAt"
        | "updatedAt"
      >
    >
  > {
    return prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        phone: true,
        address: true,
        faculty: true,
        school: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  public async getStudentsByCourse(courseId: number): Promise<User[]> {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        enrollments: { include: { user: true } },
      },
    });

    if (!course) throw httpError(404, "Course not found");

    return course.enrollments
      .map((e) => e.user)
      .filter((u) => u.role === "student");
  }

  public async getTeacherByCourse(courseId: number): Promise<User> {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { owner: true },
    });

    if (!course) throw httpError(404, "Course not found");
    if (!course.owner || course.owner.role !== "teacher")
      throw httpError(404, "Teacher not found for this course");

    return course.owner;
  }
}

export { UserService };
