import { describe, expect, it } from "vitest";

import { ExpireExpiredInternetAccess } from "@application/access/ExpireExpiredInternetAccess.js";
import type { InternetAccessRepository } from "@application/ports/InternetAccessRepository.js";
import type { NetworkIdentityRepository } from "@application/ports/NetworkIdentityRepository.js";
import type { PurchaseRepository } from "@application/ports/PurchaseRepository.js";
import type { RouterOsClient } from "@application/ports/RouterOsClient.js";

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

describe("ExpireExpiredInternetAccess", () => {
  it("expires internet access whose validity window has elapsed and removes the hotspot identity", async () => {
    const access = InternetAccess.create({
      id: "access-001",
      purchaseId: "purchase-001",
      customerId: "customer-001",
      grantedAt: new Date("2026-01-01T09:00:00Z"),
      expiresAt: new Date("2026-01-01T10:00:00Z"),
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
      consumptionPolicy: ConsumptionPolicy.CONTINUOUS,
      serviceLevel: ServiceLevel.create({ name: "Standard" }),
      accessMethod: AccessMethod.WALL_CLOCK,
      purchasedAt: new Date("2026-01-01T08:00:00Z"),
    });

    const identity = NetworkIdentity.create({
      id: "identity-001",
      customerId: "customer-001",
      username: "mt-user-001",
      credential: "credential-001",
      authenticationMethod: AuthenticationMethod.HOTSPOT,
    });

    const removedUsers: string[] = [];
    const removedSessions: string[] = [];
    const savedAccesses: InternetAccess[] = [];

    const internetAccessRepository: InternetAccessRepository = {
      save: async (saved) => {
        savedAccesses.push(saved);
      },
      findByPurchaseId: async () => access,
      findByCustomerId: async () => null,
      findAll: async () => [access],
    };

    const purchaseRepository: PurchaseRepository = {
      save: async () => {},
      findById: async () => purchase,
      findByPaymentIntentId: async () => null,
      findByCustomerId: async () => [purchase],
      findByNetworkIdentityId: async () => purchase,
    };

    const networkIdentityRepository: NetworkIdentityRepository = {
      save: async () => {},
      findById: async () => identity,
      findByUsername: async () => identity,
      findByCustomerId: async () => [identity],
    };

    const routerOsClient: RouterOsClient = {
      connect: async () => {},
      getSystemIdentity: async () => [],
      createHotspotUser: async () => {},
      getHotspotUsers: async () => [],
      getActiveHotspotSessions: async () => [],
      getHotspotSessionIntervals: async () => [],
      getCompletedHotspotSessionIntervals: async () => [],
      removeHotspotUser: async (username) => {
        removedUsers.push(username);
      },
      removeActiveHotspotSession: async (username) => {
        removedSessions.push(username);
      },
      close: async () => {},
    };

    const service = new ExpireExpiredInternetAccess(
      internetAccessRepository,
      purchaseRepository,
      networkIdentityRepository,
      routerOsClient,
    );

    const result = await service.execute({
      now: new Date("2026-01-01T10:05:00Z"),
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.status).toBe(InternetAccessStatus.EXPIRED);
    expect(removedUsers).toEqual([identity.username]);
    expect(removedSessions).toEqual([identity.username]);
    expect(savedAccesses).toHaveLength(1);
    expect(savedAccesses[0]?.status).toBe(InternetAccessStatus.EXPIRED);
  });

  it("expires a usage access when consumed minutes reach the plan allowance", async () => {
    const access = InternetAccess.create({
      id: "access-002",
      purchaseId: "purchase-002",
      customerId: "customer-001",
      grantedAt: new Date("2026-01-01T09:00:00Z"),
      expiresAt: new Date("2026-01-02T09:00:00Z"),
      status: InternetAccessStatus.ACTIVE,
      consumedMinutes: 60,
    });

    const purchase = Purchase.create({
      id: "purchase-002",
      paymentIntentId: "payment-intent-002",
      customerId: "customer-001",
      networkIdentityId: "identity-002",
      planId: "plan-002",
      planName: "Usage Plan",
      planPrice: Money.fromMinorUnits(100),
      validity: Validity.create({ amount: 60, unit: ValidityUnit.MINUTES }),
      consumptionPolicy: ConsumptionPolicy.USAGE,
      serviceLevel: ServiceLevel.create({ name: "Standard" }),
      accessMethod: AccessMethod.SESSION,
      purchasedAt: new Date("2026-01-01T08:00:00Z"),
    });

    const identity = NetworkIdentity.create({
      id: "identity-002",
      customerId: "customer-001",
      username: "mt-user-002",
      credential: "credential-002",
      authenticationMethod: AuthenticationMethod.HOTSPOT,
    });

    const savedAccesses: InternetAccess[] = [];
    const internetAccessRepository: InternetAccessRepository = {
      save: async (saved) => {
        savedAccesses.push(saved);
      },
      findByPurchaseId: async () => access,
      findByCustomerId: async () => null,
      findAll: async () => [access],
    };

    const purchaseRepository: PurchaseRepository = {
      save: async () => {},
      findById: async () => purchase,
      findByPaymentIntentId: async () => null,
      findByCustomerId: async () => [purchase],
      findByNetworkIdentityId: async () => purchase,
    };

    const networkIdentityRepository: NetworkIdentityRepository = {
      save: async () => {},
      findById: async () => identity,
      findByUsername: async () => identity,
      findByCustomerId: async () => [identity],
    };

    const routerOsClient: RouterOsClient = {
      connect: async () => {},
      getSystemIdentity: async () => [],
      createHotspotUser: async () => {},
      getHotspotUsers: async () => [],
      getActiveHotspotSessions: async () => [],
      getHotspotSessionIntervals: async () => [],
      getCompletedHotspotSessionIntervals: async () => [],
      removeHotspotUser: async () => {},
      removeActiveHotspotSession: async () => {},
      close: async () => {},
    };

    const service = new ExpireExpiredInternetAccess(
      internetAccessRepository,
      purchaseRepository,
      networkIdentityRepository,
      routerOsClient,
    );

    const result = await service.execute({
      now: new Date("2026-01-01T10:00:00Z"),
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.status).toBe(InternetAccessStatus.EXPIRED);
    expect(savedAccesses[0]?.status).toBe(InternetAccessStatus.EXPIRED);
  });

  it.each([InternetAccessStatus.REVOKED, InternetAccessStatus.FAILED])(
    "does not automatically expire %s access",
    async (status) => {
      const access = InternetAccess.create({
        id: `access-${status.toLowerCase()}`,
        purchaseId: `purchase-${status.toLowerCase()}`,
        customerId: "customer-001",
        grantedAt: new Date("2026-01-01T09:00:00Z"),
        expiresAt: new Date("2026-01-01T10:00:00Z"),
        status,
      });

      const purchase = Purchase.create({
        id: access.purchaseId,
        paymentIntentId: `payment-${status.toLowerCase()}`,
        customerId: access.customerId,
        networkIdentityId: `identity-${status.toLowerCase()}`,
        planId: `plan-${status.toLowerCase()}`,
        planName: "Terminal Plan",
        planPrice: Money.fromMinorUnits(100),
        validity: Validity.create({ amount: 60, unit: ValidityUnit.MINUTES }),
        consumptionPolicy: ConsumptionPolicy.CONTINUOUS,
        serviceLevel: ServiceLevel.create({ name: "Standard" }),
        accessMethod: AccessMethod.WALL_CLOCK,
        purchasedAt: new Date("2026-01-01T08:00:00Z"),
      });

      const identity = NetworkIdentity.create({
        id: purchase.networkIdentityId,
        customerId: purchase.customerId,
        username: `terminal-${status.toLowerCase()}`,
        credential: "credential",
        authenticationMethod: AuthenticationMethod.HOTSPOT,
      });

      const savedAccesses: InternetAccess[] = [];
      const internetAccessRepository: InternetAccessRepository = {
        save: async (saved) => {
          savedAccesses.push(saved);
        },
        findByPurchaseId: async () => access,
        findByCustomerId: async () => null,
        findAll: async () => [access],
      };
      const purchaseRepository: PurchaseRepository = {
        save: async () => {},
        findById: async () => purchase,
        findByPaymentIntentId: async () => null,
        findByCustomerId: async () => [],
        findByNetworkIdentityId: async () => purchase,
      };
      const networkIdentityRepository: NetworkIdentityRepository = {
        save: async () => {},
        findById: async () => identity,
        findByUsername: async () => identity,
        findByCustomerId: async () => [identity],
      };
      const routerOsClient: RouterOsClient = {
        connect: async () => {},
        getSystemIdentity: async () => [],
        createHotspotUser: async () => {},
        getHotspotUsers: async () => [],
        getActiveHotspotSessions: async () => [],
        getHotspotSessionIntervals: async () => [],
        getCompletedHotspotSessionIntervals: async () => [],
        removeHotspotUser: async () => {},
        removeActiveHotspotSession: async () => {},
        close: async () => {},
      };

      const service = new ExpireExpiredInternetAccess(
        internetAccessRepository,
        purchaseRepository,
        networkIdentityRepository,
        routerOsClient,
      );

      const result = await service.execute({
        now: new Date("2026-01-01T10:05:00Z"),
      });

      expect(result).toEqual([]);
      expect(savedAccesses).toHaveLength(0);
    },
  );
});
