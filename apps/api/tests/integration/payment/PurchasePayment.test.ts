import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createServer } from "../../../src/server.js";

import { CreatePlan } from "@application/plan/CreatePlan.js";

import { UlidIdentifierGenerator } from "@infrastructure/identity/index.js";
import { PrismaPlanRepository } from "@infrastructure/plan/PrismaPlanRepository.js";
import { prisma } from "@infrastructure/database/prisma.js";

describe("POST /payments/purchase", () => {
  beforeEach(async () => {
    await prisma.plan.deleteMany();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await prisma.plan.deleteMany();
  });

  it("creates a hosted checkout session", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "checkout-123",
        url: "https://sandbox.intasend.com/checkout/checkout-123",
      }),
    }) as typeof fetch;

    const repository = new PrismaPlanRepository();
    const identifierGenerator = new UlidIdentifierGenerator();

    const createPlan = new CreatePlan(
      identifierGenerator,
      repository,
    );

    const createdPlan = await createPlan.execute({
      name: "Starter",
      price: 500,
      duration: 30,
    });

    const server = createServer();

    const response = await server.inject({
      method: "POST",
      url: "/payments/purchase",
      payload: {
        planId: createdPlan.id,
        phoneNumber: "0712345678",
      },
    });

    expect(response.statusCode).toBe(201);

    expect(response.json()).toEqual({
      providerRequestId: "checkout-123",
      checkoutUrl:
        "https://sandbox.intasend.com/checkout/checkout-123",
    });

    await server.close();
  });
});