import { describe, expect, it, vi } from "vitest";

import { InitiatePayment } from "@application/payment/InitiatePayment.js";
import type { PaymentGateway } from "@application/payment/PaymentGateway.js";

import { Money, PaymentIntent } from "@domain";

import { MemoryPaymentIntentRepository } from "@infrastructure/payment/MemoryPaymentIntentRepository.js";

describe("InitiatePayment", () => {
  it("should initiate a payment and persist provider metadata", async () => {
    const gateway: PaymentGateway = {
      requestPayment: vi.fn().mockResolvedValue({
        providerRequestId: "provider-123",
        checkoutUrl: "https://sandbox.intasend.com/checkout/provider-123",
      }),
    };

    const paymentIntentRepository = new MemoryPaymentIntentRepository();

    const paymentIntent = PaymentIntent.create({
      id: "payment-intent-1",
      planId: "plan-123",
      amount: Money.fromMinorUnits(500),
      phoneNumber: "0712345678",
      reference: "payment-ref-123",
    });

    const initiatePayment = new InitiatePayment(
      gateway,
      paymentIntentRepository,
    );

    const response = await initiatePayment.execute(paymentIntent);

    expect(response).toEqual({
      providerRequestId: "provider-123",
      checkoutUrl: "https://sandbox.intasend.com/checkout/provider-123",
    });

    expect(gateway.requestPayment).toHaveBeenCalledWith({
      amount: paymentIntent.amount,
      phoneNumber: paymentIntent.phoneNumber,
      reference: paymentIntent.reference,
    });

    const stored = await paymentIntentRepository.findByReference(
      paymentIntent.reference,
    );

    expect(stored).not.toBeNull();
    expect(stored?.id).toBe(paymentIntent.id);
  });
});
