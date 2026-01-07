import type { CourseModel as Course } from "../generated/prisma/models/Course";
import type { CourseCreateInput } from "../models/course";
import prisma from "../resource/prisma";
import { BaseRepository } from "./baseRepository";

class CourseRepository extends BaseRepository {
  constructor() {
    super({ maxRetries: 3, baseDelay: 150 });
  }

  public async findById(id: number): Promise<Course | null> {
    return this.executeAsync(
      () =>
        prisma.course.findUnique({
          where: { id },
          include: { catalogue: true },
        }),
      { deadlineMs: 800 }
    );
  }

  public async findByIds(ids: number[]): Promise<Course[]> {
    if (!ids.length) return [];

    return this.executeAsync(
      () =>
        prisma.course.findMany({
          where: { id: { in: ids } },
        }),
      { deadlineMs: 1200 },
    );
  }

  public async findByTeacher(
    teacherId: number,
    year?: number
  ): Promise<Course[]> {
    return this.executeAsync(
      () =>
        prisma.course.findMany({
          where: {
            teacherId,
            ...(year !== undefined ? { year } : {}),
          },
          include: { catalogue: true },
          orderBy: { createdAt: "desc" },
        }),
      { deadlineMs: 800 }
    );
  }

  public async findAllWithFilters(
    filter: Record<string, unknown>,
    page: number,
    limit: number
  ): Promise<{ results: Course[]; total: number }> {
    return this.executeAsync(
      async () => {
        const skip = (page - 1) * limit;

        const where: any = {};
        if (filter.teacherId) where.teacherId = filter.teacherId;
        if (filter.catalogueId) where.catalogueId = filter.catalogueId;
        if (filter.year !== undefined) where.year = filter.year;

        const [results, total] = await Promise.all([
          prisma.course.findMany({
            where,
            include: { catalogue: true },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
          }),
          prisma.course.count({ where }),
        ]);

        return { results, total };
      },
      { deadlineMs: 1200 }
    );
  }

  public async create(data: CourseCreateInput): Promise<Course> {
    return this.executeAsync(
      () =>
        prisma.course.create({
          data,
          include: { catalogue: true },
        }),
      { deadlineMs: 1000 }
    );
  }

  public async update(
    id: number,
    updates: Partial<Course>
  ): Promise<Course | null> {
    return this.executeAsync(
      async () => {
        try {
          return await prisma.course.update({
            where: { id },
            data: updates,
            include: { catalogue: true },
          });
        } catch {
          return null;
        }
      },
      { deadlineMs: 800 }
    );
  }

  public async delete(id: number): Promise<Course | null> {
    return this.executeAsync(
      async () => {
        try {
          return await prisma.course.delete({
            where: { id },
          });
        } catch {
          return null;
        }
      },
      { deadlineMs: 800 }
    );
  }

  public async countImages(imageUrl: string): Promise<number> {
    return this.executeAsync(
      () => prisma.course.count({ where: { imageUrl } }),
      { deadlineMs: 600 }
    );
  }
}

export { CourseRepository };
