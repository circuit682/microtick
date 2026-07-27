import { describe, expect, it } from "vitest";

import { Money, Plan } from "@domain";
import { ValidationError } from "@shared";

describe("Plan", () => {
  describe("Creation", () => {
    it("creates a valid plan", () => {
      // Given
      const plan = Plan.create({
        id: "starter-30",
        name: "Starter",
        price: Money.fromMinorUnits(500),
        duration: 30,
      });

      // Then
      expect(plan.id).toBe("starter-30");
      expect(plan.name).toBe("Starter");
      expect(plan.price).toEqual(Money.fromMinorUnits(500));
      expect(plan.duration).toBe(30);
      expect(plan.active).toBe(true);
    });

    it("should reject a plan with a zero price", () => {
      expect(() => {
        Plan.create({
          id: "starter-30",
          name: "Starter",
          price: Money.fromMinorUnits(0),
          duration: 30,
        });
      }).toThrow(ValidationError);
    });

    it("should reject a plan with an empty name", () => {
      expect(() => {
        Plan.create({
          id: "starter-30",
          name: "",
          price: Money.fromMinorUnits(500),
          duration: 30,
        });
      }).toThrow(ValidationError);
    });

    it("should reject a plan with a blank name", () => {
      expect(() => {
        Plan.create({
          id: "starter-30",
          name: "     ",
          price: Money.fromMinorUnits(500),
          duration: 30,
        });
      }).toThrow(ValidationError);
    });

    it("should reject a plan with a duration less than or equal to zero", () => {
      expect(() => {
        Plan.create({
          id: "starter-30",
          name: "Starter",
          price: Money.fromMinorUnits(500),
          duration: 0,
        });
      }).toThrow(ValidationError);
    });
  });

  describe("Reconstitution", () => {
    it("reconstitutes an existing active plan", () => {
      const plan = Plan.reconstitute({
        id: "starter-30",
        name: "Starter",
        price: Money.fromMinorUnits(500),
        duration: 30,
        active: true,
      });

      expect(plan.active).toBe(true);
    });

    it("reconstitutes an existing inactive plan", () => {
      const plan = Plan.reconstitute({
        id: "starter-30",
        name: "Starter",
        price: Money.fromMinorUnits(500),
        duration: 30,
        active: false,
      });

      expect(plan.active).toBe(false);
    });
  });

  describe("Lifecycle", () => {
    it("deactivates an active plan", () => {
      const plan = Plan.create({
        id: "starter-30",
        name: "Starter",
        price: Money.fromMinorUnits(500),
        duration: 30,
      });

      const inactivePlan = plan.deactivate();

      expect(inactivePlan.active).toBe(false);
      expect(plan.active).toBe(true);
      expect(inactivePlan).not.toBe(plan);
    });

    it("activates an inactive plan", () => {
      const inactivePlan = Plan.reconstitute({
        id: "starter-30",
        name: "Starter",
        price: Money.fromMinorUnits(500),
        duration: 30,
        active: false,
      });

      const activePlan = inactivePlan.activate();

      expect(activePlan.active).toBe(true);
      expect(inactivePlan.active).toBe(false);
      expect(activePlan).not.toBe(inactivePlan);
    });

    it("returns the same instance when activating an already active plan", () => {
      const plan = Plan.create({
        id: "starter-30",
        name: "Starter",
        price: Money.fromMinorUnits(500),
        duration: 30,
      });

      const result = plan.activate();

      expect(result).toBe(plan);
    });

    it("returns the same instance when deactivating an already inactive plan", () => {
      const plan = Plan.reconstitute({
        id: "starter-30",
        name: "Starter",
        price: Money.fromMinorUnits(500),
        duration: 30,
        active: false,
      });

      const result = plan.deactivate();

      expect(result).toBe(plan);
    });
  });
});
