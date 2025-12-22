import { Types } from "mongoose";
import {
  UserModel,
  type IUser,
  type Provider,
  type Role,
} from "../templates/userTemplate";
import { BaseRepository } from "./baseRepository";

class UserRepository extends BaseRepository {
  constructor() {
    super({ maxRetries: 3, baseDelay: 150 });
  }

  private toObjectId(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return new Types.ObjectId(id);
  }

  public async findById(id: string): Promise<IUser | null> {
    const objectId = this.toObjectId(id);
    if (!objectId) return null;

    return this.executeAsync(async () => UserModel.findById(objectId).exec());
  }

  public async findByEmail(
    email: string,
    opts?: { includePassword?: boolean },
  ): Promise<IUser | null> {
    return this.executeAsync(async () =>
      UserModel.findOne({ email })
        .select(opts?.includePassword ? "+password" : "")
        .exec(),
    );
  }

  public async findByUsername(username: string): Promise<IUser | null> {
    return this.executeAsync(async () =>
      UserModel.findOne({ username }).exec(),
    );
  }

  public async findByGoogleId(googleId: string): Promise<IUser | null> {
    return this.executeAsync(async () =>
      UserModel.findOne({ googleId }).exec(),
    );
  }

  public async findByMicrosoftId(microsoftId: string): Promise<IUser | null> {
    return this.executeAsync(async () =>
      UserModel.findOne({ microsoftId }).exec(),
    );
  }

  public async findMicrosoftUser(
    msIssuer: string,
    msTenantId: string,
    microsoftId: string,
  ): Promise<IUser | null> {
    return this.executeAsync(async () =>
      UserModel.findOne({
        microsoftId,
        msIssuer,
        msTenantId,
      }).exec(),
    );
  }

  public async findAll(role?: Role): Promise<IUser[]> {
    return this.executeAsync(async () =>
      UserModel.find(role ? { role } : {})
        .sort({ createdAt: 1 })
        .exec(),
    );
  }

  public async countByAvatar(url: string): Promise<number> {
    return this.executeAsync(async () =>
      UserModel.countDocuments({ avatar: url }).exec(),
    );
  }

  public async filterUsers(opts: {
    role?: Role;
    provider?: Provider;
    email?: string;
    search?: string;
  }): Promise<IUser[]> {
    const query: any = {};
    const { role, provider, email, search } = opts;

    if (role) query.role = role;
    if (provider) query.provider = provider;
    if (email) query.email = email;

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ email: regex }, { username: regex }, { name: regex }];
    }

    return this.executeAsync(async () =>
      UserModel.find(query).sort({ createdAt: 1 }).exec(),
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
  }): Promise<IUser> {
    return this.executeAsync(async () => {
      try {
        const user = new UserModel(data);
        return await user.save();
      } catch (err: any) {
        if (err?.code === 11000) {
          const field = Object.keys(err.keyPattern ?? {})[0];
          throw new Error(`Duplicate value for field: ${field}`);
        }
        throw err;
      }
    });
  }

  public async update(
    id: string,
    data: Partial<Omit<IUser, "_id" | "version">>,
    version: number,
  ): Promise<IUser> {
    const objectId = this.toObjectId(id);
    if (!objectId) {
      throw new Error("[UserRepository.update] Invalid user id");
    }

    if ("version" in data) {
      throw new Error("Version cannot be updated directly");
    }

    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined),
    );

    if (Object.keys(cleanData).length === 0) {
      throw new Error("[UserRepository.update] No fields provided for update");
    }

    return this.executeAsync(async () => {
      const updated = await UserModel.findOneAndUpdate(
        { _id: objectId, version },
        {
          $set: cleanData,
          $inc: { version: 1 },
        },
        { new: true },
      ).exec();

      if (!updated) {
        throw new Error(
          "[UserRepository.update] Concurrent modification detected",
        );
      }

      return updated;
    });
  }

  public async delete(id: string): Promise<boolean> {
    const objectId = this.toObjectId(id);
    if (!objectId) return false;

    await this.executeAsync(async () =>
      UserModel.deleteOne({ _id: objectId }).exec(),
    );

    return true;
  }
}

export { UserRepository };
