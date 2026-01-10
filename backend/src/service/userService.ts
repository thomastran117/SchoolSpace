import type { MultipartFile } from "@fastify/multipart";

import {
  ConflictError,
  HttpError,
  InternalServerError,
  NotFoundError,
} from "../error";
import type { IUserRepository } from "../interface/repository";
import type { AuthResponse } from "../models/auth";
import type { Role, SafeUser } from "../models/user";
import logger from "../utility/logger";
import { BaseService } from "./baseService";
import type { CacheService } from "./cacheService";
import type { FileService } from "./fileService";
import type { TokenService } from "./tokenService";

class UserService extends BaseService {
  private readonly userRepository: IUserRepository;
  private readonly cacheService: CacheService;
  private readonly tokenService: TokenService;
  private readonly fileService: FileService;
  private readonly ttl = 300;

  constructor(dependencies: {
    userRepository: IUserRepository;
    cacheService: CacheService;
    tokenService: TokenService;
    fileService: FileService;
  }) {
    super();
    this.userRepository = dependencies.userRepository;
    this.cacheService = dependencies.cacheService;
    this.tokenService = dependencies.tokenService;
    this.fileService = dependencies.fileService;
  }

  private userCacheKey(userID: number) {
    return `user:id:${userID}`;
  }

  private async invalidateUserCache(userID: number): Promise<void> {
    await this.cacheService.delete(this.userCacheKey(userID));
  }

  private async writeUserCache(
    userID: number,
    safeUser: SafeUser
  ): Promise<void> {
    await this.cacheService.set(this.userCacheKey(userID), safeUser, this.ttl);
  }

  public async updateAvatar(
    userID: number,
    image: MultipartFile,
    oldRefreshToken?: string
  ): Promise<AuthResponse> {
    try {
      const user = await this.userRepository.findById(userID);
      if (!user) throw new NotFoundError({ message: "User is not found" });

      const oldAvatar = user.avatar;
      const buffer = await image.toBuffer();

      const { publicUrl } = await this.fileService.uploadFile(
        buffer,
        image.filename,
        "profile"
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
          true
        );

      if (oldRefreshToken) await this.tokenService.logoutToken(oldRefreshToken);

      await this.invalidateUserCache(updated.id);
      await this.writeUserCache(updated.id, this.toSafeUser(updated));

      return {
        accessToken,
        refreshToken,
        role: updated.role,
        id: updated.id,
        username: updated.username,
        avatar: updated.avatar,
      };
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(`[UserService] updateAvatar failed: ${err?.message ?? err}`);
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async updateRole(
    userID: number,
    role: Role,
    oldRefreshToken?: string
  ): Promise<AuthResponse> {
    try {
      const user = await this.userRepository.findById(userID);
      if (!user) throw new NotFoundError({ message: "User is not found" });

      const updated = await this.userRepository.update(userID, {
        role: role as any,
      });

      const { accessToken, refreshToken } =
        await this.tokenService.generateTokens(
          updated.id,
          updated.username || updated.email,
          updated.role,
          updated.avatar ?? undefined,
          true
        );

      if (oldRefreshToken) await this.tokenService.logoutToken(oldRefreshToken);

      await this.invalidateUserCache(updated.id);
      await this.writeUserCache(updated.id, this.toSafeUser(updated));

      return {
        accessToken,
        refreshToken,
        role: updated.role,
        id: updated.id,
        username: updated.username,
        avatar: updated.avatar,
      };
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(`[UserService] updateRole failed: ${err?.message ?? err}`);
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async updateUser(
    userID: number,
    data: {
      username?: string;
      name?: string;
      phone?: string;
      address?: string;
      faculty?: string;
      school?: string;
    },
    oldRefreshToken?: string
  ): Promise<AuthResponse> {
    try {
      if (data.username) {
        const existing = await this.userRepository.findByUsername(
          data.username
        );
        if (existing && existing.id !== userID) {
          throw new ConflictError({ message: "Username is already taken" });
        }
      }

      const user = await this.userRepository.findById(userID);
      if (!user) throw new NotFoundError({ message: "User is not found" });

      const updated = await this.userRepository.update(userID, data);

      const { accessToken, refreshToken } =
        await this.tokenService.generateTokens(
          updated.id,
          updated.username || updated.email,
          updated.role,
          updated.avatar ?? undefined,
          true
        );

      if (oldRefreshToken) await this.tokenService.logoutToken(oldRefreshToken);

      await this.invalidateUserCache(updated.id);
      await this.writeUserCache(updated.id, this.toSafeUser(updated));

      return {
        accessToken,
        refreshToken,
        role: updated.role,
        id: updated.id,
        username: updated.username,
        avatar: updated.avatar,
      };
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(`[UserService] updateUser failed: ${err?.message ?? err}`);
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async deleteUser(id: number, oldRefreshToken?: string) {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) throw new NotFoundError({ message: "User is not found" });

      await this.userRepository.delete(id);
      if (oldRefreshToken) await this.tokenService.logoutToken(oldRefreshToken);

      await this.invalidateUserCache(id);
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(`[UserService] deleteUser failed: ${err?.message ?? err}`);
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async getUser(id: number): Promise<SafeUser> {
    try {
      const cached = await this.cacheService.get<SafeUser>(
        this.userCacheKey(id)
      );
      if (cached) return cached;

      const user = await this.userRepository.findById(id);
      if (!user) throw new NotFoundError({ message: "User is not found" });

      const safe = this.toSafeUser(user);
      await this.writeUserCache(id, safe);

      return safe;
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(`[UserService] getUser failed: ${err?.message ?? err}`);
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async getUsers(role?: Role): Promise<SafeUser[]> {
    try {
      const users = await this.userRepository.findAll(role as any);
      return users.map((u) => this.toSafeUser(u));
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(`[UserService] getUsers failed: ${err?.message ?? err}`);
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  private toSafeUser(user: any): SafeUser {
    const {
      password,
      googleId,
      microsoftId,
      msIssuer,
      msTenantId,
      provider,
      version,
      ...safe
    } = user;

    return safe;
  }
}

export { UserService };
