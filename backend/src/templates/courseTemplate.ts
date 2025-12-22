import mongoose, { Schema, type Document, type Model } from "mongoose";
import { ICatalogue } from "./catalogueTemplate";
import { IUser } from "./userTemplate";

interface ICourse extends Document {
  catalogue_id: ICatalogue["_id"];
  teacher_id: IUser["id"];
  image_url?: string;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    catalogue_id: {
      type: Schema.Types.ObjectId,
      ref: "Catalogue",
      required: true,
    },

    teacher_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

const CourseModel: Model<ICourse> =
  mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);

CourseSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

export { CourseModel };
export type { ICourse };
