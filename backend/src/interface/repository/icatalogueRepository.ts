import { Catalogue } from "../../generated/prisma/client";

type Term = "WINTER" | "FALL" | "SUMMER";

interface ICatalogueRepository {
  findById(id: number): Promise<Catalogue | null>;
  findByIds(ids: number[]): Promise<Catalogue[]>;
  findByCourseCode(courseCode: string): Promise<Catalogue | null>;
  findAllWithFilters(
    filter: Record<string, unknown>,
    page: number,
    limit: number
  ): Promise<{ results: Catalogue[]; total: number }>;
  create(data: {
    courseName: string;
    description: string;
    courseCode: string;
    term: Term;
    available?: boolean;
  }): Promise<Catalogue>;
  update(id: number, updates: Partial<Catalogue>): Promise<Catalogue | null>;
  delete(id: number): Promise<Catalogue | null>;
}

export type { ICatalogueRepository };
