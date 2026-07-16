import { describe, expect, it } from "vitest";

import { Money, Plan } from "@domain";

import { CreatePlan } from "@application/plan/CreatePlan.js";
import { FindPlan } from "@application/plan/FindPlan.js";

import { MemoryPlanRepository } from "@infrastructure/plan/MemoryPlanRepository.js";

describe("FindPlan", () => {
  it("should retrieve a previously created plan", async () => {
    // Given
    const repository = new MemoryPlanRepository();

    const createPlan = new CreatePlan(repository);
    const findPlan = new FindPlan(repository);

    await createPlan.execute({
      id: "starter-30",
      name: "Starter",
      price: 500,
      duration: 30,
      active: true,
    });

    // When
    const plan = await findPlan.execute("starter-30");

    // Then
    expect(plan).toBeInstanceOf(Plan);
    expect(plan?.name).toBe("Starter");
    expect(plan?.price.equals(Money.fromKES(500))).toBe(true);
    expect(plan?.duration).toBe(30);
    expect(plan?.active).toBe(true);
  });
});