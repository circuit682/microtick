import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  AccessMethod,
  ConsumptionPolicy,
  Money,
  Plan,
  ServiceLevel,
  Validity,
  ValidityUnit,
} from "@domain";

import { prisma } from "@infrastructure/database/prisma.js";
import { PrismaPlanRepository } from "@infrastructure/plan/PrismaPlanRepository.js";

describe("PrismaPlanRepository", () => {
  let repository: PrismaPlanRepository;

  beforeEach(async () => {
    await prisma.internetAccess.deleteMany();
    await prisma.purchase.deleteMany();
    await prisma.plan.deleteMany();

    repository = new PrismaPlanRepository();
  });

  afterEach(async () => {
    await prisma.internetAccess.deleteMany();
    await prisma.purchase.deleteMany();
    await prisma.plan.deleteMany();
  });

  it("saves and retrieves the plan with its service level", async () => {
    const plan = Plan.create({
      id: "plan-service-level-001",
      name: "Business Plan",
      price: Money.fromMinorUnits(1000),

      validity: Validity.create({
        amount: 1,
        unit: ValidityUnit.DAYS,
      }),

      consumptionPolicy: ConsumptionPolicy.CONTINUOUS,

      serviceLevel: ServiceLevel.create({
        name: "Business",
      }),

      accessMethod: AccessMethod.WALL_CLOCK,
    });

    await repository.save(plan);

    const stored = await repository.findById(plan.id);

    expect(stored).not.toBeNull();
    expect(stored?.id).toBe(plan.id);
    expect(stored?.serviceLevel.name).toBe("Business");
  });
});
