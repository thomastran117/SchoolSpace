import type { Grade } from "../../models/grade";

interface IGradeRepository {
  create(data: {
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
  }): Promise<Grade>;
  findById(id: number): Promise<Grade | null>;
  findAll(options: {
    courseId?: number;
    userId?: number;
    assignmentId?: number;
    testId?: string;
    quizId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ results: Grade[]; total: number }>;
  updateById(id: number, update: Partial<Grade>): Promise<Grade | null>;
  delete(id: number): Promise<boolean>;
  findByAssignmentId(assignmentId: number): Promise<{
    results: Grade[];
    total: number;
  }>;
  findByTestId(testId: string): Promise<{
    results: Grade[];
    total: number;
  }>;
  findByQuizId(quizId: string): Promise<{
    results: Grade[];
    total: number;
  }>;
  findForCourseAndUser(
    courseId: number,
    userId: number
  ): Promise<{
    results: Grade[];
    total: number;
  }>;
  findByTarget(target: {
    assignmentId?: number;
    testId?: string;
    quizId?: string;
    courseId: number;
    userId: number;
  }): Promise<Grade | null>;
  existsForTarget(target: {
    assignmentId?: number;
    testId?: string;
    quizId?: string;
    courseId: number;
    userId: number;
  }): Promise<boolean>;
  getUserGradesInCourse(
    courseId: number,
    userId: number
  ): Promise<{
    results: Grade[];
    total: number;
  }>;
  getFinalGrade(courseId: number, userId: number): Promise<Grade | null>;
  upsertForTarget(data: {
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
  }): Promise<Grade>;
  recalcFinalGrade(courseId: number, userId: number): Promise<number | null>;
}

export type { IGradeRepository };
