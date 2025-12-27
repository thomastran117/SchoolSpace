import mongoose, { Types } from "mongoose";

import { GradeModel, type IGrade } from "../templates/gradeTemplate";
import { BaseRepository } from "./baseRepository";

interface FindAllOptions {
  courseId?: string;
  userId?: string;
  assignmentId?: string;
  testId?: string;
  quizId?: string;
  page?: number;
  limit?: number;
  includeDeleted?: boolean;
}

class GradeRepository extends BaseRepository {
  constructor() {
    super({ maxRetries: 3, baseDelay: 150 });
  }

  public async create(data: {
    course_id: string;
    user_id: string;
    name: string;
    weight: number;
    obtained: number;
    total: number;
    isFinalGrade?: boolean;
    assignment_id?: string | null;
    test_id?: string | null;
    quiz_id?: string | null;
  }): Promise<IGrade> {
    return this.executeAsync(
      async () => {
        const grade = new GradeModel({
          ...data,
          course_id: new mongoose.Types.ObjectId(data.course_id),
          user_id: new mongoose.Types.ObjectId(data.user_id),
          assignment_id: data.assignment_id
            ? new mongoose.Types.ObjectId(data.assignment_id)
            : null,
          test_id: data.test_id ?? null,
          quiz_id: data.quiz_id ?? null,
        });

        return grade.save();
      },
      { deadlineMs: 1000 }
    );
  }

  public async findById(id: string): Promise<IGrade | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    return this.executeAsync(
      (signal) => GradeModel.findById(id).setOptions({ signal }).exec(),
      { deadlineMs: 800 }
    );
  }

  public async findAll(options: FindAllOptions = {}) {
    const {
      courseId,
      userId,
      assignmentId,
      testId,
      quizId,
      page = 1,
      limit = 20,
      includeDeleted = false,
    } = options;

    const filter: Record<string, any> = {};

    if (courseId) filter.course_id = courseId;
    if (userId) filter.user_id = userId;
    if (assignmentId) filter.assignment_id = assignmentId;
    if (testId) filter.test_id = testId;
    if (quizId) filter.quiz_id = quizId;

    if (!includeDeleted) filter.deletedAt = null;

    const skip = (page - 1) * limit;

    return this.executeAsync(
      async (signal) => {
        const [results, total] = await Promise.all([
          GradeModel.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .setOptions({ signal })
            .exec(),

          GradeModel.countDocuments(filter).setOptions({ signal }).exec(),
        ]);

        return { results, total };
      },
      { deadlineMs: 1200 }
    );
  }

  public async updateById(
    id: string,
    update: Partial<IGrade>
  ): Promise<IGrade | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    return this.executeAsync(
      (signal) =>
        GradeModel.findByIdAndUpdate(id, update, {
          new: true,
        })
          .setOptions({ signal })
          .exec(),
      { deadlineMs: 800 }
    );
  }

  public async delete(id: string): Promise<boolean> {
    return this.executeAsync(
      async () => {
        const res = await GradeModel.deleteOne({ _id: id });
        return res.deletedCount === 1;
      },
      { deadlineMs: 800 }
    );
  }

  public async findByAssignmentId(assignmentId: string) {
    return this.findAll({ assignmentId, limit: 100 });
  }

  public async findByTestId(testId: string) {
    return this.findAll({ testId, limit: 100 });
  }

  public async findByQuizId(quizId: string) {
    return this.findAll({ quizId, limit: 100 });
  }

  public async findForCourseAndUser(courseId: string, userId: string) {
    return this.findAll({ courseId, userId, limit: 100 });
  }
}

export { GradeRepository };
