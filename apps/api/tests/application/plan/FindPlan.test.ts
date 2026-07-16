import { describe, expect, it } from "vitest";

import { CreatePlan } from "@application/plan/CreatePlan.js";
import { MemoryPlanRepository } from "@infrastructure/plan/MemoryPlanRepository.js";

describe("FindPlan", () => {
  it("should retrieve a previously saved plan by its identifier", async () => {
    // Given
    const repository = new MemoryPlanRepository();

    const createPlan = new CreatePlan(repository);

    await createPlan.execute({
      id: "starter-30",
      name: "Starter",
      price: 500,
      duration: 30,
      active: true,
    });

    // When
    const plan = await repository.findById("starter-30");

    // Then
    expect(plan).not.toBeNull();
    expect(plan?.name).toBe("Starter");
  });
});