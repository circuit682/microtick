import { describe, expect, it } from "vitest";

import { GrantInternetAccess } from "@application/access/GrantInternetAccess.js";

import {
  AccessMethod,
  ConsumptionPolicy,
  Money,
  Plan,
  ServiceLevel,
  Validity,
  ValidityUnit,
} from "@domain";

import { UlidIdentifierGenerator } from "@infrastructure/identity/UlidIdentifierGenerator.js";
import { MemoryInternetAccessRepository } from "@infrastructure/access/MemoryInternetAccessRepository.js";

describe("GrantInternetAccess", () => {
  it("grants access for a continuous plan", async () => {
    const repository = new MemoryInternetAccessRepository();

    const identifierGenerator = new UlidIdentifierGenerator();

    const grantInternetAccess = new GrantInternetAccess(
      repository,
      identifierGenerator,
    );

    const plan = Plan.create({
      id: "daily",
      name: "Daily",
      price: Money.fromMinorUnits(5000),

      validity: Validity.create({
        amount: 1,
        unit: ValidityUnit.DAYS,
      }),

      consumptionPolicy: ConsumptionPolicy.CONTINUOUS,

      serviceLevel: ServiceLevel.create({
        name: "Residential",
      }),

      accessMethod: AccessMethod.WALL_CLOCK,
    });

    const grantedAt = new Date("2026-08-01T10:00:00Z");

    const access = await grantInternetAccess.execute({
      purchaseId: "purchase-001",
      customerId: "customer-001",
      plan,
      grantedAt,
    });

    expect(access.id).toBeDefined();
    expect(access.purchaseId).toBe("purchase-001");
    expect(access.customerId).toBe("customer-001");
    expect(access.grantedAt).toEqual(grantedAt);

    expect(access.expiresAt).toEqual(new Date("2026-08-02T10:00:00Z"));

    const stored = await repository.findByPurchaseId("purchase-001");

    expect(stored).not.toBeNull();
    expect(stored?.id).toBe(access.id);
  });
});
