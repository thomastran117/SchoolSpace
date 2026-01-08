import type { Enrollment } from "../../models/enrollment";

interface IEnrollmentRepository {
  findById(id: number): Promise<Enrollment | null>;
  findByIds(ids: number[]): Promise<Enrollment[]>;
  findByUserIds(userIds: number[]): Promise<Enrollment[]>;
  findByCourseIds(courseIds: number[]): Promise<Enrollment[]>;
  findByUserAndCourse(
    userId: number,
    courseId: number
  ): Promise<Enrollment | null>;
  findEnrollmentsByCourse(courseId: number): Promise<Enrollment[]>;
  findEnrollmentsByUser(userId: number): Promise<Enrollment[]>;
  getEnrollmentMapForUser(
    userId: number,
    courseIds: number[]
  ): Promise<Record<number, true>>;
}

export type { IEnrollmentRepository };
