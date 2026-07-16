import type {
  PaymentGateway,
  PaymentRequest,
} from "@application/payment/PaymentGateway.js";

export class FakePaymentGateway implements PaymentGateway {
  public lastRequest: PaymentRequest | null = null;

  async requestPayment(request: PaymentRequest): Promise<void> {
    this.lastRequest = request;
  }
}