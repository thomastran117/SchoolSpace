import mongoose, { type Document, type Model, Schema } from "mongoose";

import type { IAssignment } from "./assignmentTemplate";
import type { ICourse } from "./courseTemplate";
import type { IUser } from "./userTemplate";

interface IGrade extends Document {
  course_id: ICourse["_id"];
  user_id: IUser["_id"];
  name: string;
  weight: number;
  obtained: number;
  total: number;
  isFinalGrade: boolean;

  assignment_id?: IAssignment["_id"] | null;
  test_id?: string | null;
  quiz_id?: string | null;

  createdAt: Date;
  updatedAt: Date;
}

const GradeSchema = new Schema<IGrade>(
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

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },

    weight: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    obtained: {
      type: Number,
      required: true,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 1,
    },

    isFinalGrade: {
      type: Boolean,
      default: false,
    },

    assignment_id: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      default: null,
    },

    test_id: {
      type: String,
      default: null,
      trim: true,
    },

    quiz_id: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

GradeSchema.pre("validate", function (next) {
  const targets = [this.assignment_id, this.test_id, this.quiz_id].filter(
    (v) => v !== null && v !== undefined
  );

  if (targets.length > 1) {
    return next(
      new Error("A grade may reference only one of assignment, test, or quiz.")
    );
  }

  next();
});

GradeSchema.index({ course_id: 1, user_id: 1 });
GradeSchema.index({ assignment_id: 1 }, { sparse: true });
GradeSchema.index({ test_id: 1 }, { sparse: true });
GradeSchema.index({ quiz_id: 1 }, { sparse: true });

const GradeModel: Model<IGrade> =
  mongoose.models.Grade || mongoose.model<IGrade>("Grade", GradeSchema);

export { GradeModel };
export type { IGrade };
