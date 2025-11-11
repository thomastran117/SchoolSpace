import mongoose, {
  Schema,
  type Document,
  type Model,
  type HydratedDocument,
} from "mongoose";

export enum Term {
  SUMMER = "SUMMER",
  WINTER = "WINTER",
  FALL = "FALL",
}

export interface ICatalogue extends Document {
  id: number;
  course_name: string;
  description: string;
  available: boolean;
  course_code: string;
  term: Term;
  createdAt: Date;
  updatedAt: Date;
}

const CatalogueSchema = new Schema<ICatalogue>(
  {
    id: {
      type: Number,
      unique: true,
      index: true,
    },

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

CatalogueSchema.pre("validate", async function (next) {
  const doc = this as HydratedDocument<ICatalogue>;

  if (!doc.isNew || (doc.id !== undefined && doc.id !== null)) {
    return next();
  }

  try {
    const Model = doc.constructor as Model<ICatalogue>;
    const last = await Model.findOne({}, { id: 1 }).sort({ id: -1 }).lean();

    doc.id = last ? last.id + 1 : 1;
    next();
  } catch (err) {
    next(err as any);
  }
});

CatalogueSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
  },
});

export const CatalogueModel: Model<ICatalogue> =
  mongoose.models.Catalogue ||
  mongoose.model<ICatalogue>("Catalogue", CatalogueSchema);
