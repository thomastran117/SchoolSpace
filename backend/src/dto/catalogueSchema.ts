import { z } from "zod";
import { Term } from "../resource/schema_mongo";

const CreateCatalogueSchema = z.object({
  course_name: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  course_code: z.string().min(4).max(20),
  term: z.nativeEnum(Term),
  available: z.boolean().optional(),
});

const UpdateCatalogueSchema = CreateCatalogueSchema.partial();

const QueryCatalogueSchema = z.object({
  term: z.nativeEnum(Term).optional(),
  available: z
    .union([z.boolean(), z.string().transform((v) => v === "true")])
    .optional(),
  search: z.string().min(1).max(100).optional(),
});

const CatalogueResponseSchema = z.object({
  id: z.number(),
  course_name: z.string(),
  description: z.string(),
  available: z.boolean(),
  course_code: z.string(),
  term: z.nativeEnum(Term),
});

const CatalogueListResponseSchema = z.object({
  message: z.string(),
  count: z.number(),
  data: z.array(CatalogueResponseSchema),
});

type CreateCatalogueDto = z.infer<typeof CreateCatalogueSchema>;
type UpdateCatalogueDto = z.infer<typeof UpdateCatalogueSchema>;
type QueryCatalogueDto = z.infer<typeof QueryCatalogueSchema>;
type CatalogueResponseDto = z.infer<typeof CatalogueResponseSchema>;
type CatalogueListResponseDto = z.infer<typeof CatalogueListResponseSchema>;

export {
  CreateCatalogueSchema,
  UpdateCatalogueSchema,
  QueryCatalogueSchema,
  CatalogueListResponseSchema,
  CatalogueResponseSchema,
  CreateCatalogueDto,
  UpdateCatalogueDto,
  QueryCatalogueDto,
  CatalogueResponseDto,
  CatalogueListResponseDto,
};
