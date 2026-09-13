import { describe, expect, it } from "vitest";

import { GetCustomerPurchases } from "@application/customer/GetCustomerPurchases.js";
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

function createPurchase(id: string, purchasedAt: string): Purchase {
  return Purchase.create({
    id,
    paymentIntentId: `payment-${id}`,
    customerId: "customer-001",
    networkIdentityId: `identity-${id}`,
    planId: `plan-${id}`,
    planName: `Plan ${id}`,
    planPrice: Money.fromMinorUnits(100),
    validity: Validity.create({ amount: 60, unit: ValidityUnit.MINUTES }),
    consumptionPolicy: ConsumptionPolicy.USAGE,
    serviceLevel: ServiceLevel.create({ name: "Standard" }),
    accessMethod: AccessMethod.SESSION,
    purchasedAt: new Date(purchasedAt),
  });
}

describe("GetCustomerPurchases", () => {
  it("returns the customer's purchases in repository order", async () => {
    const purchases = [
      createPurchase("purchase-002", "2026-09-14T11:00:00Z"),
      createPurchase("purchase-001", "2026-09-14T10:00:00Z"),
    ];
    const repository: PurchaseRepository = {
      save: async () => {},
      findById: async () => null,
      findByPaymentIntentId: async () => null,
      findByCustomerId: async () => purchases,
      findByNetworkIdentityId: async () => null,
    };

    const result = await new GetCustomerPurchases(repository).execute({
      customerId: "customer-001",
    });

    expect(result).toEqual(purchases);
  });

  it("returns an empty list when the customer has no purchases", async () => {
    const repository: PurchaseRepository = {
      save: async () => {},
      findById: async () => null,
      findByPaymentIntentId: async () => null,
      findByCustomerId: async () => [],
      findByNetworkIdentityId: async () => null,
    };

    await expect(
      new GetCustomerPurchases(repository).execute({
        customerId: "customer-001",
      }),
    ).resolves.toEqual([]);
  });
});
