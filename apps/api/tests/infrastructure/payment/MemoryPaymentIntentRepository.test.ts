import { describe, expect, it } from "vitest";

import { Money, PaymentIntent } from "@domain";

import { MemoryPaymentIntentRepository } from "@infrastructure/payment/MemoryPaymentIntentRepository.js";

describe("MemoryPaymentIntentRepository", () => {
  it("persists provider metadata separately from the domain payment intent", async () => {
    const repository = new MemoryPaymentIntentRepository();

    const paymentIntent = PaymentIntent.create({
      id: "payment-intent-1",
      planId: "plan-1",
      amount: Money.fromMinorUnits(500),
      phoneNumber: "0712345678",
      reference: "payment-ref-123",
    });

    await repository.save(paymentIntent);

    await repository.updateProviderMetadata(paymentIntent.id, {
      providerReference: "provider-123",
      checkoutUrl: "https://sandbox.intasend.com/checkout/provider-123",
    });

    const stored = await repository.findByReference(paymentIntent.reference);

    expect(stored).not.toBeNull();
    expect(stored?.id).toBe(paymentIntent.id);
  });
});
