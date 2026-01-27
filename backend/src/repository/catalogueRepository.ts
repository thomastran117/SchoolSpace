import type { Catalogue, Term } from "../models/catalogue";
import { BaseRepository } from "./baseRepository";

class CatalogueRepository extends BaseRepository {
  constructor() {
    super({ maxRetries: 3, baseDelay: 150 });
  }

  public async findById(id: number): Promise<Catalogue | null> {
    return this.executeAsync(() =>
      this.prisma.catalogue.findUnique({
        where: { id },
      })
    );
  }

  public async findByIds(ids: number[]): Promise<Catalogue[]> {
    if (!ids.length) return [];

    return this.executeAsync(
      () =>
        this.prisma.catalogue.findMany({
          where: { id: { in: ids } },
        }),
      { deadlineMs: 1200 }
    );
  }

  public async findByCourseCode(courseCode: string): Promise<Catalogue | null> {
    return this.executeAsync(() =>
      this.prisma.catalogue.findUnique({
        where: { courseCode },
      })
    );
  }

  public async findAllWithFilters(
    filter: Record<string, unknown>,
    page: number,
    limit: number
  ): Promise<{ results: Catalogue[]; total: number }> {
    return this.executeAsync(async () => {
      const skip = (page - 1) * limit;

      const where: any = {};

      if (filter.term) where.term = filter.term;
      if (filter.available !== undefined) where.available = filter.available;
      if (filter.courseCode) where.courseCode = filter.courseCode;
      if (filter.courseName)
        where.courseName = { contains: filter.courseName, mode: "insensitive" };

      const [results, total] = await Promise.all([
        this.prisma.catalogue.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        this.prisma.catalogue.count({ where }),
      ]);

      return { results, total };
    });
  }

  public async create(data: {
    courseName: string;
    description: string;
    courseCode: string;
    term: Term;
    available?: boolean;
  }): Promise<Catalogue> {
    return this.executeAsync(() =>
      this.prisma.catalogue.create({
        data: {
          courseName: data.courseName,
          description: data.description,
          courseCode: data.courseCode,
          term: data.term,
          available: data.available ?? true,
        },
      })
    );
  }

  public async update(
    id: number,
    updates: Partial<Catalogue>
  ): Promise<Catalogue | null> {
    return this.executeAsync(async () => {
      try {
        return await this.prisma.catalogue.update({
          where: { id },
          data: updates,
        });
      } catch {
        return null;
      }
    });
  }

  public async delete(id: number): Promise<Catalogue | null> {
    return this.executeAsync(async () => {
      try {
        return await this.prisma.catalogue.delete({
          where: { id },
        });
      } catch {
        return null;
      }
    });
  }
}

export { CatalogueRepository };
