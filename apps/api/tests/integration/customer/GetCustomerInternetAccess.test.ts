import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createServer } from "../../../src/server.js";

import { CreatePlan } from "@application/plan/CreatePlan.js";

import {
  AccessMethod,
  ConsumptionPolicy,
  InternetAccess,
  InternetAccessStatus,
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
import { PrismaInternetAccessRepository } from "@infrastructure/access/PrismaInternetAccessRepository.js";
import type { OtpDeliveryProvider } from "@infrastructure/otp/OtpDeliveryService.js";

describe("GET /customers/:customerId/access", () => {
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

  it("returns the customer's internet access", async () => {
    let deliveredCode: string | undefined;

    const provider: OtpDeliveryProvider = {
      send: async (_phoneNumber, message) => {
        deliveredCode = message.split(": ").at(-1);
      },
    };

    const customer = await prisma.customer.create({
      data: {
        id: "customer-access-001",
        phoneNumber: "0712345678",
      },
    });

    const identifierGenerator = new UlidIdentifierGenerator();

    const createPlan = new CreatePlan(
      identifierGenerator,
      new PrismaPlanRepository(),
    );

    const plan = await createPlan.execute({
      name: "Access Test Plan",
      price: 100,
      validity: Validity.create({ amount: 60, unit: ValidityUnit.MINUTES }),
      consumptionPolicy: ConsumptionPolicy.USAGE,
      serviceLevel: ServiceLevel.create({ name: "Residential" }),
      accessMethod: AccessMethod.SESSION,
    });

    const purchase = Purchase.create({
      id: identifierGenerator.generate(),
      paymentIntentId: identifierGenerator.generate(),
      customerId: customer.id,
      networkIdentityId: identifierGenerator.generate(),
      planId: plan.id,
      planName: "Access Test Plan",
      planPrice: Money.fromMinorUnits(100),
      validity: Validity.create({ amount: 60, unit: ValidityUnit.MINUTES }),
      consumptionPolicy: ConsumptionPolicy.USAGE,
      serviceLevel: ServiceLevel.create({ name: "Residential" }),
      accessMethod: AccessMethod.SESSION,
      purchasedAt: new Date("2026-09-14T09:00:00Z"),
    });

    await new PrismaPurchaseRepository().save(purchase);

    const access = InternetAccess.create({
      id: identifierGenerator.generate(),
      purchaseId: purchase.id,
      customerId: customer.id,
      grantedAt: new Date("2026-09-14T09:00:00Z"),
      expiresAt: new Date("2026-09-14T10:00:00Z"),
      status: InternetAccessStatus.ACTIVE,
      consumedMinutes: 12,
    });

    await new PrismaInternetAccessRepository().save(access);

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
      url: `/customers/${customer.id}/access`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response.statusCode).toBe(200);

    expect(response.json()).toEqual({
      id: access.id,
      purchaseId: access.purchaseId,
      customerId: access.customerId,
      grantedAt: access.grantedAt.toISOString(),
      expiresAt: access.expiresAt.toISOString(),
      status: access.status,
      consumedMinutes: access.consumedMinutes,
    });

    await server.close();
  });

  it("returns 404 when the customer has no internet access", async () => {
    let deliveredCode: string | undefined;

    const provider: OtpDeliveryProvider = {
      send: async (_phoneNumber, message) => {
        deliveredCode = message.split(": ").at(-1);
      },
    };

    const customer = await prisma.customer.create({
      data: {
        id: "customer-access-002",
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
      url: `/customers/${customer.id}/access`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response.statusCode).toBe(404);

    await server.close();
  });
});
