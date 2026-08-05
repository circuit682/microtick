import { describe, expect, it } from "vitest";

import { GrantInternetAccess } from "@application/access/GrantInternetAccess.js";
import { ConfirmPayment } from "@application/payment/ConfirmPayment.js";
import { FulfilPurchase } from "@application/purchase/FulfilPurchase.js";

import { Money, PaymentIntent, PaymentStatus, Plan, PlanType } from "@domain";

import { MemoryInternetAccessRepository } from "@infrastructure/access/MemoryInternetAccessRepository.js";
import { UlidIdentifierGenerator } from "@infrastructure/identity/index.js";
import { MemoryPaymentIntentRepository } from "@infrastructure/payment/MemoryPaymentIntentRepository.js";
import { MemoryPlanRepository } from "@infrastructure/plan/MemoryPlanRepository.js";

import { InMemoryPurchaseRepository } from "../../doubles/purchase/InMemoryPurchaseRepository.js";

describe("ConfirmPayment", () => {
  async function createFulfilPurchase(): Promise<FulfilPurchase> {
    const purchaseRepository = new InMemoryPurchaseRepository();

    const planRepository = new MemoryPlanRepository();

    const identifierGenerator = new UlidIdentifierGenerator();

    const internetAccessRepository = new MemoryInternetAccessRepository();

    const grantInternetAccess = new GrantInternetAccess(
      internetAccessRepository,
      identifierGenerator,
    );

    const plan = Plan.create({
      id: "plan-1",
      name: "Quiky",
      price: Money.fromMinorUnits(500),
      type: PlanType.USAGE,
      allowanceMinutes: 30,
    });

    await planRepository.save(plan);

    return new FulfilPurchase(
      purchaseRepository,
      planRepository,
      identifierGenerator,
      grantInternetAccess,
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

  it("should confirm a pending payment", async () => {
    const repository = new MemoryPaymentIntentRepository();

    const payment = createPendingPayment();

    await repository.save(payment);

    const confirmPayment = new ConfirmPayment(
      repository,
      await createFulfilPurchase(),
    );

    await confirmPayment.execute("payment-ref-123");

    const confirmed = await repository.findByReference("payment-ref-123");

    expect(confirmed?.status).toBe(PaymentStatus.COMPLETED);
  });

  it("should throw when the payment cannot be found", async () => {
    const repository = new MemoryPaymentIntentRepository();

    const confirmPayment = new ConfirmPayment(
      repository,
      await createFulfilPurchase(),
    );

    await expect(confirmPayment.execute("unknown-reference")).rejects.toThrow();
  });

  it("should propagate domain errors for invalid transitions", async () => {
    const repository = new MemoryPaymentIntentRepository();

    const payment = PaymentIntent.create({
      id: "payment-intent-1",
      planId: "plan-1",
      amount: Money.fromMinorUnits(500),
      phoneNumber: "0712345678",
      reference: "payment-ref-123",
    });

    await repository.save(payment);

    const confirmPayment = new ConfirmPayment(
      repository,
      await createFulfilPurchase(),
    );

    await expect(confirmPayment.execute("payment-ref-123")).rejects.toThrow();
  });

  it("should ignore duplicate payment confirmations", async () => {
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

    await expect(
      confirmPayment.execute("payment-ref-123"),
    ).resolves.not.toThrow();

    const stored = await repository.findByReference("payment-ref-123");

    expect(stored?.status).toBe(PaymentStatus.COMPLETED);
  });
});
