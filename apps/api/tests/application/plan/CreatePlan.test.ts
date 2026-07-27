import { describe, expect, it } from "vitest";

import { Money, Plan } from "@domain";

import { CreatePlan } from "@application/plan/CreatePlan.js";
import { MemoryPlanRepository } from "@infrastructure/plan/MemoryPlanRepository.js";
import { UlidIdentifierGenerator } from "@infrastructure/identity/index.js";

describe("CreatePlan", () => {
  it("should create a valid plan", async () => {
    // Given
    const repository = new MemoryPlanRepository();
    const identifierGenerator = new UlidIdentifierGenerator();
    const createPlan = new CreatePlan(identifierGenerator, repository);

    // When
    const plan = await createPlan.execute({
      name: "Starter",
      price: 500,
      duration: 30,
    });

    // Then
    expect(plan).toBeInstanceOf(Plan);
    expect(plan.id).toBeDefined();
    expect(plan.id.length).toBeGreaterThan(0);
    expect(plan.name).toBe("Starter");
    expect(plan.price.equals(Money.fromMinorUnits(500))).toBe(true);
    expect(plan.duration).toBe(30);
    expect(plan.active).toBe(true);
  });
});
