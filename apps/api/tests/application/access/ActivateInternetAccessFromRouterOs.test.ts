import { describe, expect, it, vi } from "vitest";

import type {
  ActivateInternetAccessCommand,
  ActivateInternetAccessUseCase,
} from "@application/access/ActivateInternetAccess.js";
import { ActivateInternetAccessFromRouterOs } from "@application/access/ActivateInternetAccessFromRouterOs.js";
import type { NetworkIdentityRepository } from "@application/ports/NetworkIdentityRepository.js";
import type { PurchaseRepository } from "@application/ports/PurchaseRepository.js";
import type { RouterOsClient } from "@application/ports/RouterOsClient.js";

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

describe("ActivateInternetAccessFromRouterOs", () => {
  it("activates internet access when RouterOS reports the purchase's network identity as active", async () => {
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

    const routerOsClient: RouterOsClient = {
      connect: async () => {},
      getSystemIdentity: async () => [],
      createHotspotUser: async () => {},
      getHotspotUsers: async () => [],
      getActiveHotspotSessions: async () => [
        {
          ".id": "*1",
          user: identity.username,
        },
      ],
      removeHotspotUser: async () => {},
      removeActiveHotspotSession: async () => {},
      close: async () => {},
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

    const execute = vi.fn(async (_command: ActivateInternetAccessCommand) => {
      return undefined;
    });

    const activateInternetAccess = {
      execute,
    } as unknown as ActivateInternetAccessUseCase;

    const trigger = new ActivateInternetAccessFromRouterOs(
      routerOsClient,
      networkIdentityRepository,
      purchaseRepository,
      activateInternetAccess,
    );

    await trigger.execute();

    expect(execute).toHaveBeenCalledWith({
      purchaseId: purchase.id,
      customerId: purchase.customerId,
    });
  });
});
