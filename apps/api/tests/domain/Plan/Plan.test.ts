import { describe, expect, it } from "vitest";

import { Money, Plan } from "@domain";
import { ValidationError } from "@shared";

describe("Plan", () => {
  it("creates a valid plan", () => {
    const plan = new Plan({
      id: "starter-30",
      name: "Starter",
      price: Money.fromKES(500),
      duration: 30,
      active: true,
    });

    expect(plan.name).toBe("Starter");
  });

  it("rejects a plan with a zero price", () => {
    expect(() => {
      new Plan({
        id: "starter-30",
        name: "Starter",
        price: Money.fromKES(0),
        duration: 30,
        active: true,
      });
    }).toThrow(ValidationError);
  });
});