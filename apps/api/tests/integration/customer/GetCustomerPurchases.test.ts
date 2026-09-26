import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createServer } from "../../../src/server.js";

import { CreatePlan } from "@application/plan/CreatePlan.js";

import {
  AccessMethod,
  ConsumptionPolicy,
  Money,
  Purchase,
  ServiceLevel,
  Validity,
  ValidityUnit,
} from "@domain";

import { prisma } from "@infrastructure/database/prisma.js";
import { UlidIdentifierGenerator } from "@infrastructure/identity/index.js";
import { PrismaPlanRepository } from "@infrastructure/plan/PrismaPlanRepository.js";
import { PrismaPurchaseRepository } from "@infrastructure/purchase/PrismaPurchaseRepository.js";
import type { OtpDeliveryProvider } from "@infrastructure/otp/OtpDeliveryService.js";

describe("GET /customers/:customerId/purchases", () => {
  beforeEach(async () => {
    await prisma.internetAccess.deleteMany();
    await prisma.purchase.deleteMany();
    await prisma.plan.deleteMany();
    await prisma.session.deleteMany();
    await prisma.otpChallenge.deleteMany();
    await prisma.customer.deleteMany();
  });

  afterEach(async () => {
    await prisma.internetAccess.deleteMany();
    await prisma.purchase.deleteMany();
    await prisma.plan.deleteMany();
    await prisma.session.deleteMany();
    await prisma.otpChallenge.deleteMany();
    await prisma.customer.deleteMany();
  });

  async function createPlanForTest(
    identifierGenerator: UlidIdentifierGenerator,
  ) {
    const createPlan = new CreatePlan(
      identifierGenerator,
      new PrismaPlanRepository(),
    );

    return createPlan.execute({
      name: "Purchases Test Plan",
      price: 100,
      validity: Validity.create({ amount: 60, unit: ValidityUnit.MINUTES }),
      consumptionPolicy: ConsumptionPolicy.USAGE,
      serviceLevel: ServiceLevel.create({ name: "Residential" }),
      accessMethod: AccessMethod.SESSION,
    });
  }

  it("returns the customer's purchases", async () => {
    let deliveredCode: string | undefined;

    const provider: OtpDeliveryProvider = {
      send: async (_phoneNumber, message) => {
        deliveredCode = message.split(": ").at(-1);
      },
    };

    const customer = await prisma.customer.create({
      data: {
        id: "customer-purchases-001",
        phoneNumber: "0712345678",
      },
    });

    const identifierGenerator = new UlidIdentifierGenerator();

    const plan = await createPlanForTest(identifierGenerator);

    const purchase = Purchase.create({
      id: identifierGenerator.generate(),
      paymentIntentId: identifierGenerator.generate(),
      customerId: customer.id,
      networkIdentityId: identifierGenerator.generate(),
      planId: plan.id,
      planName: "Purchases Test Plan",
      planPrice: Money.fromMinorUnits(100),
      validity: Validity.create({ amount: 60, unit: ValidityUnit.MINUTES }),
      consumptionPolicy: ConsumptionPolicy.USAGE,
      serviceLevel: ServiceLevel.create({ name: "Residential" }),
      accessMethod: AccessMethod.SESSION,
      purchasedAt: new Date("2026-09-14T09:00:00Z"),
    });

    await new PrismaPurchaseRepository().save(purchase);

    const server = createServer(provider);

    const challengeResponse = await server.inject({
      method: "POST",
      url: "/otp/challenge",
      payload: { phoneNumber: customer.phoneNumber },
    });

    expect(challengeResponse.statusCode).toBe(201);
    expect(deliveredCode).toMatch(/^\d{6}$/);

    const authenticationResponse = await server.inject({
      method: "POST",
      url: "/auth/authenticate",
      payload: {
        phoneNumber: customer.phoneNumber,
        verificationCode: deliveredCode,
        sessionExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      },
    });

    expect(authenticationResponse.statusCode).toBe(200);

    const { accessToken } = authenticationResponse.json();

    const response = await server.inject({
      method: "GET",
      url: `/customers/${customer.id}/purchases`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response.statusCode).toBe(200);

    expect(response.json()).toEqual([
      {
        id: purchase.id,
        planId: purchase.planId,
        planName: purchase.planName,
        planPriceMinor: 100,
        validity: { amount: 60, unit: ValidityUnit.MINUTES },
        consumptionPolicy: purchase.consumptionPolicy,
        serviceLevel: "Residential",
        accessMethod: purchase.accessMethod,
        purchasedAt: purchase.purchasedAt.toISOString(),
      },
    ]);

    await server.close();
  });

  it("returns an empty list when the customer has no purchases", async () => {
    let deliveredCode: string | undefined;

    const provider: OtpDeliveryProvider = {
      send: async (_phoneNumber, message) => {
        deliveredCode = message.split(": ").at(-1);
      },
    };

    const customer = await prisma.customer.create({
      data: {
        id: "customer-purchases-002",
        phoneNumber: "0798765432",
      },
    });

    const server = createServer(provider);

    const challengeResponse = await server.inject({
      method: "POST",
      url: "/otp/challenge",
      payload: { phoneNumber: customer.phoneNumber },
    });

    expect(challengeResponse.statusCode).toBe(201);
    expect(deliveredCode).toMatch(/^\d{6}$/);

    const authenticationResponse = await server.inject({
      method: "POST",
      url: "/auth/authenticate",
      payload: {
        phoneNumber: customer.phoneNumber,
        verificationCode: deliveredCode,
        sessionExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      },
    });

    expect(authenticationResponse.statusCode).toBe(200);

    const { accessToken } = authenticationResponse.json();

    const response = await server.inject({
      method: "GET",
      url: `/customers/${customer.id}/purchases`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([]);

    await server.close();
  });

  it("returns multiple purchases ordered newest-first", async () => {
    let deliveredCode: string | undefined;

    const provider: OtpDeliveryProvider = {
      send: async (_phoneNumber, message) => {
        deliveredCode = message.split(": ").at(-1);
      },
    };

    const customer = await prisma.customer.create({
      data: {
        id: "customer-purchases-003",
        phoneNumber: "0700000009",
      },
    });

    const identifierGenerator = new UlidIdentifierGenerator();

    const plan = await createPlanForTest(identifierGenerator);

    const olderPurchase = Purchase.create({
      id: identifierGenerator.generate(),
      paymentIntentId: identifierGenerator.generate(),
      customerId: customer.id,
      networkIdentityId: identifierGenerator.generate(),
      planId: plan.id,
      planName: "Purchases Test Plan",
      planPrice: Money.fromMinorUnits(100),
      validity: Validity.create({ amount: 60, unit: ValidityUnit.MINUTES }),
      consumptionPolicy: ConsumptionPolicy.USAGE,
      serviceLevel: ServiceLevel.create({ name: "Residential" }),
      accessMethod: AccessMethod.SESSION,
      purchasedAt: new Date("2026-09-10T09:00:00Z"),
    });

    const newerPurchase = Purchase.create({
      id: identifierGenerator.generate(),
      paymentIntentId: identifierGenerator.generate(),
      customerId: customer.id,
      networkIdentityId: identifierGenerator.generate(),
      planId: plan.id,
      planName: "Purchases Test Plan",
      planPrice: Money.fromMinorUnits(100),
      validity: Validity.create({ amount: 60, unit: ValidityUnit.MINUTES }),
      consumptionPolicy: ConsumptionPolicy.USAGE,
      serviceLevel: ServiceLevel.create({ name: "Residential" }),
      accessMethod: AccessMethod.SESSION,
      purchasedAt: new Date("2026-09-14T09:00:00Z"),
    });

    const purchaseRepository = new PrismaPurchaseRepository();

    await purchaseRepository.save(olderPurchase);
    await purchaseRepository.save(newerPurchase);

    const server = createServer(provider);

    const challengeResponse = await server.inject({
      method: "POST",
      url: "/otp/challenge",
      payload: { phoneNumber: customer.phoneNumber },
    });

    expect(challengeResponse.statusCode).toBe(201);
    expect(deliveredCode).toMatch(/^\d{6}$/);

    const authenticationResponse = await server.inject({
      method: "POST",
      url: "/auth/authenticate",
      payload: {
        phoneNumber: customer.phoneNumber,
        verificationCode: deliveredCode,
        sessionExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      },
    });

    expect(authenticationResponse.statusCode).toBe(200);

    const { accessToken } = authenticationResponse.json();

    const response = await server.inject({
      method: "GET",
      url: `/customers/${customer.id}/purchases`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();

    expect(body).toHaveLength(2);
    expect(body[0].id).toBe(newerPurchase.id);
    expect(body[1].id).toBe(olderPurchase.id);

    await server.close();
  });
});
