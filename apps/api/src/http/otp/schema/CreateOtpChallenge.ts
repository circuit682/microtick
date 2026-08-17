import { z } from "zod";

export const createOtpChallengeSchema = z.object({
  phoneNumber: z.string().min(1),
});
