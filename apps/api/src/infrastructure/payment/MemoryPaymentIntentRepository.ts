import type {
  PaymentIntentRepository,
  PaymentProviderMetadata,
} from "@application/payment/PaymentIntentRepository.js";

import { PaymentIntent } from "@domain";

export class MemoryPaymentIntentRepository implements PaymentIntentRepository {
  private readonly paymentIntents = new Map<string, PaymentIntent>();

  private readonly providerMetadata = new Map<
    string,
    PaymentProviderMetadata
  >();

  async save(paymentIntent: PaymentIntent): Promise<void> {
    this.paymentIntents.set(paymentIntent.reference, paymentIntent);
  }

  async updateProviderMetadata(
    paymentIntentId: string,
    metadata: PaymentProviderMetadata,
  ): Promise<void> {
    this.providerMetadata.set(paymentIntentId, metadata);
  }

  async findByReference(reference: string): Promise<PaymentIntent | null> {
    return this.paymentIntents.get(reference) ?? null;
  }
}
