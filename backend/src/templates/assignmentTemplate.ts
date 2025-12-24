import mongoose, { type Document, type Model, Schema } from "mongoose";

import { ICourse } from "./courseTemplate";

interface IAssignment extends Document {
  course_id: ICourse["_id"];
  name: string;
  description: string;
  file_url?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    course_id: {
      type: Schema.Types.ObjectId,
      ref: "Course",
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

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    file_url: {
      type: String,
      required: false,
      trim: true,
    },

    dueDate: {
      type: Date,
      validate: {
        validator: (v: Date) => !v || v > new Date(),
        message: "Due date must be in the future",
      },
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

AssignmentSchema.index({ course_id: 1, dueDate: 1 });

const AssignmentModel: Model<IAssignment> =
  mongoose.models.Assignment ||
  mongoose.model<IAssignment>("Assignment", AssignmentSchema);

export { AssignmentModel };
export type { IAssignment };
