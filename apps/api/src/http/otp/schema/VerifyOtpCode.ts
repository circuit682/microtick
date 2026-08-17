import { z } from "zod";

export const verifyOtpCodeSchema = z.object({
  challengeId: z.string().min(1),
  phoneNumber: z.string().min(1),
  code: z.string().min(1),
});
