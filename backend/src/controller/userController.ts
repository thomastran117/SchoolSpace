import type { FastifyReply, FastifyRequest } from "fastify";
import type { RoleUpdateDto, UserUpdateDto } from "../dto/userSchema";
import type { UserPayload } from "../models/token";
import type { UserService } from "../service/userService";
import { httpError, HttpError } from "../utility/httpUtility";
import { sanitizeProfileImage } from "../utility/imageUtility";
import logger from "../utility/logger";

class UserController {
  private readonly userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;

    this.getUser = this.getUser.bind(this);
    this.updateAvatar = this.updateAvatar.bind(this);
    this.updateRole = this.updateRole.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
  }

  public async getUser(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id: userId, role: userRole } = req.user as UserPayload;
      const { id: queryUserId } = req.params as unknown as { id?: number };

      const effectiveUserId =
        userRole === "admin" && queryUserId ? queryUserId : userId;

      const user = await this.userService.getUser(effectiveUserId);

      return reply.code(200).send({
        message: "User retrieved successfully",
        data: user,
      });
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }

      logger.error(`[UserController] getUser failed: ${err?.message ?? err}`);

      throw new HttpError(500, "Internal server error");
    }
  }

  public async updateUser(
    req: FastifyRequest<{ Body: UserUpdateDto }>,
    reply: FastifyReply,
  ) {
    try {
      const token = req.cookies.refreshToken;
      if (!token) httpError(401, "Missing refresh token");

      const { id: userId, role: userRole } = req.user as UserPayload;
      const { id: queryUserId } = req.params as unknown as { id?: number };
      const effectiveUserId =
        userRole === "admin" && queryUserId ? queryUserId : userId;
      const effectiveToken = userRole === "admin" ? undefined : token;

      const { username, name, phone, address, faculty, school } = req.body;

      const {
        accessToken,
        refreshToken,
        role,
        username: newUsername,
        avatar,
      } = await this.userService.updateUser(
        effectiveUserId,
        {
          username,
          name,
          phone,
          address,
          faculty,
          school,
        },
        effectiveToken,
      );

      if (userRole !== "admin") {
        reply.setCookie("refreshToken", refreshToken, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: "/",
        });
      }

      return reply.code(200).send({
        message: "Profile updated successfully",
        accessToken,
        role,
        avatar: avatar ?? undefined,
        username: newUsername ?? undefined,
      });
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }

      logger.error(
        `[UserController] updateUser failed: ${err?.message ?? err}`,
      );

      throw new HttpError(500, "Internal server error");
    }
  }

  public async updateRole(
    req: FastifyRequest<{ Body: RoleUpdateDto }>,
    reply: FastifyReply,
  ) {
    try {
      const token = req.cookies.refreshToken;

      const { id: userId, role: userRole } = req.user as UserPayload;
      const { id: queryUserId } = req.params as unknown as { id?: number };
      const effectiveUserId =
        userRole === "admin" && queryUserId ? queryUserId : userId;

      if (!(userRole === "admin" || userRole === "undefined"))
        throw httpError(
          409,
          "The user role is set already. Contact support to change it",
        );

      const effectiveToken = userRole === "admin" ? undefined : token;
      const { role: requestedRole } = req.body;

      const {
        accessToken,
        refreshToken,
        role,
        username: newUsername,
        avatar,
      } = await this.userService.updateRole(
        effectiveUserId,
        requestedRole,
        effectiveToken,
      );

      if (userRole !== "admin") {
        reply.setCookie("refreshToken", refreshToken, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: "/",
        });
      }

      return reply.code(200).send({
        message: "Role updated successfully",
        accessToken,
        role,
        avatar: avatar ?? undefined,
        username: newUsername ?? undefined,
      });
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }

      logger.error(
        `[UserController] updateRole failed: ${err?.message ?? err}`,
      );

      throw new HttpError(500, "Internal server error");
    }
  }

  public async updateAvatar(req: FastifyRequest, reply: FastifyReply) {
    try {
      const token = req.cookies.refreshToken;

      const { id: userId, role: userRole } = req.user as UserPayload;
      const { id: queryUserId } = req.params as { id?: number };

      const file = await req.file();
      if (!file) httpError(400, "Missing file");

      const effectiveUserId =
        userRole === "admin" && queryUserId ? queryUserId : userId;
      const effectiveToken = userRole === "admin" ? undefined : token;

      const { fileName, sanitizedBuffer } = await sanitizeProfileImage(file);

      const buffer = await file.toBuffer();

      const normalizedFile = {
        buffer: sanitizedBuffer ?? buffer,
        originalname: fileName,
        mimetype: file.mimetype,
        size: file.file.bytesRead,
      };

      const { accessToken, refreshToken, role, username, avatar } =
        await this.userService.updateAvatar(
          effectiveUserId,
          normalizedFile as any,
          effectiveToken,
        );

      if (userRole !== "admin") {
        reply.setCookie("refreshToken", refreshToken, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: "/",
        });
      }

      return reply.code(200).send({
        message: "Avatar updated successfully",
        accessToken,
        role,
        avatar: avatar ?? undefined,
        username: username ?? undefined,
      });
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }

      logger.error(
        `[UserController] updateAvatar failed: ${err?.message ?? err}`,
      );

      throw new HttpError(500, "Internal server error");
    }
  }

  public async deleteUser(req: FastifyRequest, reply: FastifyReply) {
    try {
      const token = req.cookies.refreshToken;
      const { id: userId, role: userRole } = req.user as UserPayload;
      const { id: queryUserId } = req.params as unknown as { id?: number };
      const effectiveUserId =
        userRole === "admin" && queryUserId ? queryUserId : userId;
      const effectiveToken = userRole === "admin" ? undefined : token;

      await this.userService.deleteUser(effectiveUserId, effectiveToken);

      return reply.code(200).send({ message: "User deleted successfully" });
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }

      logger.error(
        `[UserController] deleteUser failed: ${err?.message ?? err}`,
      );

      throw new HttpError(500, "Internal server error");
    }
  }
}

export { UserController };
