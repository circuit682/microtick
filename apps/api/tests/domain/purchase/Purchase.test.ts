import { describe, expect, it } from "vitest";

import { Money, PlanType, Purchase } from "@domain";

import { ErrorCode, ValidationError } from "@shared";

import { expectValidationError } from "../../helpers/expectValidationError.js";

describe("Purchase", () => {
  it("creates a purchase from a plan snapshot", () => {
    const purchasedAt = new Date("2026-01-01T10:00:00Z");

    const purchase = Purchase.create({
      paymentIntentId: "payment-intent-1",
      id: "purchase-001",
      customerId: "customer-001",
      planId: "quiky",
      planName: "Quiky",
      planPrice: Money.fromMinorUnits(500),
      planType: PlanType.USAGE,
      allowanceMinutes: 30,
      purchasedAt,
    });

    expect(purchase.id).toBe("purchase-001");
    expect(purchase.customerId).toBe("customer-001");
    expect(purchase.planId).toBe("quiky");
    expect(purchase.planName).toBe("Quiky");
    expect(purchase.planPrice.equals(Money.fromMinorUnits(500))).toBe(true);
    expect(purchase.planType).toBe(PlanType.USAGE);
    expect(purchase.allowanceMinutes).toBe(30);
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
          planType: PlanType.USAGE,
          allowanceMinutes: 30,
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
          planType: PlanType.USAGE,
          allowanceMinutes: 30,
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
          planType: PlanType.USAGE,
          allowanceMinutes: 30,
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
          planType: PlanType.USAGE,
          allowanceMinutes: 30,
          purchasedAt: new Date(),
        }),
      ErrorCode.PURCHASE_INVALID_PRICE,
    );
  });

  it("rejects a non-positive allowance", () => {
    expectValidationError(
      () =>
        Purchase.create({
          paymentIntentId: "payment-intent-1",
          id: "purchase-001",
          customerId: "customer-001",
          planId: "quiky",
          planName: "Quiky",
          planPrice: Money.fromMinorUnits(500),
          planType: PlanType.USAGE,
          allowanceMinutes: 0,
          purchasedAt: new Date(),
        }),
      ErrorCode.PURCHASE_INVALID_ALLOWANCE,
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
      planType: PlanType.TIME,
      allowanceMinutes: 1440,
      purchasedAt,
    });

    expect(purchase.planType).toBe(PlanType.TIME);
    expect(purchase.allowanceMinutes).toBe(1440);
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
      planType: PlanType.USAGE,
      allowanceMinutes: 30,
      purchasedAt: new Date("2026-01-01T10:00:00Z"),
    });

    expect(purchase.planId).toBe("quiky");
    expect(purchase.planName).toBe("Quiky");
    expect(purchase.planPrice.equals(Money.fromMinorUnits(500))).toBe(true);
    expect(purchase.planType).toBe(PlanType.USAGE);
    expect(purchase.allowanceMinutes).toBe(30);
  });
});
