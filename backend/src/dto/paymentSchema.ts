import { z } from "zod";

const CreateOrderSchema = z.object({
  amount: z.string().max(100),
});

const ViewOrderSchema = z.object({
  orderId: z.string().max(100),
});

type CreateOrderDto = z.infer<typeof CreateOrderSchema>;
type ViewOrderDto = z.infer<typeof ViewOrderSchema>;

export { CreateOrderDto, CreateOrderSchema, ViewOrderDto, ViewOrderSchema };
