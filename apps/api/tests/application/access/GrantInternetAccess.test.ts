import { describe, expect, it } from "vitest";

import { GrantInternetAccess } from "@application/access/GrantInternetAccess.js";


import { InternetAccess, Money, Plan } from "@domain";

describe("GrantInternetAccess", () => {
  it("grants internet access using the purchased plan duration", () => {
    const plan = new Plan({
      id: "starter-30",
      name: "Starter",
      price: Money.fromKES(500),
      duration: 30,
      active: true,
    });

    const grantedAt = new Date("2026-01-01T10:00:00Z");

    const grantInternetAccess = new GrantInternetAccess();

    const access = grantInternetAccess.execute({
      customerId: "customer-001",
      plan,
      grantedAt,
    });

    expect(access.grantedAt).toEqual(grantedAt);

    expect(access.expiresAt).toEqual(
      new Date("2026-01-01T10:30:00Z"),
    );
  });
});