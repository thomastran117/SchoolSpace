/**
 * @file userSchema.ts
 * @description
 * Defines the DTOs for the Payment controller
 *
 * @module dto
 * @version 1.0.0
 * @auth Thomas
 */
import { z } from "zod";

const CreateOrderSchema = z.object({
  amount: z.string().max(100),
});

const ViewOrderSchema = z.object({
  orderId: z.string().max(100),
});

type CreateOrderDto = z.infer<typeof CreateOrderSchema>;
type ViewOrderDto = z.infer<typeof ViewOrderSchema>;

export { CreateOrderSchema, ViewOrderSchema };
export type { CreateOrderDto, ViewOrderDto };
