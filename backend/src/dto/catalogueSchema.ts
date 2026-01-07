import { z } from "zod";

const CreateCatalogueSchema = z.object({
  course_name: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  course_code: z.string().min(4).max(20),
  term: z.string().min(4).max(20),
  available: z.boolean().optional(),
});

const UpdateCatalogueSchema = CreateCatalogueSchema.partial();

const QueryCatalogueSchema = z.object({
  term: z.string().min(4).max(20),
  available: z
    .union([z.boolean(), z.string().transform((v) => v === "true")])
    .optional(),
  search: z.string().min(1).max(100).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

type CreateCatalogueDto = z.infer<typeof CreateCatalogueSchema>;
type UpdateCatalogueDto = z.infer<typeof UpdateCatalogueSchema>;
type QueryCatalogueDto = z.infer<typeof QueryCatalogueSchema>;

export { CreateCatalogueSchema, QueryCatalogueSchema, UpdateCatalogueSchema };

export type { CreateCatalogueDto, QueryCatalogueDto, UpdateCatalogueDto };
