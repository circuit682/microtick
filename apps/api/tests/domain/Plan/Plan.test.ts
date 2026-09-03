import { describe, expect, it } from "vitest";

import {
  AccessMethod,
  ConsumptionPolicy,
  Money,
  Plan,
  ServiceLevel,
  Validity,
  ValidityUnit,
} from "@domain";

import { ValidationError } from "@shared";

describe("Plan", () => {
  function validity(amount: number, unit: ValidityUnit): Validity {
    return Validity.create({
      amount,
      unit,
    });
  }

  function residentialService(): ServiceLevel {
    return ServiceLevel.create({
      name: "Residential",
    });
  }

  function createPlan(
    validityValue: Validity,
    consumptionPolicy: ConsumptionPolicy,
    accessMethod: AccessMethod,
  ): Plan {
    return Plan.create({
      id: "test-plan",
      name: "Test Plan",
      price: Money.fromMinorUnits(500),
      validity: validityValue,
      consumptionPolicy,
      serviceLevel: residentialService(),
      accessMethod,
    });
  }

  describe("Creation", () => {
    it("creates a valid usage plan", () => {
      const plan = Plan.create({
        id: "quiky-30",
        name: "Quiky",
        price: Money.fromMinorUnits(500),

        validity: validity(30, ValidityUnit.MINUTES),

        consumptionPolicy: ConsumptionPolicy.USAGE,

        serviceLevel: residentialService(),

        accessMethod: AccessMethod.SESSION,
      });

      expect(plan.id).toBe("quiky-30");
      expect(plan.name).toBe("Quiky");
      expect(plan.price).toEqual(Money.fromMinorUnits(500));

      expect(plan.validity.equals(validity(30, ValidityUnit.MINUTES))).toBe(
        true,
      );

      expect(plan.consumptionPolicy).toBe(ConsumptionPolicy.USAGE);

      expect(plan.serviceLevel.equals(residentialService())).toBe(true);

      expect(plan.accessMethod).toBe(AccessMethod.SESSION);

      expect(plan.active).toBe(true);
    });

    it("creates a valid continuous plan", () => {
      const plan = Plan.create({
        id: "daily",
        name: "Daily",
        price: Money.fromMinorUnits(5000),

        validity: validity(24, ValidityUnit.HOURS),

        consumptionPolicy: ConsumptionPolicy.CONTINUOUS,

        serviceLevel: residentialService(),

        accessMethod: AccessMethod.WALL_CLOCK,
      });

      expect(plan.id).toBe("daily");
      expect(plan.name).toBe("Daily");
      expect(plan.price).toEqual(Money.fromMinorUnits(5000));

      expect(plan.validity.equals(validity(24, ValidityUnit.HOURS))).toBe(true);

      expect(plan.consumptionPolicy).toBe(ConsumptionPolicy.CONTINUOUS);

      expect(plan.serviceLevel.equals(residentialService())).toBe(true);

      expect(plan.accessMethod).toBe(AccessMethod.WALL_CLOCK);

      expect(plan.active).toBe(true);
    });

    it("rejects a plan with a zero price", () => {
      expect(() => {
        Plan.create({
          id: "quiky-30",
          name: "Quiky",
          price: Money.fromMinorUnits(0),

          validity: validity(30, ValidityUnit.MINUTES),

          consumptionPolicy: ConsumptionPolicy.USAGE,

          serviceLevel: residentialService(),

          accessMethod: AccessMethod.SESSION,
        });
      }).toThrow(ValidationError);
    });

    it("rejects a plan with an empty name", () => {
      expect(() => {
        Plan.create({
          id: "quiky-30",
          name: "",
          price: Money.fromMinorUnits(500),

          validity: validity(30, ValidityUnit.MINUTES),

          consumptionPolicy: ConsumptionPolicy.USAGE,

          serviceLevel: residentialService(),

          accessMethod: AccessMethod.SESSION,
        });
      }).toThrow(ValidationError);
    });

    it("rejects a plan with a blank name", () => {
      expect(() => {
        Plan.create({
          id: "quiky-30",
          name: "     ",
          price: Money.fromMinorUnits(500),

          validity: validity(30, ValidityUnit.MINUTES),

          consumptionPolicy: ConsumptionPolicy.USAGE,

          serviceLevel: residentialService(),

          accessMethod: AccessMethod.SESSION,
        });
      }).toThrow(ValidationError);
    });
  });

  describe("Consumption model boundaries", () => {
    it("allows exactly 60 minutes as a usage/session plan", () => {
      const plan = createPlan(
        validity(60, ValidityUnit.MINUTES),
        ConsumptionPolicy.USAGE,
        AccessMethod.SESSION,
      );

      expect(plan.validity.equals(validity(60, ValidityUnit.MINUTES))).toBe(
        true,
      );
      expect(plan.consumptionPolicy).toBe(ConsumptionPolicy.USAGE);
      expect(plan.accessMethod).toBe(AccessMethod.SESSION);
    });

    it("rejects 61 minutes because it falls between the supported consumption models", () => {
      expect(() =>
        createPlan(
          validity(61, ValidityUnit.MINUTES),
          ConsumptionPolicy.USAGE,
          AccessMethod.SESSION,
        ),
      ).toThrow(ValidationError);
    });

    it("rejects 119 minutes because it falls between the supported consumption models", () => {
      expect(() =>
        createPlan(
          validity(119, ValidityUnit.MINUTES),
          ConsumptionPolicy.CONTINUOUS,
          AccessMethod.WALL_CLOCK,
        ),
      ).toThrow(ValidationError);
    });

    it("allows exactly 120 minutes as a continuous/wall-clock plan", () => {
      const plan = createPlan(
        validity(120, ValidityUnit.MINUTES),
        ConsumptionPolicy.CONTINUOUS,
        AccessMethod.WALL_CLOCK,
      );

      expect(plan.validity.equals(validity(120, ValidityUnit.MINUTES))).toBe(
        true,
      );
      expect(plan.consumptionPolicy).toBe(ConsumptionPolicy.CONTINUOUS);
      expect(plan.accessMethod).toBe(AccessMethod.WALL_CLOCK);
    });

    it("rejects a short plan configured as continuous/wall-clock", () => {
      expect(() =>
        createPlan(
          validity(60, ValidityUnit.MINUTES),
          ConsumptionPolicy.CONTINUOUS,
          AccessMethod.WALL_CLOCK,
        ),
      ).toThrow(ValidationError);
    });

    it("rejects a long plan configured as usage/session", () => {
      expect(() =>
        createPlan(
          validity(120, ValidityUnit.MINUTES),
          ConsumptionPolicy.USAGE,
          AccessMethod.SESSION,
        ),
      ).toThrow(ValidationError);
    });
  });

  describe("Reconstitution", () => {
    it("reconstitutes an existing active plan", () => {
      const plan = Plan.reconstitute({
        id: "quiky-30",
        name: "Quiky",
        price: Money.fromMinorUnits(500),

        validity: validity(30, ValidityUnit.MINUTES),

        consumptionPolicy: ConsumptionPolicy.USAGE,

        serviceLevel: residentialService(),

        accessMethod: AccessMethod.SESSION,

        active: true,
      });

      expect(plan.active).toBe(true);

      expect(plan.validity.equals(validity(30, ValidityUnit.MINUTES))).toBe(
        true,
      );

      expect(plan.consumptionPolicy).toBe(ConsumptionPolicy.USAGE);

      expect(plan.serviceLevel.equals(residentialService())).toBe(true);

      expect(plan.accessMethod).toBe(AccessMethod.SESSION);
    });

    it("reconstitutes an existing inactive plan", () => {
      const plan = Plan.reconstitute({
        id: "daily",
        name: "Daily",
        price: Money.fromMinorUnits(5000),

        validity: validity(24, ValidityUnit.HOURS),

        consumptionPolicy: ConsumptionPolicy.CONTINUOUS,

        serviceLevel: residentialService(),

        accessMethod: AccessMethod.WALL_CLOCK,

        active: false,
      });

      expect(plan.active).toBe(false);

      expect(plan.validity.equals(validity(24, ValidityUnit.HOURS))).toBe(true);

      expect(plan.consumptionPolicy).toBe(ConsumptionPolicy.CONTINUOUS);

      expect(plan.serviceLevel.equals(residentialService())).toBe(true);

      expect(plan.accessMethod).toBe(AccessMethod.WALL_CLOCK);
    });
  });

  describe("Lifecycle", () => {
    it("deactivates an active plan", () => {
      const plan = Plan.create({
        id: "quiky-30",
        name: "Quiky",
        price: Money.fromMinorUnits(500),

        validity: validity(30, ValidityUnit.MINUTES),

        consumptionPolicy: ConsumptionPolicy.USAGE,

        serviceLevel: residentialService(),

        accessMethod: AccessMethod.SESSION,
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

        validity: validity(30, ValidityUnit.MINUTES),

        consumptionPolicy: ConsumptionPolicy.USAGE,

        serviceLevel: residentialService(),

        accessMethod: AccessMethod.SESSION,

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

        validity: validity(30, ValidityUnit.MINUTES),

        consumptionPolicy: ConsumptionPolicy.USAGE,

        serviceLevel: residentialService(),

        accessMethod: AccessMethod.SESSION,
      });

      expect(plan.activate()).toBe(plan);
    });

    it("returns the same instance when deactivating an already inactive plan", () => {
      const plan = Plan.reconstitute({
        id: "quiky-30",
        name: "Quiky",
        price: Money.fromMinorUnits(500),

        validity: validity(30, ValidityUnit.MINUTES),

        consumptionPolicy: ConsumptionPolicy.USAGE,

        serviceLevel: residentialService(),

        accessMethod: AccessMethod.SESSION,

        active: false,
      });

      expect(plan.deactivate()).toBe(plan);
    });
  });
});
