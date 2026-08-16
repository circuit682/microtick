import { z } from "zod";

export const createSessionParamsSchema = z.object({
  customerId: z.string().min(1),
});

export const createSessionBodySchema = z.object({
  expiresAt: z.iso.datetime(),
});
