import { describe, expect, it } from "vitest";

import { RecordInternetAccessUsage } from "@application/access/RecordInternetAccessUsage.js";
import type { InternetAccessRepository } from "@application/ports/InternetAccessRepository.js";

import {
  AccessMethod,
  AuthenticationMethod,
  ConsumptionPolicy,
  InternetAccess,
  InternetAccessStatus,
  Money,
  NetworkIdentity,
  Purchase,
  ServiceLevel,
  Validity,
  ValidityUnit,
} from "@domain";

describe("RecordInternetAccessUsage", () => {
  it("records the actual connected duration against the purchase's internet access", async () => {
    const access = InternetAccess.create({
      id: "access-001",
      purchaseId: "purchase-001",
      customerId: "customer-001",
      grantedAt: new Date("2026-01-01T10:00:00Z"),
      expiresAt: new Date("2026-01-01T11:00:00Z"),
      status: InternetAccessStatus.ACTIVE,
    });

    const purchase = Purchase.create({
      id: "purchase-001",
      paymentIntentId: "payment-intent-001",
      customerId: "customer-001",
      networkIdentityId: "identity-001",
      planId: "plan-001",
      planName: "Test Plan",
      planPrice: Money.fromMinorUnits(100),
      validity: Validity.create({ amount: 60, unit: ValidityUnit.MINUTES }),
      consumptionPolicy: ConsumptionPolicy.USAGE,
      serviceLevel: ServiceLevel.create({ name: "Standard" }),
      accessMethod: AccessMethod.SESSION,
      purchasedAt: new Date("2026-01-01T09:00:00Z"),
    });

    const identity = NetworkIdentity.create({
      id: "identity-001",
      customerId: "customer-001",
      username: "mt-user-001",
      credential: "credential-001",
      authenticationMethod: AuthenticationMethod.HOTSPOT,
    });

    const savedAccesses: InternetAccess[] = [];

    const repository: InternetAccessRepository = {
      save: async (savedAccess) => {
        savedAccesses.push(savedAccess);
      },
      findByPurchaseId: async (purchaseId) => {
        if (purchaseId === access.purchaseId) {
          return access;
        }

        return null;
      },
      findByCustomerId: async () => null,
    };

    const service = new RecordInternetAccessUsage(repository);

    const connectedAt = new Date("2026-01-01T10:00:00Z");
    const disconnectedAt = new Date("2026-01-01T10:12:00Z");

    const result = await service.execute({
      purchaseId: purchase.id,
      connectedAt,
      disconnectedAt,
    });

    expect(result.consumedMinutes).toBe(12);
    expect(access.consumedMinutes).toBe(0);
    expect(savedAccesses).toHaveLength(1);
    expect(savedAccesses[0]?.purchaseId).toBe(access.purchaseId);
    expect(savedAccesses[0]?.consumedMinutes).toBe(12);
  });
});
