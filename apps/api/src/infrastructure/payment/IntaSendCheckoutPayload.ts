import type { PaymentRequest } from "@application/payment/PaymentGateway.js";

import type { IntaSendGatewayConfig } from "./IntaSendGateway.js";
import type { IntaSendCheckoutRequest } from "./IntaSendCheckoutRequest.js";

export class IntaSendCheckoutPayload {
  static from(
    request: PaymentRequest,
    config: IntaSendGatewayConfig,
  ): IntaSendCheckoutRequest {
    return {
      amount: request.amount.amount / 100,
      currency: "KES",
      phone_number: this.normalizePhoneNumber(
        request.phoneNumber,
      ),
      api_ref: request.reference,

      host: config.host,
      redirect_url: config.redirectUrl,

      channel: "WEBSITE",

      mobile_tarrif: "BUSINESS-PAYS",
      card_tarrif: "BUSINESS-PAYS",
    };
  }

  private static normalizePhoneNumber(
    phoneNumber: string,
  ): string {
    if (phoneNumber.startsWith("254")) {
      return phoneNumber;
    }

    if (phoneNumber.startsWith("0")) {
      return `254${phoneNumber.slice(1)}`;
    }

    return `254${phoneNumber}`;
  }
}