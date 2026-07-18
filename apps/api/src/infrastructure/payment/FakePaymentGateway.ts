import type {
  PaymentGateway,
  PaymentGatewayResponse,
  PaymentRequest,
} from "@application/payment/PaymentGateway.js";

export class FakePaymentGateway implements PaymentGateway {
  public lastRequest: PaymentRequest | null = null;

  async requestPayment(
    request: PaymentRequest,
  ): Promise<PaymentGatewayResponse> {
    this.lastRequest = request;

    return {
      providerRequestId: "fake-provider-request-id",
    };
  }
}