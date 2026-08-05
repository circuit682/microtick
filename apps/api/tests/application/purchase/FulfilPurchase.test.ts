import { describe, expect, it } from "vitest";

import { FulfilPurchase } from "@application/purchase/FulfilPurchase.js";

import { Money, Plan, PlanType, Purchase } from "@domain";

import { UlidIdentifierGenerator } from "@infrastructure/identity/index.js";
import { MemoryPlanRepository } from "@infrastructure/plan/MemoryPlanRepository.js";

import { InMemoryPurchaseRepository } from "../../doubles/purchase/InMemoryPurchaseRepository.js";

describe("FulfilPurchase", () => {
  function createPlan(): Plan {
    return Plan.create({
      id: "plan-001",
      name: "Quiky",
      price: Money.fromMinorUnits(500),
      type: PlanType.USAGE,
      allowanceMinutes: 30,
    });
  }

  it("creates a purchase from a valid payment", async () => {
    const purchaseRepository = new InMemoryPurchaseRepository();

    const planRepository = new MemoryPlanRepository();

    const identifierGenerator = new UlidIdentifierGenerator();

    const plan = createPlan();

    await planRepository.save(plan);

    const fulfilPurchase = new FulfilPurchase(
      purchaseRepository,
      planRepository,
      identifierGenerator,
    );

    await fulfilPurchase.execute({
      paymentId: "payment-001",
      customerId: "customer-001",
      planId: plan.id,
      purchasedAt: new Date(),
    });

    const purchases = await purchaseRepository.findByCustomerId("customer-001");

    expect(purchases).toHaveLength(1);

    const purchase = purchases[0]!;

    expect(purchase.paymentIntentId).toBe("payment-001");
    expect(purchase.customerId).toBe("customer-001");
    expect(purchase.planId).toBe(plan.id);
    expect(purchase.planName).toBe(plan.name);
    expect(purchase.planPrice.equals(plan.price)).toBe(true);
    expect(purchase.planType).toBe(plan.type);
    expect(purchase.allowanceMinutes).toBe(plan.allowanceMinutes);
  });

  it("persists the purchase", async () => {
    const purchaseRepository = new InMemoryPurchaseRepository();

    const planRepository = new MemoryPlanRepository();

    const identifierGenerator = new UlidIdentifierGenerator();

    const plan = createPlan();

    await planRepository.save(plan);

    const fulfilPurchase = new FulfilPurchase(
      purchaseRepository,
      planRepository,
      identifierGenerator,
    );

    await fulfilPurchase.execute({
      paymentId: "payment-001",
      customerId: "customer-001",
      planId: plan.id,
      purchasedAt: new Date(),
    });

    const purchases = await purchaseRepository.findByCustomerId("customer-001");

    expect(purchases).toHaveLength(1);

    const purchase = purchases[0]!;

    const persisted = await purchaseRepository.findById(purchase.id);

    expect(persisted).not.toBeNull();
  });

  it("stores an immutable snapshot of the purchased plan", async () => {
    const purchaseRepository = new InMemoryPurchaseRepository();

    const planRepository = new MemoryPlanRepository();

    const identifierGenerator = new UlidIdentifierGenerator();

    const plan = createPlan();

    await planRepository.save(plan);

    const fulfilPurchase = new FulfilPurchase(
      purchaseRepository,
      planRepository,
      identifierGenerator,
    );

    await fulfilPurchase.execute({
      paymentId: "payment-001",
      customerId: "customer-001",
      planId: plan.id,
      purchasedAt: new Date(),
    });

    const purchases = await purchaseRepository.findByCustomerId("customer-001");

    expect(purchases).toHaveLength(1);

    const purchase = purchases[0]!;

    const updatedPlan = plan.deactivate();

    expect(purchase.planId).toBe(updatedPlan.id);
    expect(purchase.planName).toBe(updatedPlan.name);
    expect(purchase.planPrice.equals(updatedPlan.price)).toBe(true);
    expect(purchase.planType).toBe(updatedPlan.type);
    expect(purchase.allowanceMinutes).toBe(updatedPlan.allowanceMinutes);
  });

  it("throws when the plan does not exist", async () => {
    const purchaseRepository = new InMemoryPurchaseRepository();

    const planRepository = new MemoryPlanRepository();

    const identifierGenerator = new UlidIdentifierGenerator();

    const fulfilPurchase = new FulfilPurchase(
      purchaseRepository,
      planRepository,
      identifierGenerator,
    );

    await expect(
      fulfilPurchase.execute({
        paymentId: "payment-001",
        customerId: "customer-001",
        planId: "missing-plan",
        purchasedAt: new Date(),
      }),
    ).rejects.toThrow();
  });

  it("does nothing when the payment has already been fulfilled", async () => {
    const purchaseRepository = new InMemoryPurchaseRepository();

    const planRepository = new MemoryPlanRepository();

    const identifierGenerator = new UlidIdentifierGenerator();

    const plan = createPlan();

    await planRepository.save(plan);

    const existingPurchase = Purchase.create({
      id: "purchase-001",
      paymentIntentId: "payment-001",
      customerId: "customer-001",
      planId: plan.id,
      planName: plan.name,
      planPrice: plan.price,
      planType: plan.type,
      allowanceMinutes: plan.allowanceMinutes,
      purchasedAt: new Date(),
    });

    await purchaseRepository.save(existingPurchase);

    const fulfilPurchase = new FulfilPurchase(
      purchaseRepository,
      planRepository,
      identifierGenerator,
    );

    await fulfilPurchase.execute({
      paymentId: "payment-001",
      customerId: "customer-001",
      planId: plan.id,
      purchasedAt: new Date(),
    });

    const purchases = await purchaseRepository.findByCustomerId("customer-001");

    expect(purchases).toHaveLength(1);

    const purchase = purchases[0]!;

    expect(purchase.id).toBe("purchase-001");
  });
});
