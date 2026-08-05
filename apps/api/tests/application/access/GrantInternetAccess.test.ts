import { describe, expect, it } from "vitest";

import { GrantInternetAccess } from "@application/access/GrantInternetAccess.js";

import { Money, Plan, PlanType } from "@domain";

import { UlidIdentifierGenerator } from "@infrastructure/identity/index.js";
import { MemoryInternetAccessRepository } from "@infrastructure/access/MemoryInternetAccessRepository.js";

describe("GrantInternetAccess", () => {
  it("grants internet access using the purchased plan duration", async () => {
    const repository = new MemoryInternetAccessRepository();

    const identifierGenerator = new UlidIdentifierGenerator();

    const grantInternetAccess = new GrantInternetAccess(
      repository,
      identifierGenerator,
    );

    const plan = Plan.create({
      id: "daily",
      name: "Daily",
      price: Money.fromMinorUnits(500),
      type: PlanType.TIME,
      allowanceMinutes: 30,
    });

    const grantedAt = new Date("2026-01-01T10:00:00Z");

    const access = await grantInternetAccess.execute({
      purchaseId: "purchase-001",
      customerId: "customer-001",
      plan,
      grantedAt,
    });

    expect(access.grantedAt).toEqual(grantedAt);

    expect(access.expiresAt).toEqual(new Date("2026-01-01T10:30:00Z"));

    const persisted = await repository.findByPurchaseId("purchase-001");

    expect(persisted).not.toBeNull();
    expect(persisted?.id).toBe(access.id);
  });
});
