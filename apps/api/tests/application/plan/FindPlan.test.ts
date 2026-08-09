import { describe, expect, it } from "vitest";

import { CreatePlan } from "@application/plan/CreatePlan.js";
import { FindPlan } from "@application/plan/FindPlan.js";

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

describe("FindPlan", () => {
  function residentialService(): ServiceLevel {
    return ServiceLevel.create({
      name: "Residential",
    });
  }

  it("should retrieve a previously created plan", async () => {
    // Given
    const repository = new MemoryPlanRepository();

    const identifierGenerator = new UlidIdentifierGenerator();

    const createPlan = new CreatePlan(identifierGenerator, repository);

    const findPlan = new FindPlan(repository);

    const createdPlan = await createPlan.execute({
      name: "Starter",
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

    // When
    const plan = await findPlan.execute(createdPlan.id);

    // Then
    expect(plan).toBeInstanceOf(Plan);

    expect(plan?.id).toBe(createdPlan.id);

    expect(plan?.name).toBe("Starter");

    expect(plan?.price.equals(Money.fromMinorUnits(500))).toBe(true);

    expect(
      plan?.validity.equals(
        Validity.create({
          amount: 30,
          unit: ValidityUnit.MINUTES,
        }),
      ),
    ).toBe(true);

    expect(plan?.consumptionPolicy).toBe(ConsumptionPolicy.USAGE);

    expect(plan?.serviceLevel.equals(residentialService())).toBe(true);

    expect(plan?.accessMethod).toBe(AccessMethod.SESSION);

    // Temporary compatibility.
    expect(plan?.type).toBe(PlanType.USAGE);
    expect(plan?.allowanceMinutes).toBe(30);

    expect(plan?.active).toBe(true);
  });
});
