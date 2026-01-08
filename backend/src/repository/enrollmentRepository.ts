import type { IEnrollmentRepository } from "../interface/repository";
import type { Enrollment } from "../models/enrollment";
import { BaseRepository } from "./baseRepository";

class EnrollmentRepository
  extends BaseRepository
  implements IEnrollmentRepository
{
  constructor() {
    super({ maxRetries: 3, baseDelay: 150 });
  }

  public async findById(id: number): Promise<Enrollment | null> {
    return this.executeAsync(
      () =>
        this.prisma.enrollment.findUnique({
          where: { id },
        }),
      { deadlineMs: 800 }
    );
  }

  public async findByUserAndCourse(
    userId: number,
    courseId: number
  ): Promise<Enrollment | null> {
    return this.executeAsync(
      () =>
        this.prisma.enrollment.findUnique({
          where: {
            courseId_userId: {
              courseId,
              userId,
            },
          },
        }),
      { deadlineMs: 800 }
    );
  }

  public async findEnrollmentsByCourse(
    courseId: number
  ): Promise<Enrollment[]> {
    return this.executeAsync(
      () =>
        this.prisma.enrollment.findMany({
          where: { courseId },
        }),
      { deadlineMs: 800 }
    );
  }

  public async findEnrollmentsByUser(userId: number): Promise<Enrollment[]> {
    return this.executeAsync(
      () =>
        this.prisma.enrollment.findMany({
          where: { userId },
        }),
      { deadlineMs: 800 }
    );
  }

  public async findByIds(ids: number[]): Promise<Enrollment[]> {
    if (!ids.length) return [];

    return this.executeAsync(
      () =>
        this.prisma.enrollment.findMany({
          where: { id: { in: ids } },
        }),
      { deadlineMs: 1200 }
    );
  }

  public async findByUserIds(userIds: number[]): Promise<Enrollment[]> {
    if (!userIds.length) return [];

    return this.executeAsync(
      () =>
        this.prisma.enrollment.findMany({
          where: { userId: { in: userIds } },
        }),
      { deadlineMs: 1200 }
    );
  }

  public async findByCourseIds(courseIds: number[]): Promise<Enrollment[]> {
    if (!courseIds.length) return [];

    return this.executeAsync(
      () =>
        this.prisma.enrollment.findMany({
          where: { courseId: { in: courseIds } },
        }),
      { deadlineMs: 1200 }
    );
  }

  public async getEnrollmentMapForUser(
    userId: number,
    courseIds: number[]
  ): Promise<Record<number, true>> {
    if (!courseIds.length) return {};

    return this.executeAsync(
      async () => {
        const rows = await this.prisma.enrollment.findMany({
          where: {
            userId,
            courseId: { in: courseIds },
          },
          select: { courseId: true },
        });

        return rows.reduce<Record<number, true>>((acc, r) => {
          acc[r.courseId] = true;
          return acc;
        }, {});
      },
      { deadlineMs: 800 }
    );
  }

  public async countByCourse(courseId: number): Promise<number> {
    return this.executeAsync(
      () =>
        this.prisma.enrollment.count({
          where: { courseId },
        }),
      { deadlineMs: 800 }
    );
  }

  public async countByCourses(
    courseIds: number[]
  ): Promise<Record<number, number>> {
    if (!courseIds.length) return {};

    return this.executeAsync(
      async () => {
        const rows = await this.prisma.enrollment.groupBy({
          by: ["courseId"],
          where: { courseId: { in: courseIds } },
          _count: { _all: true },
        });

        return rows.reduce<Record<number, number>>((acc, r) => {
          acc[r.courseId] = r._count._all;
          return acc;
        }, {});
      },
      { deadlineMs: 1200 }
    );
  }

  public async getPagedByCourse(
    courseId: number,
    page = 1,
    limit = 20
  ): Promise<{ results: Enrollment[]; total: number }> {
    const skip = (page - 1) * limit;

    return this.executeAsync(
      async () => {
        const [results, total] = await this.prisma.$transaction([
          this.prisma.enrollment.findMany({
            where: { courseId },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
          }),
          this.prisma.enrollment.count({ where: { courseId } }),
        ]);

        return { results, total };
      },
      { deadlineMs: 1500 }
    );
  }

  public async getPagedByUser(
    userId: number,
    page = 1,
    limit = 20
  ): Promise<{ results: Enrollment[]; total: number }> {
    const skip = (page - 1) * limit;

    return this.executeAsync(
      async () => {
        const [results, total] = await this.prisma.$transaction([
          this.prisma.enrollment.findMany({
            where: { userId },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
          }),
          this.prisma.enrollment.count({ where: { userId } }),
        ]);

        return { results, total };
      },
      { deadlineMs: 1500 }
    );
  }

  public async enroll(userId: number, courseId: number): Promise<Enrollment> {
    return this.executeAsync(
      () =>
        this.prisma.enrollment.create({
          data: { userId, courseId },
        }),
      { deadlineMs: 1000 }
    );
  }

  public async unenrollByUserAndCourse(
    userId: number,
    courseId: number
  ): Promise<boolean> {
    return this.executeAsync(
      async () => {
        const res = await this.prisma.enrollment.deleteMany({
          where: { userId, courseId },
        });

        return res.count === 1;
      },
      { deadlineMs: 800 }
    );
  }

  public async unenrollById(id: number): Promise<boolean> {
    return this.executeAsync(
      async () => {
        const res = await this.prisma.enrollment.deleteMany({
          where: { id },
        });

        return res.count === 1;
      },
      { deadlineMs: 800 }
    );
  }
}

export { EnrollmentRepository };
