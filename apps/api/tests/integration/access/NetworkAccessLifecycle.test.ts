import { describe, expect, it } from "vitest";

import { ActivateInternetAccess } from "@application/access/ActivateInternetAccess.js";
import { ActivateInternetAccessFromRouterOs } from "@application/access/ActivateInternetAccessFromRouterOs.js";
import { ExpireExpiredInternetAccess } from "@application/access/ExpireExpiredInternetAccess.js";
import { RecordInternetAccessUsage } from "@application/access/RecordInternetAccessUsage.js";
import { RecordInternetAccessUsageFromRouterOs } from "@application/access/RecordInternetAccessUsageFromRouterOs.js";
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

describe("Network Access Lifecycle acceptance", () => {
  it("records active and completed usage, caps the allowance, expires access, and prevents reactivation", async () => {
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
      customerId: identity.customerId,
      networkIdentityId: identity.id,
      planId: "plan-001",
      planName: "One Hour Usage Plan",
      planPrice: Money.fromMinorUnits(100),
      validity: Validity.create({ amount: 60, unit: ValidityUnit.MINUTES }),
      consumptionPolicy: ConsumptionPolicy.USAGE,
      serviceLevel: ServiceLevel.create({ name: "Standard" }),
      accessMethod: AccessMethod.SESSION,
      purchasedAt: new Date("2026-09-13T10:00:00Z"),
    });

    const initialAccess = InternetAccess.create({
      id: "access-001",
      purchaseId: purchase.id,
      customerId: purchase.customerId,
      grantedAt: purchase.purchasedAt,
      expiresAt: new Date("2026-09-13T11:00:00Z"),
      status: InternetAccessStatus.PROVISIONING,
    });

    let access = initialAccess;
    const removedUsers: string[] = [];
    const removedSessions: string[] = [];
    const internetAccessRepository: InternetAccessRepository = {
      save: async (saved) => {
        access = saved;
      },
      findAll: async () => [access],
      findByPurchaseId: async () => access,
      findByCustomerId: async () => access,
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
      findByUsername: async (username) =>
        username === identity.username ? identity : null,
      findByCustomerId: async () => [identity],
    };

    const routerOsClient: RouterOsClient = {
      connect: async () => {},
      getSystemIdentity: async () => [],
      createHotspotUser: async () => {},
      getHotspotUsers: async () => [],
      getActiveHotspotSessions: async () => [{ user: identity.username }],
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

    const recordUsageFromRouterOs = new RecordInternetAccessUsageFromRouterOs(
      networkIdentityRepository,
      purchaseRepository,
      new RecordInternetAccessUsage(internetAccessRepository),
    );
    const expireAccess = new ExpireExpiredInternetAccess(
      internetAccessRepository,
      purchaseRepository,
      networkIdentityRepository,
      routerOsClient,
    );
    const activateAccessFromRouterOs = new ActivateInternetAccessFromRouterOs(
      routerOsClient,
      networkIdentityRepository,
      purchaseRepository,
      new ActivateInternetAccess(
        internetAccessRepository,
        networkIdentityRepository,
        purchaseRepository,
        routerOsClient,
      ),
    );

    const activeInterval = {
      sessionId: "router-active-session",
      username: identity.username,
      connectedAt: new Date("2026-09-13T10:00:00Z"),
      disconnectedAt: new Date("2026-09-13T10:55:00Z"),
    };

    await recordUsageFromRouterOs.execute([activeInterval]);
    await expireAccess.execute({ now: new Date("2026-09-13T10:55:00Z") });
    await activateAccessFromRouterOs.execute();

    expect(access.status).toBe(InternetAccessStatus.ACTIVE);
    expect(access.consumedMinutes).toBe(55);

    const completedInterval = {
      sessionId: "router-completed-session",
      username: identity.username,
      connectedAt: activeInterval.connectedAt,
      disconnectedAt: new Date("2026-09-13T11:05:00Z"),
    };

    await recordUsageFromRouterOs.execute([completedInterval]);
    await expireAccess.execute({ now: new Date("2026-09-13T11:05:00Z") });
    await activateAccessFromRouterOs.execute();

    expect(access.consumedMinutes).toBe(60);
    expect(access.status).toBe(InternetAccessStatus.EXPIRED);
    expect(removedUsers).toEqual([identity.username]);
    expect(removedSessions).toEqual([identity.username]);
  });
});
