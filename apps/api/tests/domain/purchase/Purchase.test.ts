import { describe, it } from "vitest";

import {
  AccessMethod,
  Money,
  Purchase,
  ServiceLevel,
  Validity,
  ValidityUnit,
} from "@domain";

import { ErrorCode } from "@shared";

import { expectValidationError } from "../../helpers/expectValidationError.js";

describe("Purchase", () => {
  function createValidity(): Validity {
    return Validity.create({
      amount: 30,
      unit: ValidityUnit.MINUTES,
    });
  }

  function createServiceLevel(): ServiceLevel {
    return ServiceLevel.create({
      name: "Residential",
    });
  }

  it("creates a purchase from a plan snapshot", () => {
    const purchasedAt = new Date("2026-01-01T10:00:00Z");

    const purchase = Purchase.create({
      paymentIntentId: "payment-intent-1",
      id: "purchase-001",
      customerId: "customer-001",

      planId: "quiky",
      planName: "Quiky",
      planPrice: Money.fromMinorUnits(500),

      validity: createValidity(),
      serviceLevel: createServiceLevel(),
      accessMethod: AccessMethod.SESSION,

      purchasedAt,
    });

    expect(purchase.id).toBe("purchase-001");
    expect(purchase.customerId).toBe("customer-001");

    expect(purchase.planId).toBe("quiky");
    expect(purchase.planName).toBe("Quiky");
    expect(purchase.planPrice.equals(Money.fromMinorUnits(500))).toBe(true);

    expect(purchase.validity.equals(createValidity())).toBe(true);

    expect(purchase.serviceLevel.equals(createServiceLevel())).toBe(true);

    expect(purchase.accessMethod).toBe(AccessMethod.SESSION);

    expect(purchase.purchasedAt).toEqual(purchasedAt);
  });

  it("rejects an empty customer ID", () => {
    expectValidationError(
      () =>
        Purchase.create({
          paymentIntentId: "payment-intent-1",
          id: "purchase-001",
          customerId: "",

          planId: "quiky",
          planName: "Quiky",
          planPrice: Money.fromMinorUnits(500),

          validity: createValidity(),
          serviceLevel: createServiceLevel(),
          accessMethod: AccessMethod.SESSION,

          purchasedAt: new Date(),
        }),
      ErrorCode.PURCHASE_INVALID_CUSTOMER,
    );
  });

  it("rejects an empty plan ID", () => {
    expectValidationError(
      () =>
        Purchase.create({
          paymentIntentId: "payment-intent-1",
          id: "purchase-001",
          customerId: "customer-001",

          planId: "",
          planName: "Quiky",
          planPrice: Money.fromMinorUnits(500),

          validity: createValidity(),
          serviceLevel: createServiceLevel(),
          accessMethod: AccessMethod.SESSION,

          purchasedAt: new Date(),
        }),
      ErrorCode.PURCHASE_INVALID_PLAN,
    );
  });

  it("rejects an empty plan name", () => {
    expectValidationError(
      () =>
        Purchase.create({
          paymentIntentId: "payment-intent-1",
          id: "purchase-001",
          customerId: "customer-001",

          planId: "quiky",
          planName: "",
          planPrice: Money.fromMinorUnits(500),

          validity: createValidity(),
          serviceLevel: createServiceLevel(),
          accessMethod: AccessMethod.SESSION,

          purchasedAt: new Date(),
        }),
      ErrorCode.PURCHASE_INVALID_PLAN,
    );
  });

  it("rejects a zero price", () => {
    expectValidationError(
      () =>
        Purchase.create({
          paymentIntentId: "payment-intent-1",
          id: "purchase-001",
          customerId: "customer-001",

          planId: "quiky",
          planName: "Quiky",
          planPrice: Money.fromMinorUnits(0),

          validity: createValidity(),
          serviceLevel: createServiceLevel(),
          accessMethod: AccessMethod.SESSION,

          purchasedAt: new Date(),
        }),
      ErrorCode.PURCHASE_INVALID_PRICE,
    );
  });

  it("reconstitutes an existing purchase", () => {
    const purchasedAt = new Date("2026-01-01T10:00:00Z");

    const purchase = Purchase.reconstitute({
      paymentIntentId: "payment-intent-1",
      id: "purchase-001",
      customerId: "customer-001",

      planId: "daily",
      planName: "Daily",
      planPrice: Money.fromMinorUnits(5000),

      validity: Validity.create({
        amount: 1,
        unit: ValidityUnit.DAYS,
      }),

      serviceLevel: createServiceLevel(),

      accessMethod: AccessMethod.WALL_CLOCK,

      purchasedAt,
    });

    expect(
      purchase.validity.equals(
        Validity.create({
          amount: 1,
          unit: ValidityUnit.DAYS,
        }),
      ),
    ).toBe(true);

    expect(purchase.accessMethod).toBe(AccessMethod.WALL_CLOCK);

    expect(purchase.purchasedAt).toEqual(purchasedAt);
  });

  it("captures the purchased plan as an immutable snapshot", () => {
    const purchase = Purchase.create({
      paymentIntentId: "payment-intent-1",
      id: "purchase-001",
      customerId: "customer-001",

      planId: "quiky",
      planName: "Quiky",
      planPrice: Money.fromMinorUnits(500),

      validity: createValidity(),
      serviceLevel: createServiceLevel(),
      accessMethod: AccessMethod.SESSION,

      purchasedAt: new Date("2026-01-01T10:00:00Z"),
    });

    expect(purchase.planId).toBe("quiky");
    expect(purchase.planName).toBe("Quiky");

    expect(purchase.planPrice.equals(Money.fromMinorUnits(500))).toBe(true);

    expect(purchase.validity.equals(createValidity())).toBe(true);

    expect(purchase.serviceLevel.equals(createServiceLevel())).toBe(true);

    expect(purchase.accessMethod).toBe(AccessMethod.SESSION);
  });
});
