/**
 * @file enrollment.ts
 * @description
 * Enrollment related models
 *
 * @module models
 * @version 1.0.0
 * @auth Thomas
 */
type Enrollment = {
  id: number;
  courseId: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
};

export type { Enrollment };
