import { PaymentIntent } from "@domain";

export interface PaymentProviderMetadata {
  providerReference: string;
  checkoutUrl: string;
}

export interface PaymentIntentRepository {
  save(paymentIntent: PaymentIntent): Promise<void>;

  updateProviderMetadata(
    paymentIntentId: string,
    metadata: PaymentProviderMetadata,
  ): Promise<void>;

  findByReference(reference: string): Promise<PaymentIntent | null>;
}
