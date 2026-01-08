import type { GradeModel as Grade } from "../generated/prisma/models/Grade";
import prisma from "../resource/prisma";
import { BaseRepository } from "./baseRepository";

class GradeRepository extends BaseRepository {
  constructor() {
    super({ maxRetries: 3, baseDelay: 150 });
  }

  public async create(data: {
    courseId: number;
    userId: number;
    name: string;
    weight: number;
    obtained: number;
    total: number;
    isFinalGrade?: boolean;
    assignmentId?: number | null;
    testId?: string | null;
    quizId?: string | null;
  }): Promise<Grade> {
    return this.executeAsync(
      () =>
        prisma.grade.create({
          data: {
            ...data,
            assignmentId: data.assignmentId ?? null,
            testId: data.testId ?? null,
            quizId: data.quizId ?? null,
            isFinalGrade: data.isFinalGrade ?? false,
          },
        }),
      { deadlineMs: 1000 }
    );
  }

  public async findById(id: number): Promise<Grade | null> {
    return this.executeAsync(() => prisma.grade.findUnique({ where: { id } }), {
      deadlineMs: 800,
    });
  }

  public async findAll(
    options: {
      courseId?: number;
      userId?: number;
      assignmentId?: number;
      testId?: string;
      quizId?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ results: Grade[]; total: number }> {
    const {
      courseId,
      userId,
      assignmentId,
      testId,
      quizId,
      page = 1,
      limit = 20,
    } = options;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (courseId) where.courseId = courseId;
    if (userId) where.userId = userId;
    if (assignmentId) where.assignmentId = assignmentId;
    if (testId) where.testId = testId;
    if (quizId) where.quizId = quizId;

    return this.executeAsync(
      async () => {
        const [results, total] = await Promise.all([
          prisma.grade.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
          }),
          prisma.grade.count({ where }),
        ]);

        return { results, total };
      },
      { deadlineMs: 1200 }
    );
  }

  public async updateById(
    id: number,
    update: Partial<Grade>
  ): Promise<Grade | null> {
    return this.executeAsync(
      async () => {
        try {
          return await prisma.grade.update({ where: { id }, data: update });
        } catch {
          return null;
        }
      },
      { deadlineMs: 800 }
    );
  }

  public async delete(id: number): Promise<boolean> {
    return this.executeAsync(
      async () => {
        const res = await prisma.grade.deleteMany({ where: { id } });
        return res.count === 1;
      },
      { deadlineMs: 800 }
    );
  }

  public async findByAssignmentId(assignmentId: number): Promise<{
    results: Grade[];
    total: number;
  }> {
    return this.findAll({ assignmentId, limit: 100 });
  }

  public async findByTestId(testId: string): Promise<{
    results: Grade[];
    total: number;
  }> {
    return this.findAll({ testId, limit: 100 });
  }

  public async findByQuizId(quizId: string): Promise<{
    results: Grade[];
    total: number;
  }> {
    return this.findAll({ quizId, limit: 100 });
  }

  public async findForCourseAndUser(
    courseId: number,
    userId: number
  ): Promise<{
    results: Grade[];
    total: number;
  }> {
    return this.findAll({ courseId, userId, limit: 100 });
  }

  public async findByTarget(target: {
    assignmentId?: number;
    testId?: string;
    quizId?: string;
    courseId: number;
    userId: number;
  }): Promise<Grade | null> {
    const where: any = {
      courseId: target.courseId,
      userId: target.userId,
    };
    if (target.assignmentId) where.assignmentId = target.assignmentId;
    if (target.testId) where.testId = target.testId;
    if (target.quizId) where.quizId = target.quizId;

    return this.executeAsync(() => prisma.grade.findFirst({ where }), {
      deadlineMs: 800,
    });
  }

  public async existsForTarget(target: {
    assignmentId?: number;
    testId?: string;
    quizId?: string;
    courseId: number;
    userId: number;
  }): Promise<boolean> {
    const found = await this.findByTarget(target);
    return !!found;
  }

  public async getUserGradesInCourse(
    courseId: number,
    userId: number
  ): Promise<{
    results: Grade[];
    total: number;
  }> {
    return this.findAll({ courseId, userId, limit: 200 });
  }

  public async getFinalGrade(
    courseId: number,
    userId: number
  ): Promise<Grade | null> {
    return this.executeAsync(
      () =>
        prisma.grade.findFirst({
          where: { courseId, userId, isFinalGrade: true },
        }),
      { deadlineMs: 800 }
    );
  }

  public async upsertForTarget(data: {
    courseId: number;
    userId: number;
    assignmentId?: number;
    testId?: string;
    quizId?: string;
    name: string;
    weight: number;
    obtained: number;
    total: number;
    isFinalGrade?: boolean;
  }): Promise<Grade> {
    const base = {
      courseId: data.courseId,
      userId: data.userId,
    };

    if (data.assignmentId !== undefined) {
      return prisma.grade.upsert({
        where: {
          courseId_userId_assignmentId: {
            ...base,
            assignmentId: data.assignmentId,
          },
        },
        create: { ...data },
        update: data,
      });
    }

    if (data.testId !== undefined) {
      return prisma.grade.upsert({
        where: { courseId_userId_testId: { ...base, testId: data.testId } },
        create: { ...data },
        update: data,
      });
    }

    if (data.quizId !== undefined) {
      return prisma.grade.upsert({
        where: { courseId_userId_quizId: { ...base, quizId: data.quizId } },
        create: { ...data },
        update: data,
      });
    }

    throw new Error("Target identifier missing");
  }

  public async recalcFinalGrade(
    courseId: number,
    userId: number
  ): Promise<number | null> {
    return this.executeAsync(async () => {
      const grades = await prisma.grade.findMany({
        where: { courseId, userId, isFinalGrade: false },
      });

      const totalWeight = grades.reduce((s, g) => s + g.weight, 0);
      if (totalWeight === 0) return null;

      const weighted =
        grades.reduce((s, g) => s + (g.obtained / g.total) * g.weight, 0) /
        totalWeight;

      return weighted * 100;
    });
  }
}

export { GradeRepository };
