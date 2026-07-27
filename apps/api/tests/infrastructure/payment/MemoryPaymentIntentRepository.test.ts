import { describe, expect, it } from "vitest";

import { Money, PaymentIntent } from "@domain";
import { MemoryPaymentIntentRepository } from "@infrastructure/payment/MemoryPaymentIntentRepository.js";

describe("MemoryPaymentIntentRepository", () => {
  it("should save a payment intent", async () => {
    const repository = new MemoryPaymentIntentRepository();

    const payment = new PaymentIntent({
      amount: Money.fromMinorUnits(500),
      phoneNumber: "0712345678",
      reference: "plan-123",
    });

    await repository.save(payment);

    const stored = await repository.findByReference("plan-123");

    expect(stored).toBe(payment);
  });

  it("should return null when a payment intent does not exist", async () => {
    const repository = new MemoryPaymentIntentRepository();

    const payment = await repository.findByReference("unknown");

    expect(payment).toBeNull();
  });

  it("should overwrite an existing payment intent with the same reference", async () => {
    const repository = new MemoryPaymentIntentRepository();

    const original = new PaymentIntent({
      amount: Money.fromMinorUnits(500),
      phoneNumber: "0712345678",
      reference: "plan-123",
    });

    const replacement = new PaymentIntent({
      amount: Money.fromMinorUnits(1000),
      phoneNumber: "0799999999",
      reference: "plan-123",
    });

    await repository.save(original);
    await repository.save(replacement);

    const stored = await repository.findByReference("plan-123");

    expect(stored).toBe(replacement);
  });
});