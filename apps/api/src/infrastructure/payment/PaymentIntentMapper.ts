import type { PaymentIntent as PrismaPaymentIntent } from "@generated/prisma/client.js";

import { Money, PaymentIntent, PaymentStatus } from "@domain";

export class PaymentIntentMapper {
  static toDomain(paymentIntent: PrismaPaymentIntent): PaymentIntent {
    return PaymentIntent.reconstitute({
      id: paymentIntent.id,
      customerId: paymentIntent.customerId,
      planId: paymentIntent.planId,
      amount: Money.fromMinorUnits(paymentIntent.amountMinor),
      phoneNumber: paymentIntent.phoneNumber,
      reference: paymentIntent.reference,
      status: paymentIntent.status as PaymentStatus,
    });
  }

  static toPersistence(paymentIntent: PaymentIntent) {
    return {
      id: paymentIntent.id,
      customerId: paymentIntent.customerId,
      planId: paymentIntent.planId,
      reference: paymentIntent.reference,
      phoneNumber: paymentIntent.phoneNumber,
      amountMinor: paymentIntent.amount.minorUnits,
      status: paymentIntent.status,
    };
  }
}
