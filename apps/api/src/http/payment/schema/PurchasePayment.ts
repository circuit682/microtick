import { z } from "zod";

import type {
  PurchasePaymentRequest,
} from "../dto/PurchasePaymentRequest.types.js";

const purchasePaymentSchema = z.object({
  planId: z.string().min(1),
  phoneNumber: z.string().min(1),
});

export function parsePurchasePayment(
  input: unknown,
): PurchasePaymentRequest {
  return purchasePaymentSchema.parse(input);
}