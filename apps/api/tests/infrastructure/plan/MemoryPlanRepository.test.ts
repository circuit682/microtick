import { describe, expect, it } from "vitest";

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

import { MemoryPlanRepository } from "@infrastructure/plan/MemoryPlanRepository.js";

describe("MemoryPlanRepository", () => {
  it("should save and retrieve a plan", async () => {
    // Given
    const repository = new MemoryPlanRepository();

    const plan = Plan.create({
      id: "starter-30",
      name: "Starter",
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

    // When
    await repository.save(plan);

    const stored = await repository.findById("starter-30");

    // Then
    expect(stored).not.toBeNull();
    expect(stored?.id).toBe(plan.id);
    expect(stored?.name).toBe(plan.name);

    expect(stored?.price.equals(plan.price)).toBe(true);

    expect(stored?.validity.equals(plan.validity)).toBe(true);

    expect(stored?.consumptionPolicy).toBe(plan.consumptionPolicy);

    expect(stored?.serviceLevel.equals(plan.serviceLevel)).toBe(true);

    expect(stored?.accessMethod).toBe(plan.accessMethod);

    expect(stored?.active).toBe(true);
  });

  it("returns null when the plan does not exist", async () => {
    // Given
    const repository = new MemoryPlanRepository();

    // When
    const stored = await repository.findById("missing-plan");

    // Then
    expect(stored).toBeNull();
  });
});
