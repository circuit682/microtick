import { describe, expect, it } from "vitest";

import { GrantInternetAccess } from "@application/access/GrantInternetAccess.js";

import {
  AccessMethod,
  ConsumptionPolicy,
  Money,
  Plan,
  PlanType,
  ServiceLevel,
  Validity,
  ValidityUnit,
} from "@domain";

import { MemoryInternetAccessRepository } from "@infrastructure/access/MemoryInternetAccessRepository.js";
import { UlidIdentifierGenerator } from "@infrastructure/identity/index.js";

describe("GrantInternetAccess", () => {
  function createDailyPlan(): Plan {
    return Plan.create({
      id: "daily",
      name: "Daily",
      price: Money.fromMinorUnits(500),

      validity: Validity.create({
        amount: 1,
        unit: ValidityUnit.DAYS,
      }),

      consumptionPolicy: ConsumptionPolicy.CONTINUOUS,

      serviceLevel: ServiceLevel.create({
        name: "Residential",
      }),

      accessMethod: AccessMethod.WALL_CLOCK,

      // Compatibility fields.
      type: PlanType.TIME,
      allowanceMinutes: 30,
    });
  }

  it("grants internet access using the plan validity", async () => {
    const repository = new MemoryInternetAccessRepository();

    const identifierGenerator = new UlidIdentifierGenerator();

    const grantInternetAccess = new GrantInternetAccess(
      repository,
      identifierGenerator,
    );

    const grantedAt = new Date("2026-01-01T10:00:00Z");

    const access = await grantInternetAccess.execute({
      purchaseId: "purchase-001",
      customerId: "customer-001",
      plan: createDailyPlan(),
      grantedAt,
    });

    expect(access.grantedAt).toEqual(grantedAt);

    expect(access.expiresAt).toEqual(new Date("2026-01-02T10:00:00Z"));

    const persisted = await repository.findByPurchaseId("purchase-001");

    expect(persisted).not.toBeNull();
    expect(persisted?.id).toBe(access.id);
  });
});
