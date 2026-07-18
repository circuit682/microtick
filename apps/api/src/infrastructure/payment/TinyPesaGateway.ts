import type {
  PaymentGateway,
  PaymentGatewayResponse,
  PaymentRequest,
} from "@application/payment/PaymentGateway.js";

export class TinyPesaGateway implements PaymentGateway {
  async requestPayment(
    request: PaymentRequest,
  ): Promise<PaymentGatewayResponse> {
    throw new Error("Not implemented.");
  }
  static normalizePhoneNumber(phone: string): string {
    let msisdn = phone.replace(/\s+/g, "").replace(/[^0-9]/g, "");

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
      amount: request.amount.amount,
      msisdn: TinyPesaGateway.normalizePhoneNumber(request.phoneNumber),
    };
  }
}