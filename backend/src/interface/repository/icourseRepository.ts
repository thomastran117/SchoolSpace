import { Course } from "../../generated/prisma/client";

interface ICourseRepository {
  findById(id: number): Promise<Course | null>;
  findByIds(ids: number[]): Promise<Course[]>;
  findByTeacher(teacherId: number, year?: number): Promise<Course[]>;
  findAllWithFilters(
    filter: Record<string, unknown>,
    page: number,
    limit: number
  ): Promise<{ results: Course[]; total: number }>;
  create(data: {
    catalogueId: number;
    teacherId: number;
    year: number;
    imageUrl?: string | undefined;
  }): Promise<Course>;
  update(id: number, updates: Partial<Course>): Promise<Course | null>;
  delete(id: number): Promise<Course | null>;
  countImages(imageUrl: string): Promise<number>;
}

export type { ICourseRepository };
