import { z } from "zod";

const CreateCourseSchema = z.object({
  year: z.number(),
  catalogue_id: z.string().length(24),
});

const UpdateCourseSchema = CreateCourseSchema.partial();

const QueryCourseSchema = z.object({
  search: z.string().min(1).max(100).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

type CreateCourseDto = z.infer<typeof CreateCourseSchema>;
type UpdateCourseDto = z.infer<typeof UpdateCourseSchema>;
type QueryCourseDto = z.infer<typeof QueryCourseSchema>;

export { CreateCourseSchema, QueryCourseSchema, UpdateCourseSchema };
export type { CreateCourseDto, QueryCourseDto, UpdateCourseDto };
