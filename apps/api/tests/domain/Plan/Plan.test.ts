import { describe, expect, it } from "vitest";

import { Money, Plan, PlanType } from "@domain";
import { ValidationError } from "@shared";

describe("Plan", () => {
  describe("Creation", () => {
    it("creates a valid usage plan", () => {
      // Given
      const plan = Plan.create({
        id: "quiky-30",
        name: "Quiky",
        price: Money.fromMinorUnits(500),
        type: PlanType.USAGE,
        allowanceMinutes: 30,
      });

      // Then
      expect(plan.id).toBe("quiky-30");
      expect(plan.name).toBe("Quiky");
      expect(plan.price).toEqual(
        Money.fromMinorUnits(500),
      );
      expect(plan.type).toBe(PlanType.USAGE);
      expect(plan.allowanceMinutes).toBe(30);
      expect(plan.active).toBe(true);
    });

    it("creates a valid time plan", () => {
      const plan = Plan.create({
        id: "daily",
        name: "Daily",
        price: Money.fromMinorUnits(5000),
        type: PlanType.TIME,
        allowanceMinutes: 1440,
      });

      expect(plan.type).toBe(PlanType.TIME);
      expect(plan.allowanceMinutes).toBe(1440);
    });

    it("should reject a plan with a zero price", () => {
      expect(() => {
        Plan.create({
          id: "starter-30",
          name: "Starter",
          price: Money.fromMinorUnits(0),
          type: PlanType.USAGE,
          allowanceMinutes: 30,
        });
      }).toThrow(ValidationError);
    });

    it("should reject a plan with an empty name", () => {
      expect(() => {
        Plan.create({
          id: "starter-30",
          name: "",
          price: Money.fromMinorUnits(500),
          type: PlanType.USAGE,
          allowanceMinutes: 30,
        });
      }).toThrow(ValidationError);
    });

    it("should reject a plan with a blank name", () => {
      expect(() => {
        Plan.create({
          id: "starter-30",
          name: "     ",
          price: Money.fromMinorUnits(500),
          type: PlanType.USAGE,
          allowanceMinutes: 30,
        });
      }).toThrow(ValidationError);
    });

    it("should reject a plan with a non-positive allowance", () => {
      expect(() => {
        Plan.create({
          id: "starter-30",
          name: "Starter",
          price: Money.fromMinorUnits(500),
          type: PlanType.USAGE,
          allowanceMinutes: 0,
        });
      }).toThrow(ValidationError);
    });
  });

  describe("Reconstitution", () => {
    it("reconstitutes an existing active plan", () => {
      const plan = Plan.reconstitute({
        id: "quiky-30",
        name: "Quiky",
        price: Money.fromMinorUnits(500),
        type: PlanType.USAGE,
        allowanceMinutes: 30,
        active: true,
      });

      expect(plan.active).toBe(true);
      expect(plan.type).toBe(PlanType.USAGE);
    });

    it("reconstitutes an existing inactive plan", () => {
      const plan = Plan.reconstitute({
        id: "daily",
        name: "Daily",
        price: Money.fromMinorUnits(5000),
        type: PlanType.TIME,
        allowanceMinutes: 1440,
        active: false,
      });

      expect(plan.active).toBe(false);
      expect(plan.type).toBe(PlanType.TIME);
    });
  });

  describe("Lifecycle", () => {
    it("deactivates an active plan", () => {
      const plan = Plan.create({
        id: "quiky-30",
        name: "Quiky",
        price: Money.fromMinorUnits(500),
        type: PlanType.USAGE,
        allowanceMinutes: 30,
      });

      const inactivePlan = plan.deactivate();

      expect(inactivePlan.active).toBe(false);
      expect(plan.active).toBe(true);
      expect(inactivePlan).not.toBe(plan);
    });

    it("activates an inactive plan", () => {
      const inactivePlan = Plan.reconstitute({
        id: "quiky-30",
        name: "Quiky",
        price: Money.fromMinorUnits(500),
        type: PlanType.USAGE,
        allowanceMinutes: 30,
        active: false,
      });

      const activePlan = inactivePlan.activate();

      expect(activePlan.active).toBe(true);
      expect(inactivePlan.active).toBe(false);
      expect(activePlan).not.toBe(inactivePlan);
    });

    it("returns the same instance when activating an already active plan", () => {
      const plan = Plan.create({
        id: "quiky-30",
        name: "Quiky",
        price: Money.fromMinorUnits(500),
        type: PlanType.USAGE,
        allowanceMinutes: 30,
      });

      expect(plan.activate()).toBe(plan);
    });

    it("returns the same instance when deactivating an already inactive plan", () => {
      const plan = Plan.reconstitute({
        id: "quiky-30",
        name: "Quiky",
        price: Money.fromMinorUnits(500),
        type: PlanType.USAGE,
        allowanceMinutes: 30,
        active: false,
      });

      expect(plan.deactivate()).toBe(plan);
    });
  });
});