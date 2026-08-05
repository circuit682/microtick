import type {
  PaymentGateway,
  PaymentGatewayResponse,
} from "./PaymentGateway.js";
import type { PaymentIntentRepository } from "./PaymentIntentRepository.js";

import { PaymentIntent } from "@domain";

export class InitiatePayment {
  constructor(
    private readonly paymentGateway: PaymentGateway,
    private readonly paymentIntentRepository: PaymentIntentRepository,
  ) {}

  async execute(paymentIntent: PaymentIntent): Promise<PaymentGatewayResponse> {
    await this.paymentIntentRepository.save(paymentIntent);

    return this.paymentGateway.requestPayment({
      amount: paymentIntent.amount,
      phoneNumber: paymentIntent.phoneNumber,
      reference: paymentIntent.reference,
    });
  }
}
