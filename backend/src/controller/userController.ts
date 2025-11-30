import type { NextFunction, Request, Response } from "express";
import type { AuthResponseDto } from "../dto/authSchema";
import type { RoleUpdateDto, UserUpdateDto } from "../dto/userSchema";
import type { UserPayload } from "../models/token";
import type { UserService } from "../service/userService";
import type { TypedRequest, TypedResponse } from "../types/express";
import { httpError, HttpError, sendCookie } from "../utility/httpUtility";
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

  public async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId, role: userRole } = req.user as UserPayload;
      const { id: queryUserId } = req.params as unknown as { id?: number };

      const effectiveUserId =
        userRole === "admin" && queryUserId ? queryUserId : userId;

      const user = await this.userService.getUser(effectiveUserId);

      return res.status(200).json({
        message: "User retrieved successfully",
        data: user,
      });
    } catch (err: any) {
      if (err instanceof HttpError) {
        return next(err);
      }

      logger.error(`[UserController] getUser failed: ${err?.message ?? err}`);

      return next(new HttpError(500, "Internal server error"));
    }
  }

  public async updateUser(
    req: TypedRequest<UserUpdateDto>,
    res: TypedResponse<AuthResponseDto>,
    next: NextFunction,
  ) {
    try {
      const token = req.cookies.refreshToken;
      if (!token) httpError(401, "Missing refresh token");

      const { id: userId, role: userRole } = req.user as UserPayload;
      const { id: queryUserId } = req.params as unknown as { id?: number };
      const effectiveUserId =
        userRole === "admin" && queryUserId ? queryUserId : userId;
      const effectiveToken = userRole === "admin" ? null : token;

      const { username, name, phone, address, faculty, school } = req.body;

      const {
        accessToken,
        refreshToken,
        role,
        username: newUsername,
        avatar,
      } = await this.userService.updateUser(effectiveUserId, effectiveToken, {
        username,
        name,
        phone,
        address,
        faculty,
        school,
      });

      if (userRole !== "admin") sendCookie(res, refreshToken);

      return res.status(200).json({
        message: "Profile updated successfully",
        accessToken,
        role,
        avatar: avatar ?? undefined,
        username: newUsername ?? undefined,
      });
    } catch (err: any) {
      if (err instanceof HttpError) {
        return next(err);
      }

      logger.error(
        `[UserController] updateUser failed: ${err?.message ?? err}`,
      );

      return next(new HttpError(500, "Internal server error"));
    }
  }

  public async updateRole(
    req: TypedRequest<RoleUpdateDto>,
    res: TypedResponse<AuthResponseDto>,
    next: NextFunction,
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

      const effectiveToken = userRole === "admin" ? null : token;
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

      if (userRole !== "admin") sendCookie(res, refreshToken);

      return res.status(200).json({
        message: "Role updated successfully",
        accessToken,
        role,
        avatar: avatar ?? undefined,
        username: newUsername ?? undefined,
      });
    } catch (err: any) {
      if (err instanceof HttpError) {
        return next(err);
      }

      logger.error(
        `[UserController] updateRole failed: ${err?.message ?? err}`,
      );

      return next(new HttpError(500, "Internal server error"));
    }
  }

  public async updateAvatar(
    req: Request,
    res: TypedResponse<AuthResponseDto>,
    next: NextFunction,
  ) {
    try {
      const token = req.cookies.refreshToken;

      const { id: userId, role: userRole } = req.user as UserPayload;
      const { id: queryUserId } = req.params as unknown as { id?: number };
      const file = req.file;
      if (!file) httpError(400, "Missing file");

      const effectiveUserId =
        userRole === "admin" && queryUserId ? queryUserId : userId;
      const effectiveToken = userRole === "admin" ? null : token;

      const { fileName, sanitizedBuffer } = await sanitizeProfileImage(file);
      file.buffer = sanitizedBuffer;
      file.originalname = fileName;

      const { accessToken, refreshToken, role, username, avatar } =
        await this.userService.updateAvatar(
          effectiveUserId,
          file,
          effectiveToken,
        );

      if (userRole !== "admin") sendCookie(res, refreshToken);

      return res.status(200).json({
        message: "Avatar updated successfully",
        accessToken,
        role,
        avatar: avatar ?? undefined,
        username: username ?? undefined,
      });
    } catch (err: any) {
      if (err instanceof HttpError) {
        return next(err);
      }

      logger.error(
        `[UserController] updateAvatar failed: ${err?.message ?? err}`,
      );

      return next(new HttpError(500, "Internal server error"));
    }
  }

  public async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.refreshToken;
      const { id: userId, role: userRole } = req.user as UserPayload;
      const { id: queryUserId } = req.params as unknown as { id?: number };
      const effectiveUserId =
        userRole === "admin" && queryUserId ? queryUserId : userId;
      const effectiveToken = userRole === "admin" ? null : token;

      await this.userService.deleteUser(effectiveUserId, effectiveToken);

      return res.status(200).json({ message: "User deleted successfully" });
    } catch (err: any) {
      if (err instanceof HttpError) {
        return next(err);
      }

      logger.error(
        `[UserController] deleteUser failed: ${err?.message ?? err}`,
      );

      return next(new HttpError(500, "Internal server error"));
    }
  }
}

export { UserController };
