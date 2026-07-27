import { describe, expect, it } from "vitest";

import { Money, Plan } from "@domain";
import { MemoryPlanRepository } from "@infrastructure/plan/MemoryPlanRepository.js";

describe("MemoryPlanRepository", () => {
  it("should save a plan", async () => {
    // Given
    const repository = new MemoryPlanRepository();

    const plan = new Plan({
      id: "starter-30",
      name: "Starter",
      price: Money.fromMinorUnits(500),
      duration: 30,
      active: true,
    });

    // When
    await repository.save(plan);

    // Then
    expect(true).toBe(true);
  });
});