import type { PaymentGateway, PaymentGatewayResponse } from "./PaymentGateway.js";
import { PaymentIntent } from "@domain";

export class InitiatePayment {
  constructor(private readonly paymentGateway: PaymentGateway) {}

  async execute(
    paymentIntent: PaymentIntent,
  ): Promise<PaymentGatewayResponse> {
    return this.paymentGateway.requestPayment({
      amount: paymentIntent.amount,
      phoneNumber: paymentIntent.phoneNumber,
      reference: paymentIntent.reference,
    });
  }
}