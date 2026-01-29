import { z } from "zod";

const CreateCourseSchema = z.object({
  year: z.number(),
  catalogue_id: z.number(),
  section: z.string().min(1).max(5),
});

const UpdateCourseSchema = CreateCourseSchema.partial();

const QueryCourseSchema = z.object({
  teacherId: z.string().optional(),
  year: z.string().optional(),
  search: z.string().min(1).max(100).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

type CreateCourseDto = z.infer<typeof CreateCourseSchema>;
type UpdateCourseDto = z.infer<typeof UpdateCourseSchema>;
type QueryCourseDto = z.infer<typeof QueryCourseSchema>;

export { CreateCourseSchema, QueryCourseSchema, UpdateCourseSchema };
export type { CreateCourseDto, QueryCourseDto, UpdateCourseDto };
