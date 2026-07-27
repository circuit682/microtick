import { describe, expect, it } from "vitest";

import { Money, Plan, PlanType } from "@domain";

import { PurchasePlan } from "@application/purchase/PurchasePlan.js";

import { UlidIdentifierGenerator } from "@infrastructure/identity/index.js";
import { InMemoryPurchaseRepository } from "../../doubles/purchase/InMemoryPurchaseRepository.js";

describe("PurchasePlan", () => {
  it("creates a purchase from a plan", async () => {
    const repository = new InMemoryPurchaseRepository();
    const identifierGenerator = new UlidIdentifierGenerator();

    const useCase = new PurchasePlan(repository, identifierGenerator);

    const plan = Plan.create({
      id: "plan-001",
      name: "Quiky",
      price: Money.fromMinorUnits(500),
      type: PlanType.USAGE,
      allowanceMinutes: 30,
    });

    const purchase = await useCase.execute({
      customerId: "customer-001",
      plan,
    });

    expect(purchase.id).toBeDefined();
    expect(purchase.customerId).toBe("customer-001");
    expect(purchase.planId).toBe(plan.id);
    expect(purchase.planName).toBe(plan.name);
    expect(purchase.planPrice.equals(plan.price)).toBe(true);
    expect(purchase.planType).toBe(plan.type);
    expect(purchase.allowanceMinutes).toBe(plan.allowanceMinutes);
  });

  it("persists the purchase", async () => {
    const repository = new InMemoryPurchaseRepository();
    const identifierGenerator = new UlidIdentifierGenerator();

    const useCase = new PurchasePlan(repository, identifierGenerator);

    const plan = Plan.create({
      id: "plan-001",
      name: "Quiky",
      price: Money.fromMinorUnits(500),
      type: PlanType.USAGE,
      allowanceMinutes: 30,
    });

    const purchase = await useCase.execute({
      customerId: "customer-001",
      plan,
    });

    const persisted = await repository.findById(purchase.id);

    expect(persisted).not.toBeNull();
    expect(persisted?.id).toBe(purchase.id);
  });

  it("stores an immutable snapshot of the purchased plan", async () => {
    const repository = new InMemoryPurchaseRepository();
    const identifierGenerator = new UlidIdentifierGenerator();

    const useCase = new PurchasePlan(repository, identifierGenerator);

    const plan = Plan.create({
      id: "plan-001",
      name: "Quiky",
      price: Money.fromMinorUnits(500),
      type: PlanType.USAGE,
      allowanceMinutes: 30,
    });

    const purchase = await useCase.execute({
      customerId: "customer-001",
      plan,
    });

    expect(purchase.planId).toBe(plan.id);
    expect(purchase.planName).toBe(plan.name);
    expect(purchase.planPrice.equals(plan.price)).toBe(true);
    expect(purchase.planType).toBe(plan.type);
    expect(purchase.allowanceMinutes).toBe(plan.allowanceMinutes);
  });
});
