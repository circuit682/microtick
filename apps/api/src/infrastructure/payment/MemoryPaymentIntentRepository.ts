import { PaymentIntentRepository } from "@application/payment/PaymentIntentRepository.js";
import { PaymentIntent } from "@domain";

export class MemoryPaymentIntentRepository
  implements PaymentIntentRepository
{
  private readonly paymentIntents = new Map<string, PaymentIntent>();

  async save(paymentIntent: PaymentIntent): Promise<void> {
    this.paymentIntents.set(paymentIntent.reference, paymentIntent);
  }

  async findByReference(
    reference: string,
  ): Promise<PaymentIntent | null> {
    return this.paymentIntents.get(reference) ?? null;
  }
}