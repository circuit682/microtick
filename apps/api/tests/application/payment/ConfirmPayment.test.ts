import { describe, expect, it } from "vitest";

import { ConfirmPayment } from "@application/payment/ConfirmPayment.js";
import { Money, PaymentIntent } from "@domain";
import { MemoryPaymentIntentRepository } from "@infrastructure/payment/MemoryPaymentIntentRepository.js";

describe("ConfirmPayment", () => {
  function createPendingPayment(): PaymentIntent {
    const payment = PaymentIntent.create({
      id: "payment-intent-1",
      amount: Money.fromMinorUnits(500),
      phoneNumber: "0712345678",
      reference: "payment-ref-123",
    });

    payment.markPending();

    return payment;
  }

  it("should confirm a pending payment", async () => {
    const repository = new MemoryPaymentIntentRepository();
    const payment = createPendingPayment();

    await repository.save(payment);

    const confirmPayment = new ConfirmPayment(repository);

    await confirmPayment.execute("payment-ref-123");

    const confirmed = await repository.findByReference("payment-ref-123");

    expect(confirmed?.status).toBe("COMPLETED");
  });

  it("should throw when the payment cannot be found", async () => {
    const repository = new MemoryPaymentIntentRepository();

    const confirmPayment = new ConfirmPayment(repository);

    await expect(confirmPayment.execute("unknown-reference")).rejects.toThrow();
  });

  it("should propagate domain errors for invalid transitions", async () => {
    const repository = new MemoryPaymentIntentRepository();

    const payment = PaymentIntent.create({
      id: "payment-intent-1",
      amount: Money.fromMinorUnits(500),
      phoneNumber: "0712345678",
      reference: "payment-ref-123",
    });

    await repository.save(payment);

    const confirmPayment = new ConfirmPayment(repository);

    await expect(confirmPayment.execute("payment-ref-123")).rejects.toThrow();
  });
});
