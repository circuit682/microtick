import { describe, expect, it } from "vitest";

import { ExpireInternetAccess } from "@application/access/ExpireInternetAccess.js";
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

describe("ExpireInternetAccess", () => {
  it("expires the internet access and persists the change", async () => {
    // Arrange
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
      consumptionPolicy: ConsumptionPolicy.CONTINUOUS,
      serviceLevel: ServiceLevel.create({ name: "Standard" }),
      accessMethod: AccessMethod.WALL_CLOCK,
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

    const internetAccessRepository: InternetAccessRepository = {
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

    const expireInternetAccess = new ExpireInternetAccess(
      internetAccessRepository,
      purchaseRepository,
      networkIdentityRepository,
      routerOsClient,
    );

    // Act
    const result = await expireInternetAccess.execute({
      purchaseId: access.purchaseId,
    });

    // Assert
    expect(result.status).toBe(InternetAccessStatus.EXPIRED);

    expect(savedAccesses).toHaveLength(1);
    expect(savedAccesses[0]?.purchaseId).toBe(access.purchaseId);
    expect(savedAccesses[0]?.status).toBe(InternetAccessStatus.EXPIRED);
  });

  it("throws an error when the internet access is not found", async () => {
    // Arrange
    const internetAccessRepository: InternetAccessRepository = {
      save: async () => {},
      findByPurchaseId: async () => null,
      findByCustomerId: async () => null,
      findAll: async () => [],
    };

    const purchaseRepository: PurchaseRepository = {
      save: async () => {},
      findById: async () => null,
      findByPaymentIntentId: async () => null,
      findByCustomerId: async () => [],
      findByNetworkIdentityId: async () => null,
    };

    const networkIdentityRepository: NetworkIdentityRepository = {
      save: async () => {},
      findById: async () => null,
      findByUsername: async () => null,
      findByCustomerId: async () => [],
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

    const expireInternetAccess = new ExpireInternetAccess(
      internetAccessRepository,
      purchaseRepository,
      networkIdentityRepository,
      routerOsClient,
    );

    // Act & Assert
    await expect(
      expireInternetAccess.execute({ purchaseId: "missing-purchase" }),
    ).rejects.toThrow(
      "Internet access for purchase 'missing-purchase' was not found.",
    );
  });

  it("synchronously removes the HotSpot user and terminates the active session upon expiration", async () => {
    // Arrange
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
      consumptionPolicy: ConsumptionPolicy.CONTINUOUS,
      serviceLevel: ServiceLevel.create({ name: "Standard" }),
      accessMethod: AccessMethod.WALL_CLOCK,
      purchasedAt: new Date("2026-01-01T09:00:00Z"),
    });

    const identity = NetworkIdentity.create({
      id: "identity-001",
      customerId: "customer-001",
      username: "mt-user-001",
      credential: "credential-001",
      authenticationMethod: AuthenticationMethod.HOTSPOT,
    });

    const removedUsers: string[] = [];
    const terminatedSessions: string[] = [];
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
        terminatedSessions.push(username);
      },
      close: async () => {},
    };

    const expireInternetAccess = new ExpireInternetAccess(
      internetAccessRepository,
      purchaseRepository,
      networkIdentityRepository,
      routerOsClient,
    );

    // Act
    const result = await expireInternetAccess.execute({
      purchaseId: access.purchaseId,
    });

    // Assert
    expect(result.status).toBe(InternetAccessStatus.EXPIRED);
    expect(removedUsers).toEqual(["mt-user-001"]);
    expect(terminatedSessions).toEqual(["mt-user-001"]);
    expect(savedAccesses[0]?.status).toBe(InternetAccessStatus.EXPIRED);
  });
});
