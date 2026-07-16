import { describe, expect, it } from "vitest";

import { Money, Plan } from "@domain";

import { CreatePlan } from "@application/plan/CreatePlan.js";
import { MemoryPlanRepository } from "@infrastructure/plan/MemoryPlanRepository.js";

describe("CreatePlan", () => {
  it("should create a valid plan", async () => {
    // Given
    const repository = new MemoryPlanRepository();

    const useCase = new CreatePlan(repository);

    // When
    const plan = await useCase.execute({
      id: "starter-30",
      name: "Starter",
      price: 500,
      duration: 30,
      active: true,
    });

    // Then
    expect(plan).toBeInstanceOf(Plan);
    expect(plan.name).toBe("Starter");
    expect(plan.price.equals(Money.fromKES(500))).toBe(true);
    expect(plan.duration).toBe(30);
    expect(plan.active).toBe(true);
  });
});