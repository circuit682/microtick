import { describe, expect, it } from "vitest";

import { GrantInternetAccess } from "@application/access/GrantInternetAccess.js";
import { FulfilPurchase } from "@application/purchase/FulfilPurchase.js";

import {
  AccessMethod,
  ConsumptionPolicy,
  Money,
  Plan,
  ServiceLevel,
  Validity,
  ValidityUnit,
} from "@domain";

import { UlidIdentifierGenerator } from "@infrastructure/identity/UlidIdentifierGenerator.js";
import { MemoryInternetAccessRepository } from "@infrastructure/access/MemoryInternetAccessRepository.js";
import { MemoryPlanRepository } from "@infrastructure/plan/MemoryPlanRepository.js";

import { InMemoryPurchaseRepository } from "../../doubles/purchase/InMemoryPurchaseRepository.js";

describe("FulfilPurchase", () => {
  function createPlan(): Plan {
    return Plan.create({
      id: "quiky",
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
    });
  }

  it("should create a purchase from the selected plan and grant internet access", async () => {
    const purchaseRepository = new InMemoryPurchaseRepository();

    const planRepository = new MemoryPlanRepository();

    const internetAccessRepository = new MemoryInternetAccessRepository();

    const identifierGenerator = new UlidIdentifierGenerator();

    const grantInternetAccess = new GrantInternetAccess(
      internetAccessRepository,
      identifierGenerator,
    );

    const fulfilPurchase = new FulfilPurchase(
      purchaseRepository,
      planRepository,
      identifierGenerator,
      grantInternetAccess,
    );

    const plan = createPlan();

    await planRepository.save(plan);

    const purchasedAt = new Date("2026-08-01T10:00:00Z");

    await fulfilPurchase.execute({
      paymentId: "payment-intent-1",
      customerId: "customer-001",
      planId: plan.id,
      purchasedAt,
    });

    const purchase =
      await purchaseRepository.findByPaymentIntentId("payment-intent-1");

    expect(purchase).not.toBeNull();

    expect(purchase?.paymentIntentId).toBe("payment-intent-1");

    expect(purchase?.customerId).toBe("customer-001");

    expect(purchase?.planId).toBe(plan.id);
    expect(purchase?.planName).toBe(plan.name);

    expect(purchase?.planPrice.equals(plan.price)).toBe(true);

    expect(purchase?.validity.equals(plan.validity)).toBe(true);

    expect(purchase?.consumptionPolicy).toBe(plan.consumptionPolicy);

    expect(purchase?.serviceLevel.equals(plan.serviceLevel)).toBe(true);

    expect(purchase?.accessMethod).toBe(plan.accessMethod);

    expect(purchase?.purchasedAt).toEqual(purchasedAt);

    const access = await internetAccessRepository.findByPurchaseId(
      purchase!.id,
    );

    expect(access).not.toBeNull();

    expect(access?.purchaseId).toBe(purchase!.id);

    expect(access?.customerId).toBe("customer-001");

    expect(access?.grantedAt).toEqual(purchasedAt);
  });

  it("should not create a duplicate purchase for the same payment", async () => {
    const purchaseRepository = new InMemoryPurchaseRepository();

    const planRepository = new MemoryPlanRepository();

    const internetAccessRepository = new MemoryInternetAccessRepository();

    const identifierGenerator = new UlidIdentifierGenerator();

    const grantInternetAccess = new GrantInternetAccess(
      internetAccessRepository,
      identifierGenerator,
    );

    const fulfilPurchase = new FulfilPurchase(
      purchaseRepository,
      planRepository,
      identifierGenerator,
      grantInternetAccess,
    );

    const plan = createPlan();

    await planRepository.save(plan);

    const command = {
      paymentId: "payment-intent-1",
      customerId: "customer-001",
      planId: plan.id,
      purchasedAt: new Date("2026-08-01T10:00:00Z"),
    };

    await fulfilPurchase.execute(command);
    await fulfilPurchase.execute(command);

    const purchase =
      await purchaseRepository.findByPaymentIntentId("payment-intent-1");

    expect(purchase).not.toBeNull();

    const access = await internetAccessRepository.findByPurchaseId(
      purchase!.id,
    );

    expect(access).not.toBeNull();
  });
});
