import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  AccessMethod,
  ConsumptionPolicy,
  Money,
  Plan,
  Purchase,
  ServiceLevel,
  Validity,
  ValidityUnit,
} from "@domain";

import { prisma } from "@infrastructure/database/prisma.js";
import { PrismaPlanRepository } from "@infrastructure/plan/PrismaPlanRepository.js";
import { PrismaPurchaseRepository } from "@infrastructure/purchase/PrismaPurchaseRepository.js";

describe("PrismaPurchaseRepository", () => {
  const planRepository = new PrismaPlanRepository();

  let repository: PrismaPurchaseRepository;

  beforeEach(async () => {
    await prisma.internetAccess.deleteMany();
    await prisma.purchase.deleteMany();
    await prisma.plan.deleteMany();

    repository = new PrismaPurchaseRepository();
  });

  afterEach(async () => {
    await prisma.internetAccess.deleteMany();
    await prisma.purchase.deleteMany();
    await prisma.plan.deleteMany();
  });

  async function createPurchase(): Promise<Purchase> {
    const plan = Plan.create({
      id: "quiky-30",
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

    await planRepository.save(plan);

    return Purchase.create({
      id: "purchase-001",
      paymentIntentId: "payment-intent-001",
      customerId: "customer-001",
      networkIdentityId: "identity-001",

      planId: plan.id,
      planName: plan.name,
      planPrice: plan.price,

      validity: plan.validity,
      consumptionPolicy: plan.consumptionPolicy,
      serviceLevel: plan.serviceLevel,
      accessMethod: plan.accessMethod,

      purchasedAt: new Date("2026-08-01T10:00:00Z"),
    });
  }

  it("saves and retrieves the purchase with its network identity id", async () => {
    const purchase = await createPurchase();

    await repository.save(purchase);

    const stored = await repository.findById(purchase.id);

    expect(stored).not.toBeNull();
    expect(stored?.id).toBe(purchase.id);
    expect(stored?.networkIdentityId).toBe("identity-001");
  });
});
