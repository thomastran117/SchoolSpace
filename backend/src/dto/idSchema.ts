import { z } from "zod";

const IdParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "id must be an integer string")
    .transform(Number)
    .refine((n) => n > 0, "id must be positive"),
});

export { IdParamSchema };
