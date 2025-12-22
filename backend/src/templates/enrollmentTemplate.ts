import mongoose, { Schema, type Document, type Model } from "mongoose";
import { ICourse } from "./courseTemplate";
import { IUser } from "./userTemplate";

interface IEnrollment extends Document {
  course_id: ICourse["_id"];
  user_id: IUser["_id"];
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    course_id: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

EnrollmentSchema.index({ course_id: 1, user_id: 1 });

const EnrollmentModel: Model<IEnrollment> =
  mongoose.models.Enrollment ||
  mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema);

export { EnrollmentModel };
export type { IEnrollment };
