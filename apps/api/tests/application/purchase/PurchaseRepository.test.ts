import { describe, expect, it } from "vitest";

import type { PurchaseRepository } from "@application/ports/PurchaseRepository.js";

import {
  AccessMethod,
  ConsumptionPolicy,
  Money,
  Purchase,
  ServiceLevel,
  Validity,
  ValidityUnit,
} from "@domain";

describe("PurchaseRepository", () => {
  it("finds a purchase by its network identity id", async () => {
    const purchase = Purchase.create({
      id: "purchase-001",
      paymentIntentId: "payment-intent-001",
      customerId: "customer-001",
      networkIdentityId: "identity-001",
      planId: "plan-001",
      planName: "Test Plan",
      planPrice: Money.fromMinorUnits(100),
      validity: Validity.create({
        amount: 60,
        unit: ValidityUnit.MINUTES,
      }),
      consumptionPolicy: ConsumptionPolicy.CONTINUOUS,
      serviceLevel: ServiceLevel.create({
        name: "Standard",
      }),
      accessMethod: AccessMethod.WALL_CLOCK,
      purchasedAt: new Date("2026-09-03T10:00:00Z"),
    });

    const repository: PurchaseRepository = {
      save: async () => {},

      findById: async () => null,

      findByPaymentIntentId: async () => null,

      findByCustomerId: async () => [],

      findByNetworkIdentityId: async (networkIdentityId) => {
        if (networkIdentityId === purchase.networkIdentityId) {
          return purchase;
        }

        return null;
      },
    };

    const result = await repository.findByNetworkIdentityId("identity-001");

    expect(result).not.toBeNull();
    expect(result?.id).toBe(purchase.id);
    expect(result?.networkIdentityId).toBe("identity-001");
  });
});
