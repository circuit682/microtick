import { describe, expect, it } from "vitest";

import { GrantInternetAccess } from "@application/access/GrantInternetAccess.js";
import { FulfilPurchase } from "@application/purchase/FulfilPurchase.js";

import type { CredentialGenerator } from "@application/ports/CredentialGenerator.js";
import type { NetworkIdentityRepository } from "@application/ports/NetworkIdentityRepository.js";
import type { UsernameGenerator } from "@application/ports/UsernameGenerator.js";
import type { RouterOsClient } from "@application/ports/RouterOsClient.js";

import {
  AccessMethod,
  AuthenticationMethod,
  ConsumptionPolicy,
  Money,
  NetworkIdentity,
  Plan,
  ServiceLevel,
  Validity,
  ValidityUnit,
} from "@domain";

import { MemoryInternetAccessRepository } from "@infrastructure/access/MemoryInternetAccessRepository.js";
import { UlidIdentifierGenerator } from "@infrastructure/identity/UlidIdentifierGenerator.js";
import { MemoryPlanRepository } from "@infrastructure/plan/MemoryPlanRepository.js";

import { InMemoryPurchaseRepository } from "../../doubles/purchase/InMemoryPurchaseRepository.js";

describe("FulfilPurchase", () => {
  function createPlan(): Plan {
    return Plan.create({
      id: "quiky",
      name: "Quiky",
      price: Money.fromMinorUnits(500),

      validity: Validity.create({
        amount: 30,
        unit: ValidityUnit.MINUTES,
      }),

      consumptionPolicy: ConsumptionPolicy.USAGE,

      serviceLevel: ServiceLevel.create({
        name: "Residential",
      }),

      accessMethod: AccessMethod.SESSION,
    });
  }

  function createNetworkIdentityRepository(): {
    repository: NetworkIdentityRepository;
    identities: NetworkIdentity[];
  } {
    const identities: NetworkIdentity[] = [];

    const repository: NetworkIdentityRepository = {
      async save(identity) {
        identities.push(identity);
      },

      async findById(id) {
        return identities.find((identity) => identity.id === id) ?? null;
      },

      async findByUsername(username) {
        return (
          identities.find((identity) => identity.username === username) ?? null
        );
      },

      async findByCustomerId(customerId) {
        return identities.filter(
          (identity) => identity.customerId === customerId,
        );
      },
    };

    return {
      repository,
      identities,
    };
  }

  function createFulfilPurchase() {
    const purchaseRepository = new InMemoryPurchaseRepository();

    const planRepository = new MemoryPlanRepository();

    const internetAccessRepository = new MemoryInternetAccessRepository();

    const identifierGenerator = new UlidIdentifierGenerator();

    const { repository: networkIdentityRepository, identities } =
      createNetworkIdentityRepository();

    const usernameGenerator: UsernameGenerator = {
      generate: () => "mt_test_customer_001",
    };

    const credentialGenerator: CredentialGenerator = {
      generate: () => "TestCredential123!",
    };

    const grantInternetAccess = new GrantInternetAccess(
      internetAccessRepository,
      identifierGenerator,
    );

    const routerOsCalls: Array<{
      username: string;
      password: string;
    }> = [];

    const routerOsClient: RouterOsClient = {
      async connect() {},

      async getSystemIdentity() {
        return [];
      },

      async createHotspotUser(username, password) {
        routerOsCalls.push({ username, password });
      },

      async getHotspotUsers() {
        return [];
      },

      async getActiveHotspotSessions() {
        return [];
      },

      async removeHotspotUser() {},

      async close() {},
    };

    const fulfilPurchase = new FulfilPurchase(
      purchaseRepository,
      planRepository,
      identifierGenerator,
      networkIdentityRepository,
      usernameGenerator,
      credentialGenerator,
      grantInternetAccess,
      routerOsClient,
    );

    return {
      purchaseRepository,
      planRepository,
      internetAccessRepository,
      identities,
      routerOsCalls,
      fulfilPurchase,
    };
  }

  it("should create a purchase, create a network identity and grant internet access", async () => {
    const {
      purchaseRepository,
      planRepository,
      internetAccessRepository,
      identities,
      routerOsCalls,
      fulfilPurchase,
    } = createFulfilPurchase();

    const plan = createPlan();

    await planRepository.save(plan);

    const purchasedAt = new Date("2026-08-01T10:00:00Z");

    await fulfilPurchase.execute({
      paymentId: "payment-intent-1",
      customerId: "customer-001",
      planId: plan.id,
      purchasedAt,
    });

    const purchase =
      await purchaseRepository.findByPaymentIntentId("payment-intent-1");

    expect(purchase).not.toBeNull();

    expect(purchase?.paymentIntentId).toBe("payment-intent-1");

    expect(purchase?.customerId).toBe("customer-001");

    expect(purchase?.planId).toBe(plan.id);
    expect(purchase?.planName).toBe(plan.name);

    expect(purchase?.planPrice.equals(plan.price)).toBe(true);

    expect(purchase?.validity.equals(plan.validity)).toBe(true);

    expect(purchase?.consumptionPolicy).toBe(plan.consumptionPolicy);

    expect(purchase?.serviceLevel.equals(plan.serviceLevel)).toBe(true);

    expect(purchase?.accessMethod).toBe(plan.accessMethod);

    expect(purchase?.purchasedAt).toEqual(purchasedAt);

    expect(identities).toHaveLength(1);

    const identity = identities[0];

    expect(identity).toBeDefined();
    expect(identity?.customerId).toBe("customer-001");
    expect(identity?.username).toBe("mt_test_customer_001");
    expect(identity?.credential).toBe("TestCredential123!");
    expect(identity?.authenticationMethod).toBe(AuthenticationMethod.HOTSPOT);
    expect(routerOsCalls).toEqual([
      {
        username: "mt_test_customer_001",
        password: "TestCredential123!",
      },
    ]);

    const access = await internetAccessRepository.findByPurchaseId(
      purchase!.id,
    );

    expect(access).not.toBeNull();

    expect(access?.purchaseId).toBe(purchase!.id);

    expect(access?.customerId).toBe("customer-001");

    expect(access?.grantedAt).toEqual(purchasedAt);
  });

  it("should not create a duplicate purchase or network identity for the same payment", async () => {
    const {
      purchaseRepository,
      planRepository,
      internetAccessRepository,
      identities,
      fulfilPurchase,
    } = createFulfilPurchase();

    const plan = createPlan();

    await planRepository.save(plan);

    const command = {
      paymentId: "payment-intent-1",
      customerId: "customer-001",
      planId: plan.id,
      purchasedAt: new Date("2026-08-01T10:00:00Z"),
    };

    await fulfilPurchase.execute(command);
    await fulfilPurchase.execute(command);

    const purchase =
      await purchaseRepository.findByPaymentIntentId("payment-intent-1");

    expect(purchase).not.toBeNull();

    const access = await internetAccessRepository.findByPurchaseId(
      purchase!.id,
    );

    expect(access).not.toBeNull();

    expect(identities).toHaveLength(1);
  });
});
