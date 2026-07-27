import { describe, expect, it } from "vitest";

import { GrantInternetAccess } from "@application/access/GrantInternetAccess.js";

import { Money, Plan, PlanType } from "@domain";

describe("GrantInternetAccess", () => {
  it("grants internet access using the purchased plan duration", () => {
    const plan = Plan.create({
      id: "daily",
      name: "Daily",
      price: Money.fromMinorUnits(500),
      type: PlanType.TIME,
      allowanceMinutes: 30,
    });

    const grantedAt = new Date("2026-01-01T10:00:00Z");

    const grantInternetAccess = new GrantInternetAccess();

    const access = grantInternetAccess.execute({
      customerId: "customer-001",
      plan,
      grantedAt,
    });

    expect(access.grantedAt).toEqual(grantedAt);

    expect(access.expiresAt).toEqual(new Date("2026-01-01T10:30:00Z"));
  });
});
