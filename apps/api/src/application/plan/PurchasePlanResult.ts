import { PaymentIntent } from "@domain";

export interface PurchasePlanResult {
  paymentIntent: PaymentIntent;
  providerRequestId: string;
  checkoutUrl: string;
}