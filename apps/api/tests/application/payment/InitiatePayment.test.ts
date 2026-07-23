import { describe, expect, it, vi } from "vitest";

import { InitiatePayment } from "@application/payment/InitiatePayment.js";
import type { PaymentGateway } from "@application/payment/PaymentGateway.js";
import { Money } from "@domain";
import { PaymentIntent } from "@domain";

describe("InitiatePayment", () => {
  it("should initiate a payment using the configured payment gateway", async () => {
    const gateway: PaymentGateway = {
      requestPayment: vi.fn().mockResolvedValue({
        providerRequestId: "provider-123",
      }),
    };

    const paymentIntent = new PaymentIntent({
      amount: Money.fromKES(500),
      phoneNumber: "0712345678",
      reference: "plan-123",
    });

    const initiatePayment = new InitiatePayment(gateway);

    const response = await initiatePayment.execute(paymentIntent);

    expect(response).toEqual({
      providerRequestId: "provider-123",
    });

    expect(gateway.requestPayment).toHaveBeenCalledWith({
      amount: paymentIntent.amount,
      phoneNumber: paymentIntent.phoneNumber,
      reference: paymentIntent.reference,
    });
  });
});