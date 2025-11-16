import { z } from "zod";

const IdParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "id must be an integer string")
    .transform(Number)
    .refine((n) => n > 0, "id must be positive"),
});

const MongoIdParamSchema = z.object({
  id: z
    .string()
    .length(24, "Invalid ObjectId length (must be 24 characters)")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format"),
});

export { IdParamSchema, MongoIdParamSchema };
