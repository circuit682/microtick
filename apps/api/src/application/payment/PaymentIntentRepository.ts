import { PaymentIntent } from "@domain";

export interface PaymentIntentRepository {
  save(paymentIntent: PaymentIntent): Promise<void>;

  findByReference(
    reference: string,
  ): Promise<PaymentIntent | null>;
}