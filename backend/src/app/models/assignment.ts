/**
 * @file assignment.ts
 * @description
 * Assignment related models
 *
 * @module models
 * @version 1.0.0
 * @auth Thomas
 */
type Assignment = {
  name: string;
  id: number;
  createdAt: Date;
  updatedAt: Date;
  description: string;
  courseId: number;
  fileUrl: string | null;
  dueDate: Date | null;
  deletedAt: Date | null;
};

export type { Assignment };
