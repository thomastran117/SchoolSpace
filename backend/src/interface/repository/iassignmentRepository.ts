import type { Assignment } from "../../models/assignment";

interface IAssignmentRepository {
  findById(id: number): Promise<Assignment | null>;
  findByIds(ids: number[]): Promise<Assignment[]>;
  findByCourse(courseId: number): Promise<Assignment[]>;
  create(data: {
    courseId: number;
    name: string;
    description: string;
    fileUrl?: string;
    dueDate?: Date;
  }): Promise<Assignment>;
  update(
    id: number,
    updates: Partial<
      Pick<Assignment, "name" | "description" | "fileUrl" | "dueDate">
    >
  ): Promise<Assignment | null>;
  delete(id: number): Promise<boolean>;
  findAllWithFilters(filters: {
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
  }>;
}

export type { IAssignmentRepository };
