import { describe, expect, it } from "vitest";

import { GrantInternetAccess } from "@application/access/GrantInternetAccess.js";
import { ConfirmPayment } from "@application/payment/ConfirmPayment.js";
import { ReceivePaymentConfirmation } from "@application/payment/ReceivePaymentConfirmation.js";
import { FulfilPurchase } from "@application/purchase/FulfilPurchase.js";

import {
  AccessMethod,
  ConsumptionPolicy,
  Money,
  PaymentIntent,
  PaymentStatus,
  Plan,
  PlanType,
  ServiceLevel,
  Validity,
  ValidityUnit,
} from "@domain";

import { MemoryInternetAccessRepository } from "@infrastructure/access/MemoryInternetAccessRepository.js";
import { UlidIdentifierGenerator } from "@infrastructure/identity/index.js";
import { MemoryPaymentIntentRepository } from "@infrastructure/payment/MemoryPaymentIntentRepository.js";
import { MemoryPlanRepository } from "@infrastructure/plan/MemoryPlanRepository.js";

import { InMemoryPurchaseRepository } from "../../doubles/purchase/InMemoryPurchaseRepository.js";

describe("ReceivePaymentConfirmation", () => {
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

      validity: Validity.create({
        amount: 30,
        unit: ValidityUnit.MINUTES,
      }),

      consumptionPolicy: ConsumptionPolicy.USAGE,

      serviceLevel: ServiceLevel.create({
        name: "Residential",
      }),

      accessMethod: AccessMethod.SESSION,

      // Temporary compatibility.
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

  it("should confirm a payment when a confirmation is received", async () => {
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

    await receivePaymentConfirmation.execute({
      reference: "payment-ref-123",
    });

    const confirmed = await repository.findByReference("payment-ref-123");

    expect(confirmed?.status).toBe(PaymentStatus.COMPLETED);
  });

  it("should propagate errors from ConfirmPayment", async () => {
    const repository = new MemoryPaymentIntentRepository();

    const confirmPayment = new ConfirmPayment(
      repository,
      await createFulfilPurchase(),
    );

    const receivePaymentConfirmation = new ReceivePaymentConfirmation(
      confirmPayment,
    );

    await expect(
      receivePaymentConfirmation.execute({
        reference: "unknown-reference",
      }),
    ).rejects.toThrow();
  });

  it("should ignore duplicate webhook deliveries", async () => {
    const repository = new MemoryPaymentIntentRepository();

    const payment = createPendingPayment();

    payment.confirm();

    await repository.save(payment);

    const confirmPayment = new ConfirmPayment(
      repository,
      await createFulfilPurchase(),
    );

    const receivePaymentConfirmation = new ReceivePaymentConfirmation(
      confirmPayment,
    );

    await expect(
      receivePaymentConfirmation.execute({
        reference: "payment-ref-123",
      }),
    ).resolves.not.toThrow();

    const confirmed = await repository.findByReference("payment-ref-123");

    expect(confirmed?.status).toBe(PaymentStatus.COMPLETED);
  });
});
