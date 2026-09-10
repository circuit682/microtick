import { describe, expect, it, vi } from "vitest";

import { RecordInternetAccessUsageFromRouterOs } from "@application/access/RecordInternetAccessUsageFromRouterOs.js";
import type { RouterOsSessionInterval } from "@application/access/RouterOsSessionInterval.js";
import type { NetworkIdentityRepository } from "@application/ports/NetworkIdentityRepository.js";
import type { PurchaseRepository } from "@application/ports/PurchaseRepository.js";
import type { RecordInternetAccessUsageUseCase } from "@application/access/RecordInternetAccessUsage.js";

import {
  AccessMethod,
  AuthenticationMethod,
  ConsumptionPolicy,
  Money,
  NetworkIdentity,
  Purchase,
  ServiceLevel,
  Validity,
  ValidityUnit,
} from "@domain";

describe("RecordInternetAccessUsageFromRouterOs", () => {
  it("records usage for a purchase whose RouterOS session interval is reported", async () => {
    const identity = NetworkIdentity.create({
      id: "identity-001",
      customerId: "customer-001",
      username: "mt-user-001",
      credential: "credential-001",
      authenticationMethod: AuthenticationMethod.HOTSPOT,
    });

    const purchase = Purchase.create({
      id: "purchase-001",
      paymentIntentId: "payment-intent-001",
      customerId: "customer-001",
      networkIdentityId: identity.id,
      planId: "plan-001",
      planName: "Test Plan",
      planPrice: Money.fromMinorUnits(100),
      validity: Validity.create({ amount: 60, unit: ValidityUnit.MINUTES }),
      consumptionPolicy: ConsumptionPolicy.USAGE,
      serviceLevel: ServiceLevel.create({ name: "Standard" }),
      accessMethod: AccessMethod.SESSION,
      purchasedAt: new Date("2026-01-01T09:00:00Z"),
    });

    const interval: RouterOsSessionInterval = {
      sessionId: "router-session-001",
      username: identity.username,
      connectedAt: new Date("2026-01-01T10:00:00Z"),
      disconnectedAt: new Date("2026-01-01T10:12:00Z"),
    };

    const networkIdentityRepository: NetworkIdentityRepository = {
      save: async () => {},
      findById: async () => identity,
      findByUsername: async (username) =>
        username === identity.username ? identity : null,
      findByCustomerId: async () => [identity],
    };

    const purchaseRepository: PurchaseRepository = {
      save: async () => {},
      findById: async () => purchase,
      findByPaymentIntentId: async () => null,
      findByCustomerId: async () => [purchase],
      findByNetworkIdentityId: async (networkIdentityId) =>
        networkIdentityId === identity.id ? purchase : null,
    };

    const execute = vi.fn(
      async (_command: {
        purchaseId: string;
        allowanceMinutes: number;
        connectedAt: Date;
        disconnectedAt: Date;
      }) => ({
        purchaseId: purchase.id,
        consumedMinutes: 12,
      }),
    );

    const recordInternetAccessUsage = {
      execute,
    } as unknown as RecordInternetAccessUsageUseCase;

    const service = new RecordInternetAccessUsageFromRouterOs(
      networkIdentityRepository,
      purchaseRepository,
      recordInternetAccessUsage,
    );

    await service.execute([interval]);

    expect(execute).toHaveBeenCalledWith({
      purchaseId: purchase.id,
      allowanceMinutes: purchase.validity.toMinutes(),
      sessionId: interval.sessionId,
      connectedAt: interval.connectedAt,
      disconnectedAt: interval.disconnectedAt,
    });
  });
});
