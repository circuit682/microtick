import { describe, expect, it } from "vitest";

import { CreatePlan } from "@application/plan/CreatePlan.js";

import {
  AccessMethod,
  ConsumptionPolicy,
  Money,
  Plan,
  PlanType,
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
    // Given
    const repository = new MemoryPlanRepository();

    const identifierGenerator = new UlidIdentifierGenerator();

    const createPlan = new CreatePlan(identifierGenerator, repository);

    // When
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

      // Temporary compatibility.
      type: PlanType.USAGE,
      allowanceMinutes: 30,
    });

    // Then
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

    // Temporary compatibility.
    expect(plan.type).toBe(PlanType.USAGE);
    expect(plan.allowanceMinutes).toBe(30);

    expect(plan.active).toBe(true);
  });

  it("should create a valid time plan", async () => {
    // Given
    const repository = new MemoryPlanRepository();

    const identifierGenerator = new UlidIdentifierGenerator();

    const createPlan = new CreatePlan(identifierGenerator, repository);

    // When
    const plan = await createPlan.execute({
      name: "Daily",
      price: 5000,

      validity: Validity.create({
        amount: 1,
        unit: ValidityUnit.DAYS,
      }),

      consumptionPolicy: ConsumptionPolicy.CONTINUOUS,

      serviceLevel: residentialService(),

      accessMethod: AccessMethod.WALL_CLOCK,

      // Temporary compatibility.
      type: PlanType.TIME,
      allowanceMinutes: 1440,
    });

    // Then
    expect(
      plan.validity.equals(
        Validity.create({
          amount: 1,
          unit: ValidityUnit.DAYS,
        }),
      ),
    ).toBe(true);

    expect(plan.consumptionPolicy).toBe(ConsumptionPolicy.CONTINUOUS);

    expect(plan.serviceLevel.equals(residentialService())).toBe(true);

    expect(plan.accessMethod).toBe(AccessMethod.WALL_CLOCK);

    // Temporary compatibility.
    expect(plan.type).toBe(PlanType.TIME);
    expect(plan.allowanceMinutes).toBe(1440);
  });
});
