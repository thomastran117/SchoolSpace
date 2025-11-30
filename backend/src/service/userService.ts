import type { AuthResponse } from "../models/auth";
import type { Role, SafeUser, User } from "../models/user";
import type { UserRepository } from "../repository/userRepository";
import { HttpError, httpError } from "../utility/httpUtility";
import logger from "../utility/logger";
import { BaseService } from "./baseService";
import type { FileService } from "./fileService";
import type { TokenService } from "./tokenService";

class UserService extends BaseService {
  private readonly userRepository: UserRepository;
  private readonly tokenService?: TokenService;
  private readonly fileService?: FileService;

  constructor(
    userRepository: UserRepository,
    tokenService?: TokenService,
    fileService?: FileService,
  ) {
    super();
    this.userRepository = userRepository;
    this.tokenService = tokenService;
    this.fileService = fileService;
  }

  public async updateAvatar(
    userID: number,
    image: Express.Multer.File,
    oldRefreshToken: string,
  ): Promise<AuthResponse> {
    try {
      if (!this.fileService || !this.tokenService)
        httpError(503, `Service is not ready to serve this route`);

      const user = await this.userRepository.findById(userID);
      if (!user) httpError(404, `User with ID ${userID} is not found`);

      const oldAvatar = user.avatar;

      const { publicUrl } = await this.fileService.uploadFile(
        image.buffer,
        image.originalname,
        "profile",
      );

      const updated = await this.userRepository.update(userID, {
        avatar: publicUrl,
      });

      if (
        oldAvatar &&
        (await this.userRepository.countByAvatar(oldAvatar)) <= 1
      ) {
        this.fileService.deleteFile("profile", oldAvatar);
      }

      const { accessToken, refreshToken } =
        await this.tokenService.generateTokens(
          updated.id,
          updated.username || updated.email,
          updated.role,
          updated.avatar ?? undefined,
          true,
        );

      if (oldRefreshToken) await this.tokenService.logoutToken(oldRefreshToken);

      return {
        accessToken,
        refreshToken,
        role: updated.role,
        id: updated.id,
        username: updated.username,
        avatar: updated.avatar,
      };
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }
      logger.error(`[UserService] updateAvatar failed: ${err?.message ?? err}`);
      httpError(500, "Internal server error");
    }
  }

  public async updateRole(
    userID: number,
    role: Role,
    oldRefreshToken: string,
  ): Promise<AuthResponse> {
    try {
      if (!this.tokenService)
        httpError(503, `Service is not ready to serve this route`);

      const user = await this.userRepository.findById(userID);
      if (!user) httpError(404, `User with ID ${userID} is not found`);

      const updated = await this.userRepository.update(userID, { role });

      const { accessToken, refreshToken } =
        await this.tokenService.generateTokens(
          updated.id,
          updated.username || updated.email,
          updated.role,
          updated.avatar ?? undefined,
          true,
        );

      if (oldRefreshToken) await this.tokenService.logoutToken(oldRefreshToken);

      return {
        accessToken,
        refreshToken,
        role: updated.role,
        id: updated.id,
        username: updated.username,
        avatar: updated.avatar,
      };
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }
      logger.error(`[UserService] updateRole failed: ${err?.message ?? err}`);
      httpError(500, "Internal server error");
    }
  }

  public async updateUser(
    userID: number,
    oldRefreshToken: string,
    data: {
      username?: string;
      name?: string;
      phone?: string;
      address?: string;
      faculty?: string;
      school?: string;
    },
  ): Promise<AuthResponse> {
    try {
      if (!this.tokenService)
        httpError(503, `Service is not ready to serve this route`);

      if (data.username) {
        const existingUser = await this.userRepository.findByUsername(
          data.username,
        );
        if (existingUser && existingUser?.id !== userID) {
          throw httpError(
            409,
            `A user with the username "${data.username}" already exists. Choose another username.`,
          );
        }
      }

      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined),
      );

      const updated = await this.userRepository.update(userID, cleanData);

      const { accessToken, refreshToken } =
        await this.tokenService.generateTokens(
          updated.id,
          updated.username || updated.email,
          updated.role,
          updated.avatar ?? undefined,
          true,
        );

      if (oldRefreshToken) await this.tokenService.logoutToken(oldRefreshToken);

      return {
        accessToken,
        refreshToken,
        role: updated.role,
        id: updated.id,
        username: updated.username,
        avatar: updated.avatar,
      };
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }
      logger.error(`[UserService] updateUser failed: ${err?.message ?? err}`);
      httpError(500, "Internal server error");
    }
  }

  public async deleteUser(id: number, oldRefreshToken: string) {
    try {
      if (!this.tokenService)
        httpError(503, `Service is not ready to serve this route`);

      const user = await this.userRepository.findById(id);
      if (!user) httpError(404, `User with the ID ${id} is not found`);
      await this.userRepository.delete(id);

      if (oldRefreshToken) await this.tokenService.logoutToken(oldRefreshToken);

      return;
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }
      logger.error(`[UserService] deleteUser failed: ${err?.message ?? err}`);
      httpError(500, "Internal server error");
    }
  }

  public async getUser(id: number): Promise<SafeUser> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) httpError(404, `User with the ID ${id} is not found`);

      return this.toSafeUser(user);
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }
      logger.error(`[UserService] getUser failed: ${err?.message ?? err}`);
      httpError(500, "Internal server error");
    }
  }

  public async getUsers(role?: Role): Promise<SafeUser[]> {
    try {
      const users = await this.userRepository.findAll(role);
      return this.toSafeUsers(users);
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }
      logger.error(`[UserService] getUsers failed: ${err?.message ?? err}`);
      httpError(500, "Internal server error");
    }
  }

  private toSafeUser(user: User): SafeUser {
    const {
      password,
      phone,
      address,
      googleId,
      microsoftId,
      msIssuer,
      msTenantId,
      provider,
      ...safe
    } = user;
    return safe;
  }

  private toSafeUsers(users: User[]): SafeUser[] {
    return users.map((u) => this.toSafeUser(u));
  }
}

export { UserService };
