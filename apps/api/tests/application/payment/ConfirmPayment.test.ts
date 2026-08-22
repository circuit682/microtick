import { describe, expect, it } from "vitest";

import { GrantInternetAccess } from "@application/access/GrantInternetAccess.js";
import { ConfirmPayment } from "@application/payment/ConfirmPayment.js";
import { FulfilPurchase } from "@application/purchase/FulfilPurchase.js";
import type { NetworkIdentityRepository } from "@application/ports/NetworkIdentityRepository.js";
import type { UsernameGenerator } from "@application/ports/UsernameGenerator.js";
import type { CredentialGenerator } from "@application/ports/CredentialGenerator.js";

import {
  AccessMethod,
  AuthenticationMethod,
  ConsumptionPolicy,
  Money,
  NetworkIdentity,
  PaymentIntent,
  PaymentStatus,
  Plan,
  ServiceLevel,
  Validity,
  ValidityUnit,
} from "@domain";

import { UlidIdentifierGenerator } from "@infrastructure/identity/UlidIdentifierGenerator.js";
import { MemoryInternetAccessRepository } from "@infrastructure/access/MemoryInternetAccessRepository.js";
import { MemoryPaymentIntentRepository } from "@infrastructure/payment/MemoryPaymentIntentRepository.js";
import { MemoryPlanRepository } from "@infrastructure/plan/MemoryPlanRepository.js";

import { InMemoryPurchaseRepository } from "../../doubles/purchase/InMemoryPurchaseRepository.js";

describe("ConfirmPayment", () => {
  it("should confirm a payment and fulfil the purchase", async () => {
    const paymentIntentRepository = new MemoryPaymentIntentRepository();

    const planRepository = new MemoryPlanRepository();

    const purchaseRepository = new InMemoryPurchaseRepository();

    const internetAccessRepository = new MemoryInternetAccessRepository();

    const networkIdentities: NetworkIdentity[] = [];

    const networkIdentityRepository: NetworkIdentityRepository = {
      async save(identity) {
        networkIdentities.push(identity);
      },

      async findById(id) {
        return networkIdentities.find((identity) => identity.id === id) ?? null;
      },

      async findByUsername(username) {
        return (
          networkIdentities.find(
            (identity) => identity.username === username,
          ) ?? null
        );
      },

      async findByCustomerId(customerId) {
        return networkIdentities.filter(
          (identity) => identity.customerId === customerId,
        );
      },
    };

    const identifierGenerator = new UlidIdentifierGenerator();

    const usernameGenerator: UsernameGenerator = {
      generate: () => "mt_test_customer_1",
    };

    const credentialGenerator: CredentialGenerator = {
      generate: () => "TestCredential123!",
    };

    const plan = Plan.create({
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

    await planRepository.save(plan);

    const paymentIntent = PaymentIntent.create({
      id: "payment-intent-1",
      customerId: "customer-001",
      planId: plan.id,
      amount: plan.price,
      phoneNumber: "0712345678",
      reference: "payment-ref-123",
    });

    paymentIntent.markPending();

    await paymentIntentRepository.save(paymentIntent);

    const grantInternetAccess = new GrantInternetAccess(
      internetAccessRepository,
      identifierGenerator,
    );

    const fulfilPurchase = new FulfilPurchase(
      purchaseRepository,
      planRepository,
      identifierGenerator,
      networkIdentityRepository,
      usernameGenerator,
      credentialGenerator,
      grantInternetAccess,
    );

    const confirmPayment = new ConfirmPayment(
      paymentIntentRepository,
      fulfilPurchase,
    );

    await confirmPayment.execute(paymentIntent.reference);

    const storedPayment = await paymentIntentRepository.findByReference(
      paymentIntent.reference,
    );

    expect(storedPayment).not.toBeNull();
    expect(storedPayment?.status).toBe(PaymentStatus.COMPLETED);

    const purchase = await purchaseRepository.findByPaymentIntentId(
      paymentIntent.id,
    );

    expect(purchase).not.toBeNull();

    expect(purchase?.planId).toBe(plan.id);
    expect(purchase?.planName).toBe(plan.name);
    expect(purchase?.planPrice.equals(plan.price)).toBe(true);
    expect(purchase?.validity.equals(plan.validity)).toBe(true);
    expect(purchase?.consumptionPolicy).toBe(plan.consumptionPolicy);
    expect(purchase?.serviceLevel.equals(plan.serviceLevel)).toBe(true);
    expect(purchase?.accessMethod).toBe(plan.accessMethod);

    const identity = networkIdentities.find(
      (item) => item.customerId === paymentIntent.phoneNumber,
    );

    expect(identity).not.toBeUndefined();
    expect(identity?.username).toBe("mt_test_customer_1");
    expect(identity?.credential).toBe("TestCredential123!");
    expect(identity?.authenticationMethod).toBe(AuthenticationMethod.HOTSPOT);

    const access = await internetAccessRepository.findByPurchaseId(
      purchase!.id,
    );

    expect(access).not.toBeNull();
    expect(access?.purchaseId).toBe(purchase?.id);
    expect(access?.customerId).toBe(paymentIntent.phoneNumber);
  });
});
