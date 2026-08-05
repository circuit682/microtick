import { describe, expect, it } from "vitest";

import { ConfirmPayment } from "@application/payment/ConfirmPayment.js";
import { ReceivePaymentConfirmation } from "@application/payment/ReceivePaymentConfirmation.js";
import { FulfilPurchase } from "@application/purchase/FulfilPurchase.js";

import { Money, PaymentIntent, PaymentStatus, Plan, PlanType } from "@domain";

import { UlidIdentifierGenerator } from "@infrastructure/identity/index.js";
import { MemoryPaymentIntentRepository } from "@infrastructure/payment/MemoryPaymentIntentRepository.js";
import { MemoryPlanRepository } from "@infrastructure/plan/MemoryPlanRepository.js";

import { InMemoryPurchaseRepository } from "../../doubles/purchase/InMemoryPurchaseRepository.js";

describe("ReceivePaymentConfirmation", () => {
  async function createFulfilPurchase(): Promise<FulfilPurchase> {
    const purchaseRepository = new InMemoryPurchaseRepository();

    const planRepository = new MemoryPlanRepository();

    await planRepository.save(
      Plan.create({
        id: "plan-1",
        name: "Quiky",
        price: Money.fromMinorUnits(500),
        type: PlanType.USAGE,
        allowanceMinutes: 30,
      }),
    );

    return new FulfilPurchase(
      purchaseRepository,
      planRepository,
      new UlidIdentifierGenerator(),
    );
  }

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

    const confirmPayment = new ConfirmPayment(
      repository,
      await createFulfilPurchase(),
    );

    const receivePaymentConfirmation = new ReceivePaymentConfirmation(
      confirmPayment,
    );

    // When
    await receivePaymentConfirmation.execute({
      reference: "payment-ref-123",
    });

    // Then
    const confirmed = await repository.findByReference("payment-ref-123");

    expect(confirmed?.status).toBe(PaymentStatus.COMPLETED);
  });

  it("should propagate errors from ConfirmPayment", async () => {
    // Given
    const repository = new MemoryPaymentIntentRepository();

    const confirmPayment = new ConfirmPayment(
      repository,
      await createFulfilPurchase(),
    );

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

  it("should ignore duplicate webhook deliveries", async () => {
    // Given
    const repository = new MemoryPaymentIntentRepository();

    const payment = PaymentIntent.create({
      id: "payment-intent-1",
      planId: "plan-1",
      amount: Money.fromMinorUnits(500),
      phoneNumber: "0712345678",
      reference: "payment-ref-123",
    });

    payment.markPending();
    payment.confirm();

    await repository.save(payment);

    const confirmPayment = new ConfirmPayment(
      repository,
      await createFulfilPurchase(),
    );

    const receivePaymentConfirmation = new ReceivePaymentConfirmation(
      confirmPayment,
    );

    // When / Then
    await expect(
      receivePaymentConfirmation.execute({
        reference: "payment-ref-123",
      }),
    ).resolves.not.toThrow();

    const confirmed = await repository.findByReference("payment-ref-123");

    expect(confirmed?.status).toBe(PaymentStatus.COMPLETED);
  });
});
