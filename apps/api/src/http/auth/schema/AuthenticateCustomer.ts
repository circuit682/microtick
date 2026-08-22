import { z } from "zod";

export const authenticateCustomerSchema = z.object({
  phoneNumber: z.string().min(1),
  verificationCode: z.string().min(1),
  sessionExpiresAt: z.iso.datetime(),
});
