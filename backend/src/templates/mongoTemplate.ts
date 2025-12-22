import mongoose, { Schema, type Document, type Model } from "mongoose";

enum Term {
  SUMMER = "SUMMER",
  WINTER = "WINTER",
  FALL = "FALL",
}

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

interface ICatalogue extends Document {
  course_name: string;
  description: string;
  available: boolean;
  course_code: string;
  term: Term;
  createdAt: Date;
  updatedAt: Date;
}

interface ICourse extends Document {
  catalogue: ICatalogue["_id"];
  teacher_id: number;
  image_url?: string;
  year: number;
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
  { timestamps: true },
);

const CatalogueSchema = new Schema<ICatalogue>(
  {
    course_name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    available: {
      type: Boolean,
      default: true,
    },

    course_code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      unique: true,
    },

    term: {
      type: String,
      enum: Object.values(Term),
      required: true,
    },
  },
  { timestamps: true },
);

const CourseSchema = new Schema<ICourse>(
  {
    catalogue: {
      type: Schema.Types.ObjectId,
      ref: "Catalogue",
      required: true,
    },

    teacher_id: {
      type: Number,
      required: true,
      index: true,
    },

    image_url: {
      type: String,
      default: null,
      trim: true,
    },

    year: {
      type: Number,
      default: () => new Date().getFullYear(),
      required: true,
    },
  },
  { timestamps: true },
);

CatalogueSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

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
  },
);

const CourseModel: Model<ICourse> =
  mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);

const CatalogueModel: Model<ICatalogue> =
  mongoose.models.Catalogue ||
  mongoose.model<ICatalogue>("Catalogue", CatalogueSchema);

const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

CourseSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

export { CatalogueModel, CourseModel, Provider, Role, Term, UserModel };
export type { ICatalogue, ICourse, IUser };
