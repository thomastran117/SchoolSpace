import mongoose, { Schema, type Document, type Model } from "mongoose";

enum Term {
  SUMMER = "SUMMER",
  WINTER = "WINTER",
  FALL = "FALL",
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

const CourseModel: Model<ICourse> =
  mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);

const CatalogueModel: Model<ICatalogue> =
  mongoose.models.Catalogue ||
  mongoose.model<ICatalogue>("Catalogue", CatalogueSchema);

CourseSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

export { Term, CatalogueModel, CourseModel };
export type { ICatalogue, ICourse };
