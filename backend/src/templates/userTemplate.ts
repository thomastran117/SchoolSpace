import mongoose, { type Document, type Model, Schema } from "mongoose";

enum Provider {
  LOCAL = "local",
  GOOGLE = "google",
  MICROSOFT = "microsoft",
}

enum Role {
  NOTDEFINED = "notdefined",
  STUDENT = "student",
  TEACHER = "teacher",
  ASSISTANT = "assistant",
  ADMIN = "admin",
}

interface IUser extends Document {
  email: string;
  password?: string | null;

  role: Role;
  provider: Provider;

  username?: string | null;
  name?: string | null;
  avatar?: string | null;
  phone?: string | null;
  address?: string | null;
  faculty?: string | null;
  school?: string | null;

  googleId?: string | null;
  microsoftId?: string | null;
  msTenantId?: string | null;
  msIssuer?: string | null;

  version: number;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
      unique: true,
    },

    password: {
      type: String,
      default: null,
      select: false,
    },

    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.NOTDEFINED,
      index: true,
    },

    provider: {
      type: String,
      enum: Object.values(Provider),
      default: Provider.LOCAL,
      index: true,
    },

    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
    },

    name: {
      type: String,
      trim: true,
      default: null,
    },

    avatar: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },

    phone: {
      type: String,
      trim: true,
      default: null,
    },

    address: {
      type: String,
      trim: true,
      default: null,
    },

    faculty: {
      type: String,
      trim: true,
      default: null,
    },

    school: {
      type: String,
      trim: true,
      default: null,
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    microsoftId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    msTenantId: {
      type: String,
      default: null,
    },

    msIssuer: {
      type: String,
      default: null,
    },

    version: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

UserSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.password;
  },
});

UserSchema.index(
  { microsoftId: 1, msIssuer: 1, msTenantId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      microsoftId: { $exists: true },
      msIssuer: { $exists: true },
      msTenantId: { $exists: true },
    },
  }
);

const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export { Provider, Role, UserModel };
export type { IUser };
