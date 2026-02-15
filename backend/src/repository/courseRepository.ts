import type { Prisma } from "@prisma/client";
import type { CourseFull, CourseListItem } from "../models/course";
import { courseFullInclude, courseListSelect } from "../models/course";
import { BaseRepository } from "./baseRepository";

class CourseRepository extends BaseRepository {
  constructor() {
    super({ maxRetries: 3, baseDelay: 150 });
  }

  private static readonly include = { catalogue: true } as const;

  private buildWhereFromFilter(
    filter: Record<string, unknown>
  ): Prisma.CourseWhereInput {
    const where: Prisma.CourseWhereInput = {};
    if (typeof filter.teacherId === "number")
      where.teacherId = filter.teacherId;
    if (typeof filter.catalogueId === "number")
      where.catalogueId = filter.catalogueId;
    if (typeof filter.year === "number") where.year = filter.year;
    return where;
  }

  public findById(id: number): Promise<CourseFull | null> {
    return this.executeAsync(
      () =>
        this.prisma.course.findUnique({
          where: { id },
          include: courseFullInclude,
        }),
      { deadlineMs: 800 }
    );
  }

  public findByIds(ids: number[]): Promise<CourseListItem[]> {
    if (!ids.length) return Promise.resolve([]);

    return this.executeAsync(
      () =>
        this.prisma.course.findMany({
          where: { id: { in: ids } },
          include: CourseRepository.include,
        }) as any,
      { deadlineMs: 1200 }
    );
  }

  public findByTeacher(
    teacherId: number,
    year?: number
  ): Promise<CourseListItem[]> {
    return this.executeAsync(
      () =>
        this.prisma.course.findMany({
          where: {
            teacherId,
            ...(year !== undefined ? { year } : {}),
          },
          select: courseListSelect,
          orderBy: { createdAt: "desc" },
        }),
      { deadlineMs: 800 }
    );
  }

  public findAllWithFilters(
    filter: Record<string, unknown>,
    page: number,
    limit: number
  ): Promise<{ results: CourseListItem[]; total: number }> {
    return this.executeAsync(
      async () => {
        const skip = (page - 1) * limit;
        const where = this.buildWhereFromFilter(filter);

        const [results, total] = await Promise.all([
          this.prisma.course.findMany({
            where,
            select: courseListSelect,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
          }),
          this.prisma.course.count({ where }),
        ]);

        return { results, total };
      },
      { deadlineMs: 1200 }
    );
  }

  public create(data: Prisma.CourseCreateInput): Promise<CourseFull> {
    return this.executeAsync(
      () =>
        this.prisma.course.create({
          data,
          include: courseFullInclude,
        }) as any,
      { deadlineMs: 1000 }
    );
  }

  public update(
    id: number,
    updates: Prisma.CourseUpdateInput
  ): Promise<CourseFull | null> {
    return this.executeAsync(
      async () => {
        try {
          return (await this.prisma.course.update({
            where: { id },
            data: updates,
            include: courseFullInclude,
          })) as any;
        } catch {
          return null;
        }
      },
      { deadlineMs: 800 }
    );
  }

  public delete(id: number): Promise<CourseFull | null> {
    return this.executeAsync(
      async () => {
        try {
          return (await this.prisma.course.delete({
            where: { id },
            include: courseFullInclude,
          })) as any;
        } catch {
          return null;
        }
      },
      { deadlineMs: 800 }
    );
  }

  public countImages(imageUrl: string): Promise<number> {
    return this.executeAsync(
      () => this.prisma.course.count({ where: { imageUrl } }),
      { deadlineMs: 600 }
    );
  }
}

export { CourseRepository };
