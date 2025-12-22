import mongoose from "mongoose";
import {
  EnrollmentModel,
  type IEnrollment,
} from "../templates/enrollmentTemplate";
import { BaseRepository } from "./baseRepository";

class EnrollmentRepository extends BaseRepository {
  constructor() {
    super({ maxRetries: 3, baseDelay: 150 });
  }

  public async getById(id: string): Promise<IEnrollment | null> {
    return this.executeAsync(
      (signal) => EnrollmentModel.findById(id).setOptions({ signal }).exec(),
      { deadlineMs: 800 },
    );
  }

  public async getByUserAndCourse(
    userId: string,
    courseId: string,
  ): Promise<IEnrollment | null> {
    return this.executeAsync(
      (signal) =>
        EnrollmentModel.findOne({
          user_id: userId,
          course_id: courseId,
        })
          .setOptions({ signal })
          .exec(),
      { deadlineMs: 800 },
    );
  }

  public async getEnrollmentsByCourse(
    courseId: string,
  ): Promise<IEnrollment[]> {
    return this.executeAsync(
      (signal) =>
        EnrollmentModel.find({ course_id: courseId })
          .setOptions({ signal })
          .exec(),
      { deadlineMs: 800 },
    );
  }

  public async getEnrollmentsByUser(userId: string): Promise<IEnrollment[]> {
    return this.executeAsync(
      (signal) =>
        EnrollmentModel.find({ user_id: userId }).setOptions({ signal }).exec(),
      { deadlineMs: 800 },
    );
  }

  public async enroll(userId: string, courseId: string): Promise<IEnrollment> {
    return this.executeAsync(
      async () => {
        const enrollment = new EnrollmentModel({
          user_id: new mongoose.Types.ObjectId(userId),
          course_id: new mongoose.Types.ObjectId(courseId),
        });

        return enrollment.save();
      },
      { deadlineMs: 1000 },
    );
  }

  public async unenrollByUserAndCourse(
    userId: string,
    courseId: string,
  ): Promise<boolean> {
    return this.executeAsync(
      async () => {
        const res = await EnrollmentModel.deleteOne({
          user_id: userId,
          course_id: courseId,
        });

        return res.deletedCount === 1;
      },
      { deadlineMs: 800 },
    );
  }

  public async unenrollById(id: string): Promise<boolean> {
    return this.executeAsync(
      async () => {
        const res = await EnrollmentModel.deleteOne({ _id: id });
        return res.deletedCount === 1;
      },
      { deadlineMs: 800 },
    );
  }
}

export { EnrollmentRepository };
