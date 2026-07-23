import { z } from "zod";

export const IntaSendWebhookSchema = z.object({
  reference: z
    .string()
    .trim()
    .min(1, "Reference is required"),
});

export type IntaSendWebhookBody =
  z.infer<typeof IntaSendWebhookSchema>;

export function parseIntaSendWebhook(
  input: unknown,
): IntaSendWebhookBody {
  return IntaSendWebhookSchema.parse(input);
}