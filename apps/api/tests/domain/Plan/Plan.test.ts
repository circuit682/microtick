import { describe, expect, it } from "vitest";

import { Money, Plan } from "@domain";
import { ValidationError } from "@shared";

describe("Plan", () => {
  describe("Construction", () => {
    it("creates a valid plan", () => {
      // Given
      const plan = new Plan({
        id: "starter-30",
        name: "Starter",
        price: Money.fromKES(500),
        duration: 30,
        active: true,
      });

      // Then
      expect(plan.name).toBe("Starter");
    });

    it("should reject a plan with a zero price", () => {
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

    it("should reject a plan with an empty name", () => {
      expect(() => {
        new Plan({
          id: "starter-30",
          name: "",
          price: Money.fromKES(500),
          duration: 30,
          active: true,
        });
      }).toThrow(ValidationError);
    });

    it("should reject a plan with a blank name", () => {
      expect(() => {
        new Plan({
          id: "starter-30",
          name: "     ",
          price: Money.fromKES(500),
          duration: 30,
          active: true,
        });
      }).toThrow(ValidationError);
    });

    it("should reject a plan with a duration less than or equal to zero", () => {
      expect(() => {
        new Plan({
          id: "starter-30",
          name: "Starter",
          price: Money.fromKES(500),
          duration: 0,
          active: true,
        });
      }).toThrow(ValidationError);
    });
  });
});
