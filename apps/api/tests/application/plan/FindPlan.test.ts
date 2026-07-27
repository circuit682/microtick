import { describe, expect, it } from "vitest";

import { Money, Plan } from "@domain";

import { CreatePlan } from "@application/plan/CreatePlan.js";
import { FindPlan } from "@application/plan/FindPlan.js";

import { UlidIdentifierGenerator } from "@infrastructure/identity/index.js";
import { MemoryPlanRepository } from "@infrastructure/plan/MemoryPlanRepository.js";

describe("FindPlan", () => {
  it("should retrieve a previously created plan", async () => {
    // Given
    const repository = new MemoryPlanRepository();
    const identifierGenerator =
      new UlidIdentifierGenerator();

    const createPlan = new CreatePlan(
      identifierGenerator,
      repository,
    );

    const findPlan = new FindPlan(repository);

    const createdPlan = await createPlan.execute({
      name: "Starter",
      price: 500,
      duration: 30,
    });

    // When
    const plan = await findPlan.execute(createdPlan.id);

    // Then
    expect(plan).toBeInstanceOf(Plan);

    expect(plan?.id).toBe(createdPlan.id);
    expect(plan?.name).toBe("Starter");
    expect(
      plan?.price.equals(Money.fromMinorUnits(500)),
    ).toBe(true);
    expect(plan?.duration).toBe(30);
    expect(plan?.active).toBe(true);
  });
});