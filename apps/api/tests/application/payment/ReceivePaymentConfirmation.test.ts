import { describe, expect, it } from "vitest";

import { ConfirmPayment } from "@application/payment/ConfirmPayment.js";
import { ReceivePaymentConfirmation } from "@application/payment/ReceivePaymentConfirmation.js";

import { Money, PaymentIntent } from "@domain";
import { MemoryPaymentIntentRepository } from "@infrastructure/payment/MemoryPaymentIntentRepository.js";

describe("ReceivePaymentConfirmation", () => {
  const fulfilPurchase = {
    execute: async () => {},
  };

  function createPendingPayment(): PaymentIntent {
    const payment = PaymentIntent.create({
      id: "payment-intent-1",
      planId: "plan-1",
      amount: Money.fromMinorUnits(500),
      phoneNumber: "0712345678",
      reference: "payment-ref-123",
    });

    payment.markPending();

    return payment;
  }

  it("should confirm a payment when a confirmation is received", async () => {
    // Given
    const repository = new MemoryPaymentIntentRepository();
    const payment = createPendingPayment();

    await repository.save(payment);

    const confirmPayment = new ConfirmPayment(repository, fulfilPurchase);

    const receivePaymentConfirmation = new ReceivePaymentConfirmation(
      confirmPayment,
    );

    // When
    await receivePaymentConfirmation.execute({
      reference: "payment-ref-123",
    });

    // Then
    const confirmed = await repository.findByReference("payment-ref-123");

    expect(confirmed?.status).toBe("COMPLETED");
  });

  it("should propagate errors from ConfirmPayment", async () => {
    // Given
    const repository = new MemoryPaymentIntentRepository();

    const confirmPayment = new ConfirmPayment(repository, fulfilPurchase);

    const receivePaymentConfirmation = new ReceivePaymentConfirmation(
      confirmPayment,
    );

    // When / Then
    await expect(
      receivePaymentConfirmation.execute({
        reference: "unknown-reference",
      }),
    ).rejects.toThrow();
  });
});
