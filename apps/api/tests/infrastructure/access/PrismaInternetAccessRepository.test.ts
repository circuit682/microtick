import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  AccessMethod,
  ConsumptionPolicy,
  InternetAccess,
  InternetAccessStatus,
  Money,
  Plan,
  Purchase,
  ServiceLevel,
  Validity,
  ValidityUnit,
} from "@domain";

import { prisma } from "@infrastructure/database/prisma.js";
import { PrismaInternetAccessRepository } from "@infrastructure/access/PrismaInternetAccessRepository.js";
import { PrismaPlanRepository } from "@infrastructure/plan/PrismaPlanRepository.js";
import { PrismaPurchaseRepository } from "@infrastructure/purchase/PrismaPurchaseRepository.js";

describe("PrismaInternetAccessRepository", () => {
  const planRepository = new PrismaPlanRepository();
  const purchaseRepository = new PrismaPurchaseRepository();

  let repository: PrismaInternetAccessRepository;

  beforeEach(async () => {
    await prisma.internetAccess.deleteMany();
    await prisma.purchase.deleteMany();
    await prisma.plan.deleteMany();

    repository = new PrismaInternetAccessRepository();
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

    const purchase = Purchase.create({
      paymentIntentId: "payment-intent-001",
      id: "purchase-001",
      customerId: "customer-001",

      planId: plan.id,
      planName: plan.name,
      planPrice: plan.price,

      validity: plan.validity,
      consumptionPolicy: plan.consumptionPolicy,
      serviceLevel: plan.serviceLevel,
      accessMethod: plan.accessMethod,

      purchasedAt: new Date("2026-08-01T10:00:00Z"),
    });

    await purchaseRepository.save(purchase);

    return purchase;
  }

  function createAccess(purchase: Purchase): InternetAccess {
    return InternetAccess.create({
      id: "access-001",
      purchaseId: purchase.id,
      customerId: purchase.customerId,

      status: InternetAccessStatus.GRANTED,

      grantedAt: new Date("2026-08-01T10:00:00Z"),
      expiresAt: new Date("2026-08-01T10:30:00Z"),

      consumedMinutes: 12.5,
      accessMethod: purchase.accessMethod,
    });
  }

  it("saves and retrieves consumed minutes by purchase id", async () => {
    const purchase = await createPurchase();
    const access = createAccess(purchase);

    await repository.save(access);

    const stored = await repository.findByPurchaseId(access.purchaseId);

    expect(stored).not.toBeNull();
    expect(stored?.id).toBe(access.id);
    expect(stored?.consumedMinutes).toBe(12.5);
  });

  it("finds access by customer id with consumed minutes", async () => {
    const purchase = await createPurchase();
    const access = createAccess(purchase);

    await repository.save(access);

    const stored = await repository.findByCustomerId(access.customerId);

    expect(stored).not.toBeNull();
    expect(stored?.id).toBe(access.id);
    expect(stored?.purchaseId).toBe(access.purchaseId);
    expect(stored?.consumedMinutes).toBe(12.5);
  });
});
