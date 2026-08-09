import type {
  PaymentGateway,
  PaymentGatewayResponse,
  PaymentRequest,
} from "@application/payment/PaymentGateway.js";

interface TinyPesaGatewayConfig {
  apiKey: string;
  baseUrl: string;
}

export class TinyPesaGateway implements PaymentGateway {
  private readonly config: TinyPesaGatewayConfig;

  constructor(config: TinyPesaGatewayConfig) {
    this.config = Object.freeze({ ...config });
  }

  async requestPayment(
    request: PaymentRequest,
  ): Promise<PaymentGatewayResponse> {
    const response = await fetch(`${this.config.baseUrl}/express/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(TinyPesaGateway.buildPaymentPayload(request)),
    });

    const body = await response.json();

    return {
      providerRequestId: body.providerRequestId ?? "",
      checkoutUrl: body.checkoutUrl ?? "",
    };
  }

  static normalizePhoneNumber(phone: string): string {
    const msisdn = phone.replace(/\s+/g, "").replace(/[^0-9]/g, "");

    if (msisdn.startsWith("0")) {
      return "254" + msisdn.slice(1);
    }

    if (msisdn.length === 9) {
      return "254" + msisdn;
    }

    return msisdn;
  }

  static buildPaymentPayload(request: PaymentRequest) {
    return {
      amount: request.amount.minorUnits,
      msisdn: TinyPesaGateway.normalizePhoneNumber(request.phoneNumber),
      account_no: request.reference,
    };
  }
}
