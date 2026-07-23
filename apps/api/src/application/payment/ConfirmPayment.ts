import { ErrorCode, ValidationError } from "@shared";

import type { PaymentIntentRepository } from "./PaymentIntentRepository.js";

export class ConfirmPayment {
  constructor(
    private readonly paymentIntentRepository: PaymentIntentRepository,
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
  }
}