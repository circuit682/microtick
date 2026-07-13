import { describe, expect, it } from "vitest";
import { Plan } from "@domain";

describe("Plan", () => {
  it("creates a valid plan", () => {
    const plan = new Plan({
      id: "starter-30",
      name: "Starter",
      price: 5,
      duration: 30,
      active: true,
    });

    expect(plan.name).toBe("Starter");
  });
});