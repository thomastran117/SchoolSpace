import type { AssignmentModel as Assignment } from "../generated/prisma/models/Assignment";
import prisma from "../resource/prisma";
import { BaseRepository } from "./baseRepository";

class AssignmentRepository extends BaseRepository {
  constructor() {
    super({ maxRetries: 3, baseDelay: 150 });
  }

  public async findById(id: number): Promise<Assignment | null> {
    return this.executeAsync(
      () => prisma.assignment.findUnique({ where: { id } }),
      { deadlineMs: 800 }
<<<<<<< HEAD
    );
  }

  public async findByIds(ids: number[]): Promise<Assignment[]> {
    if (!ids.length) return [];

    return this.executeAsync(
      () =>
        prisma.assignment.findMany({
          where: { id: { in: ids } },
        }),
      { deadlineMs: 1200 }
=======
>>>>>>> main
    );
  }

  public async findByCourse(courseId: number): Promise<Assignment[]> {
    return this.executeAsync(
      () =>
        prisma.assignment.findMany({
          where: { courseId },
          orderBy: { dueDate: "asc" },
        }),
      { deadlineMs: 800 }
    );
  }

  public async create(data: {
    courseId: number;
    name: string;
    description: string;
    fileUrl?: string;
    dueDate?: Date;
  }): Promise<Assignment> {
    return this.executeAsync(
      () =>
        prisma.assignment.create({
          data: {
            courseId: data.courseId,
            name: data.name,
            description: data.description,
            fileUrl: data.fileUrl,
            dueDate: data.dueDate,
          },
        }),
      { deadlineMs: 1000 }
    );
  }

  public async update(
    id: number,
    updates: Partial<
      Pick<Assignment, "name" | "description" | "fileUrl" | "dueDate">
    >
  ): Promise<Assignment | null> {
    return this.executeAsync(
      async () => {
        try {
          return await prisma.assignment.update({
            where: { id },
            data: updates,
          });
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
        const res = await prisma.assignment.deleteMany({ where: { id } });
        return res.count === 1;
      },
      { deadlineMs: 800 }
    );
  }

  public async findAllWithFilters(filters: {
    courseId?: number;
    dueBefore?: Date;
    dueAfter?: Date;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Assignment[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      courseId,
      dueBefore,
      dueAfter,
      search,
      page = 1,
      limit = 20,
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (courseId) where.courseId = courseId;

    if (dueBefore || dueAfter) {
      where.dueDate = {};
      if (dueBefore) where.dueDate.lte = dueBefore;
      if (dueAfter) where.dueDate.gte = dueAfter;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    return this.executeAsync(
      async () => {
        const [data, total] = await Promise.all([
          prisma.assignment.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
          }),
          prisma.assignment.count({ where }),
        ]);

        return { data, total, page, limit };
      },
      { deadlineMs: 1200 }
    );
  }
}

export { AssignmentRepository };
