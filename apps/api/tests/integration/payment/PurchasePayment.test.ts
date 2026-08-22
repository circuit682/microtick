import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createServer } from "../../../src/server.js";

import { CreatePlan } from "@application/plan/CreatePlan.js";

import {
  AccessMethod,
  ConsumptionPolicy,
  ServiceLevel,
  Validity,
  ValidityUnit,
} from "@domain";

import { prisma } from "@infrastructure/database/prisma.js";
import { UlidIdentifierGenerator } from "@infrastructure/identity/index.js";
import { PrismaPlanRepository } from "@infrastructure/plan/PrismaPlanRepository.js";

describe("POST /payments/purchase", () => {
  beforeEach(async () => {
    await prisma.internetAccess.deleteMany();
    await prisma.purchase.deleteMany();
    await prisma.paymentIntent.deleteMany();
    await prisma.otpChallenge.deleteMany();
    await prisma.session.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.plan.deleteMany();
  });

  afterEach(async () => {
    vi.restoreAllMocks();

    await prisma.internetAccess.deleteMany();
    await prisma.purchase.deleteMany();
    await prisma.paymentIntent.deleteMany();
    await prisma.otpChallenge.deleteMany();
    await prisma.session.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.plan.deleteMany();
  });

  function residentialService(): ServiceLevel {
    return ServiceLevel.create({
      name: "Residential",
    });
  }

  it("creates a hosted checkout session for the authenticated customer", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "checkout-123",
        url: "https://sandbox.intasend.com/checkout/checkout-123",
      }),
    }) as typeof fetch;

    const customer = await prisma.customer.create({
      data: {
        id: "customer-payment-001",
        phoneNumber: "0712345678",
      },
    });

    let deliveredCode: string | undefined;

    const provider = {
      send: async (_phoneNumber: string, message: string) => {
        deliveredCode = message.split(": ").at(-1);
      },
    };

    const repository = new PrismaPlanRepository();

    const identifierGenerator = new UlidIdentifierGenerator();

    const createPlan = new CreatePlan(identifierGenerator, repository);

    const createdPlan = await createPlan.execute({
      name: "Quiky",
      price: 500,

      validity: Validity.create({
        amount: 30,
        unit: ValidityUnit.MINUTES,
      }),

      consumptionPolicy: ConsumptionPolicy.USAGE,

      serviceLevel: residentialService(),

      accessMethod: AccessMethod.SESSION,
    });

    const server = createServer(provider);

    const challengeResponse = await server.inject({
      method: "POST",
      url: "/otp/challenge",
      payload: {
        phoneNumber: customer.phoneNumber,
      },
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

    const authenticationBody = authenticationResponse.json();

    expect(authenticationBody.accessToken).toEqual(expect.any(String));

    const response = await server.inject({
      method: "POST",
      url: "/payments/purchase",
      headers: {
        authorization: `Bearer ${authenticationBody.accessToken}`,
      },
      payload: {
        planId: createdPlan.id,
        phoneNumber: customer.phoneNumber,
      },
    });

    expect(response.statusCode).toBe(201);

    expect(response.json()).toEqual({
      providerRequestId: "checkout-123",
      checkoutUrl: "https://sandbox.intasend.com/checkout/checkout-123",
    });

    const paymentIntent = await prisma.paymentIntent.findFirst({
      where: {
        customerId: customer.id,
      },
    });

    expect(paymentIntent).not.toBeNull();
    expect(paymentIntent?.customerId).toBe(customer.id);
    expect(paymentIntent?.phoneNumber).toBe(customer.phoneNumber);
    expect(paymentIntent?.planId).toBe(createdPlan.id);

    await server.close();
  });
  it("rejects a purchase without an access token", async () => {
    const server = createServer();

    const response = await server.inject({
      method: "POST",
      url: "/payments/purchase",
      payload: {
        planId: "plan-payment-auth-001",
        phoneNumber: "0712345678",
      },
    });

    expect(response.statusCode).toBe(401);

    await server.close();
  });

  it("rejects a purchase with an invalid access token", async () => {
    const server = createServer();

    const response = await server.inject({
      method: "POST",
      url: "/payments/purchase",
      headers: {
        authorization: "Bearer invalid-access-token",
      },
      payload: {
        planId: "plan-payment-auth-002",
        phoneNumber: "0712345678",
      },
    });

    expect(response.statusCode).toBe(401);

    await server.close();
  });
});
