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

CatalogueSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

const CatalogueModel: Model<ICatalogue> =
  mongoose.models.Catalogue ||
  mongoose.model<ICatalogue>("Catalogue", CatalogueSchema);

export { CatalogueModel, Term };
export type { ICatalogue };
