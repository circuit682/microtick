import type { PaymentIntentRepository } from "@application/payment/PaymentIntentRepository.js";
import { PaymentIntent } from "@domain";

import { prisma } from "@infrastructure/database/prisma.js";

import { PaymentIntentMapper } from "./PaymentIntentMapper.js";

export class PrismaPaymentIntentRepository implements PaymentIntentRepository {
  async save(paymentIntent: PaymentIntent): Promise<void> {
    const data = PaymentIntentMapper.toPersistence(paymentIntent);

    await prisma.paymentIntent.upsert({
      where: {
        id: data.id,
      },
      create: data,
      update: data,
    });
  }

  async findByReference(reference: string): Promise<PaymentIntent | null> {
    const paymentIntent = await prisma.paymentIntent.findUnique({
      where: {
        reference,
      },
    });

    if (paymentIntent === null) {
      return null;
    }

    return PaymentIntentMapper.toDomain(paymentIntent);
  }
}
