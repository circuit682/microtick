import { z } from "zod";

export const getCustomerParamsSchema = z.object({
  customerId: z.string().min(1),
});