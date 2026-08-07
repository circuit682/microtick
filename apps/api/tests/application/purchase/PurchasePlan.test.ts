import { describe, expect, it } from "vitest";

import { PurchasePlan } from "@application/purchase/PurchasePlan.js";

import {
  AccessMethod,
  Money,
  Plan,
  PlanType,
  ServiceLevel,
  Validity,
  ValidityUnit,
} from "@domain";

import { UlidIdentifierGenerator } from "@infrastructure/identity/index.js";

import { InMemoryPurchaseRepository } from "../../doubles/purchase/InMemoryPurchaseRepository.js";

describe("PurchasePlan", () => {
  function createPlan(): Plan {
    return Plan.create({
      id: "plan-001",
      name: "Quiky",
      price: Money.fromMinorUnits(500),

      validity: Validity.create({
        amount: 30,
        unit: ValidityUnit.MINUTES,
      }),

      serviceLevel: ServiceLevel.create({
        name: "Residential",
      }),

      accessMethod: AccessMethod.SESSION,

      // Temporary compatibility.
      type: PlanType.USAGE,
      allowanceMinutes: 30,
    });
  }

  it("creates a purchase from a plan", async () => {
    const repository = new InMemoryPurchaseRepository();

    const identifierGenerator = new UlidIdentifierGenerator();

    const useCase = new PurchasePlan(repository, identifierGenerator);

    const plan = createPlan();

    const purchase = await useCase.execute({
      paymentIntentId: "payment-intent-001",
      customerId: "customer-001",
      plan,
    });

    expect(purchase.id).toBeDefined();

    expect(purchase.paymentIntentId).toBe("payment-intent-001");

    expect(purchase.customerId).toBe("customer-001");

    expect(purchase.planId).toBe(plan.id);

    expect(purchase.planName).toBe(plan.name);

    expect(purchase.planPrice.equals(plan.price)).toBe(true);

    expect(purchase.validity.equals(plan.validity)).toBe(true);

    expect(purchase.serviceLevel.equals(plan.serviceLevel)).toBe(true);

    expect(purchase.accessMethod).toBe(plan.accessMethod);
  });

  it("persists the purchase", async () => {
    const repository = new InMemoryPurchaseRepository();

    const identifierGenerator = new UlidIdentifierGenerator();

    const useCase = new PurchasePlan(repository, identifierGenerator);

    const purchase = await useCase.execute({
      paymentIntentId: "payment-intent-001",
      customerId: "customer-001",
      plan: createPlan(),
    });

    const persisted = await repository.findById(purchase.id);

    expect(persisted).not.toBeNull();

    expect(persisted?.id).toBe(purchase.id);

    expect(persisted?.paymentIntentId).toBe("payment-intent-001");
  });

  it("stores an immutable snapshot of the purchased plan", async () => {
    const repository = new InMemoryPurchaseRepository();

    const identifierGenerator = new UlidIdentifierGenerator();

    const useCase = new PurchasePlan(repository, identifierGenerator);

    const plan = createPlan();

    const purchase = await useCase.execute({
      paymentIntentId: "payment-intent-001",
      customerId: "customer-001",
      plan,
    });

    expect(purchase.planId).toBe(plan.id);

    expect(purchase.planName).toBe(plan.name);

    expect(purchase.planPrice.equals(plan.price)).toBe(true);

    expect(purchase.validity.equals(plan.validity)).toBe(true);

    expect(purchase.serviceLevel.equals(plan.serviceLevel)).toBe(true);

    expect(purchase.accessMethod).toBe(plan.accessMethod);
  });
});
