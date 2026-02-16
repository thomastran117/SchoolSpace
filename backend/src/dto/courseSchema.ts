/**
 * @file courseSchema.ts
 * @description
 * Defines the DTOs for the Course controller
 *
 * @module dto
 * @version 1.0.0
 * @auth Thomas
 */
import { z } from "zod";

const CreateCourseSchema = z.object({
  year: z.number(),
  catalogue_id: z.number(),
  section: z.string().min(1).max(5),
});

const UpdateCourseSchema = CreateCourseSchema.partial();

const QueryCourseSchema = z.object({
  teacherId: z.number().optional(),
  year: z.string().optional(),
  search: z.string().min(1).max(100).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

const EnrollCourseSchema = z.object({
  userId: z.number(),
});

const CodeCourseSchema = z.object({
  code: z.string(),
});

type CreateCourseDto = z.infer<typeof CreateCourseSchema>;
type UpdateCourseDto = z.infer<typeof UpdateCourseSchema>;
type QueryCourseDto = z.infer<typeof QueryCourseSchema>;
type EnrollCourseDto = z.infer<typeof EnrollCourseSchema>;
type CodeCourseDto = z.infer<typeof CodeCourseSchema>;

export {
  CreateCourseSchema,
  QueryCourseSchema,
  UpdateCourseSchema,
  EnrollCourseSchema,
  CodeCourseSchema,
};
export type {
  CreateCourseDto,
  QueryCourseDto,
  UpdateCourseDto,
  EnrollCourseDto,
  CodeCourseDto,
};
