import { describe, expect, it } from "vitest";

import { Money, Plan, PlanType } from "@domain";

import { CreatePlan } from "@application/plan/CreatePlan.js";
import { MemoryPlanRepository } from "@infrastructure/plan/MemoryPlanRepository.js";
import { UlidIdentifierGenerator } from "@infrastructure/identity/index.js";

describe("CreatePlan", () => {
  it("should create a valid usage plan", async () => {
    // Given
    const repository = new MemoryPlanRepository();
    const identifierGenerator =
      new UlidIdentifierGenerator();

    const createPlan = new CreatePlan(
      identifierGenerator,
      repository,
    );

    // When
    const plan = await createPlan.execute({
      name: "Quiky",
      price: 500,
      type: PlanType.USAGE,
      allowanceMinutes: 30,
    });

    // Then
    expect(plan).toBeInstanceOf(Plan);

    expect(plan.id).toBeDefined();
    expect(plan.id.length).toBeGreaterThan(0);

    expect(plan.name).toBe("Quiky");

    expect(
      plan.price.equals(
        Money.fromMinorUnits(500),
      ),
    ).toBe(true);

    expect(plan.type).toBe(PlanType.USAGE);
    expect(plan.allowanceMinutes).toBe(30);
    expect(plan.active).toBe(true);
  });

  it("should create a valid time plan", async () => {
    // Given
    const repository = new MemoryPlanRepository();
    const identifierGenerator =
      new UlidIdentifierGenerator();

    const createPlan = new CreatePlan(
      identifierGenerator,
      repository,
    );

    // When
    const plan = await createPlan.execute({
      name: "Daily",
      price: 5000,
      type: PlanType.TIME,
      allowanceMinutes: 1440,
    });

    // Then
    expect(plan.type).toBe(PlanType.TIME);
    expect(plan.allowanceMinutes).toBe(1440);
  });
});