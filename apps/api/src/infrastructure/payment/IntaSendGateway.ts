import type {
  PaymentGateway,
  PaymentGatewayResponse,
  PaymentRequest,
} from "@application/payment/PaymentGateway.js";

import { IntaSendCheckoutPayload } from "./IntaSendCheckoutPayload.js";

import type { IntaSendCheckoutResponse } from "./IntaSendCheckoutResponse.js";

import { IntaSendCheckoutError } from "./errors/IntaSendCheckoutError.js";

export interface IntaSendGatewayConfig {
  publishableKey: string;
  baseUrl: string;
  host: string;
  redirectUrl: string;
}

export class IntaSendGateway implements PaymentGateway {
  constructor(
    private readonly config: IntaSendGatewayConfig,
  ) {}

  async requestPayment(
    request: PaymentRequest,
  ): Promise<PaymentGatewayResponse> {
    const payload = IntaSendCheckoutPayload.from(
      request,
      this.config,
    );

    const response = await fetch(
      `${this.config.baseUrl}/api/v1/checkout/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-IntaSend-Public-API-Key":
            this.config.publishableKey,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const error = await response.text();

      throw new IntaSendCheckoutError(
        `IntaSend checkout creation failed: ${response.status} ${error}`,
      );
    }

    const checkout =
      (await response.json()) as IntaSendCheckoutResponse;

    return {
      providerRequestId: checkout.id,
      checkoutUrl: checkout.url,
    };
  }
}