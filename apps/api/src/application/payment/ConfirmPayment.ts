import { ErrorCode, ValidationError } from "@shared";

import type { PaymentIntentRepository } from "./PaymentIntentRepository.js";
import { FulfilPurchase } from "../purchase/FulfilPurchase.js";

export class ConfirmPayment {
  constructor(
    private readonly paymentIntentRepository: PaymentIntentRepository,
    private readonly fulfilPurchase: FulfilPurchase,
  ) {}

  async execute(reference: string): Promise<void> {
    const paymentIntent =
      await this.paymentIntentRepository.findByReference(reference);

    if (paymentIntent === null) {
      throw new ValidationError(
        ErrorCode.PAYMENT_NOT_FOUND,
        "The requested payment could not be found.",
        {
          reference,
        },
      );
    }

    paymentIntent.confirm();

    await this.paymentIntentRepository.save(paymentIntent);

    await this.fulfilPurchase.execute({
      paymentId: paymentIntent.id,
      customerId: paymentIntent.phoneNumber,
      planId: paymentIntent.planId,
      purchasedAt: new Date(),
    });
  }
}
