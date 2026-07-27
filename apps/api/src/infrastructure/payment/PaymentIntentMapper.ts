import type { PaymentIntent as PrismaPaymentIntent } from "@generated/prisma/client.js";

import { Money, PaymentIntent, PaymentStatus } from "@domain";

export class PaymentIntentMapper {
  static toDomain(paymentIntent: PrismaPaymentIntent): PaymentIntent {
    return PaymentIntent.reconstitute({
      id: paymentIntent.id,
      planId: paymentIntent.planId,
      amount: Money.fromMinorUnits(paymentIntent.amountMinor),
      phoneNumber: paymentIntent.phoneNumber,
      reference: paymentIntent.reference,
      status: paymentIntent.status as PaymentStatus,
    });
  }

  static toPersistence(paymentIntent: PaymentIntent): {
    id: string;
    planId: string;
    reference: string;
    phoneNumber: string;
    amountMinor: number;
    status: string;
    providerReference: string | null;
    checkoutUrl: string | null;
  } {
    return {
      id: paymentIntent.id,
      planId: paymentIntent.planId,
      reference: paymentIntent.reference,
      phoneNumber: paymentIntent.phoneNumber,
      amountMinor: paymentIntent.amount.minorUnits,
      status: paymentIntent.status,
      providerReference: null,
      checkoutUrl: null,
    };
  }
}
