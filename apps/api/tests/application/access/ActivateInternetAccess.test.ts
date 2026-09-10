import { describe, expect, it } from "vitest";

import { ActivateInternetAccess } from "@application/access/ActivateInternetAccess.js";

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

describe("ActivateInternetAccess", () => {
  it("does not reactivate expired access", async () => {
    const access = InternetAccess.create({
      id: "access-expired",
      purchaseId: "purchase-expired",
      customerId: "customer-001",
      grantedAt: new Date("2026-01-01T10:00:00Z"),
      expiresAt: new Date("2026-01-01T11:00:00Z"),
      status: InternetAccessStatus.EXPIRED,
    });

    const purchase = Purchase.create({
      id: access.purchaseId,
      paymentIntentId: "payment-intent-expired",
      customerId: access.customerId,
      networkIdentityId: "identity-expired",
      planId: "plan-expired",
      planName: "Expired Plan",
      planPrice: Money.fromMinorUnits(100),
      validity: Validity.create({ amount: 60, unit: ValidityUnit.MINUTES }),
      consumptionPolicy: ConsumptionPolicy.CONTINUOUS,
      serviceLevel: ServiceLevel.create({ name: "Standard" }),
      accessMethod: AccessMethod.WALL_CLOCK,
      purchasedAt: new Date("2026-01-01T09:00:00Z"),
    });

    const identity = NetworkIdentity.create({
      id: purchase.networkIdentityId,
      customerId: purchase.customerId,
      username: "expired-user",
      credential: "credential",
      authenticationMethod: AuthenticationMethod.HOTSPOT,
    });

    const savedAccesses: InternetAccess[] = [];
    const internetAccessRepository: InternetAccessRepository = {
      save: async (saved) => savedAccesses.push(saved),
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
      getActiveHotspotSessions: async () => [{ user: identity.username }],
      getHotspotSessionIntervals: async () => [],
      getCompletedHotspotSessionIntervals: async () => [],
      removeHotspotUser: async () => {},
      removeActiveHotspotSession: async () => {},
      close: async () => {},
    };

    const service = new ActivateInternetAccess(
      internetAccessRepository,
      networkIdentityRepository,
      purchaseRepository,
      routerOsClient,
    );

    const result = await service.execute({
      purchaseId: access.purchaseId,
      customerId: access.customerId,
    });

    expect(result.status).toBe(InternetAccessStatus.EXPIRED);
    expect(savedAccesses).toHaveLength(0);
  });

  it("activates only the internet access belonging to the network identity that has an active HotSpot session", async () => {
    const accessOne = InternetAccess.create({
      id: "access-001",
      purchaseId: "purchase-001",
      customerId: "customer-001",
      grantedAt: new Date("2026-01-01T10:00:00Z"),
      expiresAt: new Date("2026-01-01T11:00:00Z"),
      status: InternetAccessStatus.PROVISIONING,
    });

    const accessTwo = InternetAccess.create({
      id: "access-002",
      purchaseId: "purchase-002",
      customerId: "customer-001",
      grantedAt: new Date("2026-01-01T12:00:00Z"),
      expiresAt: new Date("2026-01-01T13:00:00Z"),
      status: InternetAccessStatus.PROVISIONING,
    });

    const identityOne = NetworkIdentity.create({
      id: "identity-001",
      customerId: "customer-001",
      username: "mt-user-001",
      credential: "credential-001",
      authenticationMethod: AuthenticationMethod.HOTSPOT,
    });

    const identityTwo = NetworkIdentity.create({
      id: "identity-002",
      customerId: "customer-001",
      username: "mt-user-002",
      credential: "credential-002",
      authenticationMethod: AuthenticationMethod.HOTSPOT,
    });

    const purchaseOne = Purchase.create({
      id: "purchase-001",
      paymentIntentId: "payment-intent-001",
      customerId: "customer-001",
      networkIdentityId: identityOne.id,
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
      purchasedAt: new Date("2026-01-01T09:00:00Z"),
    });

    const purchaseRepository: PurchaseRepository = {
      save: async () => {},

      findById: async (id) => {
        if (id === purchaseOne.id) {
          return purchaseOne;
        }

        return null;
      },

      findByPaymentIntentId: async () => null,

      findByCustomerId: async () => [purchaseOne],

      findByNetworkIdentityId: async (networkIdentityId) => {
        if (networkIdentityId === purchaseOne.networkIdentityId) {
          return purchaseOne;
        }

        return null;
      },
    };

    const savedAccesses: InternetAccess[] = [];

    const internetAccessRepository: InternetAccessRepository = {
      save: async (access) => {
        savedAccesses.push(access);
      },

      findByPurchaseId: async (purchaseId) => {
        if (purchaseId === accessOne.purchaseId) {
          return accessOne;
        }

        if (purchaseId === accessTwo.purchaseId) {
          return accessTwo;
        }

        return null;
      },

      findByCustomerId: async () => null,
    };

    const networkIdentityRepository: NetworkIdentityRepository = {
      save: async () => {},

      findById: async (id) => {
        if (id === identityOne.id) {
          return identityOne;
        }

        if (id === identityTwo.id) {
          return identityTwo;
        }

        return null;
      },

      findByUsername: async (username) => {
        if (username === identityOne.username) {
          return identityOne;
        }

        if (username === identityTwo.username) {
          return identityTwo;
        }

        return null;
      },

      findByCustomerId: async () => [identityOne, identityTwo],
    };

    const routerOsClient: RouterOsClient = {
      connect: async () => {},

      getSystemIdentity: async () => [],

      createHotspotUser: async () => {},

      getHotspotUsers: async () => [],

      getActiveHotspotSessions: async () => [
        {
          ".id": "*1",
          user: identityOne.username,
        },
      ],

      removeHotspotUser: async () => {},
      removeActiveHotspotSession: async () => {},

      close: async () => {},
    };

    const activateInternetAccess = new ActivateInternetAccess(
      internetAccessRepository,
      networkIdentityRepository,
      purchaseRepository,
      routerOsClient,
    );

    const result = await activateInternetAccess.execute({
      purchaseId: accessOne.purchaseId,
      customerId: accessOne.customerId,
    });

    expect(result.status).toBe(InternetAccessStatus.ACTIVE);

    expect(savedAccesses).toHaveLength(1);
    expect(savedAccesses[0]?.purchaseId).toBe(accessOne.purchaseId);

    expect(accessTwo.status).toBe(InternetAccessStatus.PROVISIONING);
  });

  it("does not activate an access when only another purchase's identity has an active session", async () => {
    const accessOne = InternetAccess.create({
      id: "access-001",
      purchaseId: "purchase-001",
      customerId: "customer-001",
      grantedAt: new Date("2026-08-01T10:00:00Z"),
      expiresAt: new Date("2026-08-01T10:30:00Z"),
      status: InternetAccessStatus.PROVISIONING,
    });

    const accessTwo = InternetAccess.create({
      id: "access-002",
      purchaseId: "purchase-002",
      customerId: "customer-001",
      grantedAt: new Date("2026-08-01T10:00:00Z"),
      expiresAt: new Date("2026-08-01T10:30:00Z"),
      status: InternetAccessStatus.PROVISIONING,
    });

    const identityOne = NetworkIdentity.create({
      id: "identity-001",
      customerId: "customer-001",
      username: "mt-user-001",
      credential: "credential-001",
      authenticationMethod: AuthenticationMethod.HOTSPOT,
    });

    const identityTwo = NetworkIdentity.create({
      id: "identity-002",
      customerId: "customer-001",
      username: "mt-user-002",
      credential: "credential-002",
      authenticationMethod: AuthenticationMethod.HOTSPOT,
    });

    const purchaseOne = Purchase.create({
      id: "purchase-001",
      paymentIntentId: "payment-intent-001",
      customerId: "customer-001",
      networkIdentityId: identityOne.id,
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
      purchasedAt: new Date("2026-08-01T09:00:00Z"),
    });

    const purchaseTwo = Purchase.create({
      id: "purchase-002",
      paymentIntentId: "payment-intent-002",
      customerId: "customer-001",
      networkIdentityId: identityTwo.id,
      planId: "plan-002",
      planName: "Test Plan 2",
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
      purchasedAt: new Date("2026-08-01T09:00:00Z"),
    });

    const savedAccesses: InternetAccess[] = [];

    const internetAccessRepository: InternetAccessRepository = {
      save: async (access) => {
        savedAccesses.push(access);
      },

      findByPurchaseId: async (purchaseId) => {
        if (purchaseId === accessOne.purchaseId) {
          return accessOne;
        }

        if (purchaseId === accessTwo.purchaseId) {
          return accessTwo;
        }

        return null;
      },

      findByCustomerId: async () => null,
    };

    const networkIdentityRepository: NetworkIdentityRepository = {
      save: async () => {},

      findById: async (id) => {
        if (id === identityOne.id) {
          return identityOne;
        }

        if (id === identityTwo.id) {
          return identityTwo;
        }

        return null;
      },

      findByUsername: async (username) => {
        if (username === identityOne.username) {
          return identityOne;
        }

        if (username === identityTwo.username) {
          return identityTwo;
        }

        return null;
      },

      findByCustomerId: async () => [identityOne, identityTwo],
    };

    const purchaseRepository: PurchaseRepository = {
      save: async () => {},

      findById: async (id) => {
        if (id === purchaseOne.id) {
          return purchaseOne;
        }

        if (id === purchaseTwo.id) {
          return purchaseTwo;
        }

        return null;
      },

      findByPaymentIntentId: async () => null,

      findByCustomerId: async () => [purchaseOne, purchaseTwo],

      findByNetworkIdentityId: async (networkIdentityId) => {
        if (networkIdentityId === purchaseOne.networkIdentityId) {
          return purchaseOne;
        }

        if (networkIdentityId === purchaseTwo.networkIdentityId) {
          return purchaseTwo;
        }

        return null;
      },
    };

    const routerOsClient: RouterOsClient = {
      connect: async () => {},

      getSystemIdentity: async () => [],

      createHotspotUser: async () => {},

      getHotspotUsers: async () => [],

      getActiveHotspotSessions: async () => [
        {
          ".id": "*1",
          user: identityOne.username,
        },
      ],

      removeHotspotUser: async () => {},
      removeActiveHotspotSession: async () => {},

      close: async () => {},
    };

    const activateInternetAccess = new ActivateInternetAccess(
      internetAccessRepository,
      networkIdentityRepository,
      purchaseRepository,
      routerOsClient,
    );

    const result = await activateInternetAccess.execute({
      purchaseId: accessTwo.purchaseId,
      customerId: accessTwo.customerId,
    });

    expect(result.status).toBe(InternetAccessStatus.PROVISIONING);
    expect(savedAccesses).toHaveLength(0);
  });
});
