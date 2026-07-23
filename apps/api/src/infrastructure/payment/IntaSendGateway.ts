import type {
  PaymentGateway,
  PaymentGatewayResponse,
  PaymentRequest,
} from "@application/payment/PaymentGateway.js";

export interface IntaSendGatewayConfig {
  apiKey: string;
  baseUrl: string;
}

export class IntaSendGateway implements PaymentGateway {
  constructor(private readonly config: IntaSendGatewayConfig) {}

  static normalizePhoneNumber(phoneNumber: string): string {
    if (phoneNumber.startsWith("254")) {
      return phoneNumber;
    }

    if (phoneNumber.startsWith("0")) {
      return `254${phoneNumber.slice(1)}`;
    }

    return `254${phoneNumber}`;
  }

  static buildPaymentPayload(request: PaymentRequest) {
    return {
      amount: request.amount.amount / 100, // Convert from cents to base currency unit
      phone_number: this.normalizePhoneNumber(request.phoneNumber),
      api_ref: request.reference,
    };
  }

  async requestPayment(
  request: PaymentRequest,
): Promise<PaymentGatewayResponse> {
  const payload = IntaSendGateway.buildPaymentPayload(request);

  const response = await fetch(
    `${this.config.baseUrl}/v1/payment/mpesa-stk-push/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error("IntaSend payment request failed.");
  }

  const json = await response.json();

  return {
    providerRequestId: json.invoice.invoice_id,
  };
}

}