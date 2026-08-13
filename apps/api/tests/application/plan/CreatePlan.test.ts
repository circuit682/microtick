import { describe, expect, it } from "vitest";

import { CreatePlan } from "@application/plan/CreatePlan.js";

import {
  AccessMethod,
  ConsumptionPolicy,
  Money,
  Plan,
  ServiceLevel,
  Validity,
  ValidityUnit,
} from "@domain";

import { UlidIdentifierGenerator } from "@infrastructure/identity/index.js";
import { MemoryPlanRepository } from "@infrastructure/plan/MemoryPlanRepository.js";

describe("CreatePlan", () => {
  function residentialService(): ServiceLevel {
    return ServiceLevel.create({
      name: "Residential",
    });
  }

  it("should create a valid usage plan", async () => {
    const repository = new MemoryPlanRepository();

    const identifierGenerator = new UlidIdentifierGenerator();

    const createPlan = new CreatePlan(identifierGenerator, repository);

    const plan = await createPlan.execute({
      name: "Quiky",
      price: 500,

      validity: Validity.create({
        amount: 30,
        unit: ValidityUnit.MINUTES,
      }),

      consumptionPolicy: ConsumptionPolicy.USAGE,

      serviceLevel: residentialService(),

      accessMethod: AccessMethod.SESSION,
    });

    expect(plan).toBeInstanceOf(Plan);

    expect(plan.id).toBeDefined();
    expect(plan.id.length).toBeGreaterThan(0);

    expect(plan.name).toBe("Quiky");

    expect(plan.price.equals(Money.fromMinorUnits(500))).toBe(true);

    expect(
      plan.validity.equals(
        Validity.create({
          amount: 30,
          unit: ValidityUnit.MINUTES,
        }),
      ),
    ).toBe(true);

    expect(plan.consumptionPolicy).toBe(ConsumptionPolicy.USAGE);

    expect(plan.serviceLevel.equals(residentialService())).toBe(true);

    expect(plan.accessMethod).toBe(AccessMethod.SESSION);

    expect(plan.active).toBe(true);
  });

  it("should create a valid continuous plan", async () => {
    const repository = new MemoryPlanRepository();

    const identifierGenerator = new UlidIdentifierGenerator();

    const createPlan = new CreatePlan(identifierGenerator, repository);

    const plan = await createPlan.execute({
      name: "Daily",
      price: 5000,

      validity: Validity.create({
        amount: 24,
        unit: ValidityUnit.HOURS,
      }),

      consumptionPolicy: ConsumptionPolicy.CONTINUOUS,

      serviceLevel: residentialService(),

      accessMethod: AccessMethod.WALL_CLOCK,
    });

    expect(plan).toBeInstanceOf(Plan);

    expect(plan.name).toBe("Daily");

    expect(plan.price.equals(Money.fromMinorUnits(5000))).toBe(true);

    expect(
      plan.validity.equals(
        Validity.create({
          amount: 24,
          unit: ValidityUnit.HOURS,
        }),
      ),
    ).toBe(true);

    expect(plan.consumptionPolicy).toBe(ConsumptionPolicy.CONTINUOUS);

    expect(plan.serviceLevel.equals(residentialService())).toBe(true);

    expect(plan.accessMethod).toBe(AccessMethod.WALL_CLOCK);

    expect(plan.active).toBe(true);
  });
});
