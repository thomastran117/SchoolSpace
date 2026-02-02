/**
 * @file contactSchema.ts
 * @description
 * Defines the DTOs for the Contact controller
 *
 * @module dto
 * @version 1.0.0
 * @auth Thomas
 */
import { z } from "zod";

const CreateContactSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(100),
  topic: z.string().min(4).max(100),
  message: z.string().min(10).max(1000),
  captcha: z.string().trim().min(1).max(4000),
});

const UpdateContactSchema = CreateContactSchema.partial();

type CreateContactDto = z.infer<typeof CreateContactSchema>;
type UpdateContactDto = z.infer<typeof UpdateContactSchema>;

export type { CreateContactDto, UpdateContactDto };
export { CreateContactSchema, UpdateContactSchema };
