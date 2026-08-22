import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createServer } from "../../../src/server.js";

import { CreatePlan } from "@application/plan/CreatePlan.js";

import {
  AccessMethod,
  ConsumptionPolicy,
  Money,
  PaymentIntent,
  PaymentStatus,
  ServiceLevel,
  Validity,
  ValidityUnit,
} from "@domain";

import { prisma } from "@infrastructure/database/prisma.js";
import { UlidIdentifierGenerator } from "@infrastructure/identity/index.js";
import { PrismaPaymentIntentRepository } from "@infrastructure/payment/PrismaPaymentIntentRepository.js";
import { PrismaPlanRepository } from "@infrastructure/plan/PrismaPlanRepository.js";

describe("POST /payments/intasend/webhook", () => {
  beforeEach(async () => {
    await prisma.internetAccess.deleteMany();
    await prisma.purchase.deleteMany();
    await prisma.paymentIntent.deleteMany();
    await prisma.plan.deleteMany();
  });

  afterEach(async () => {
    await prisma.internetAccess.deleteMany();
    await prisma.purchase.deleteMany();
    await prisma.paymentIntent.deleteMany();
    await prisma.plan.deleteMany();
  });

  function residentialService(): ServiceLevel {
    return ServiceLevel.create({
      name: "Residential",
    });
  }

  it("confirms payment, creates a purchase and grants internet access", async () => {
    // Given
    const identifierGenerator = new UlidIdentifierGenerator();

    const planRepository = new PrismaPlanRepository();

    const paymentRepository = new PrismaPaymentIntentRepository();

    const createPlan = new CreatePlan(identifierGenerator, planRepository);

    const plan = await createPlan.execute({
      name: "Daily",
      price: 500,

      validity: Validity.create({
        amount: 1,
        unit: ValidityUnit.DAYS,
      }),

      consumptionPolicy: ConsumptionPolicy.CONTINUOUS,

      serviceLevel: residentialService(),

      accessMethod: AccessMethod.WALL_CLOCK,
    });

    const payment = PaymentIntent.create({
      id: identifierGenerator.generate(),
      customerId: "customer-001",
      planId: plan.id,
      amount: Money.fromMinorUnits(500),
      phoneNumber: "254712345678",
      reference: "payment-ref-123",
    });

    payment.markPending();

    await paymentRepository.save(payment);

    const server = createServer();

    // When
    const response = await server.inject({
      method: "POST",
      url: "/payments/intasend/webhook",
      payload: {
        reference: "payment-ref-123",
      },
    });

    // Then
    expect(response.statusCode).toBe(200);

    const confirmed =
      await paymentRepository.findByReference("payment-ref-123");

    expect(confirmed).not.toBeNull();
    expect(confirmed?.status).toBe(PaymentStatus.COMPLETED);

    const purchase = await prisma.purchase.findUnique({
      where: {
        paymentIntentId: payment.id,
      },
    });

    expect(purchase).not.toBeNull();
    expect(purchase?.customerId).toBe("254712345678");
    expect(purchase?.planId).toBe(plan.id);

    const access = await prisma.internetAccess.findUnique({
      where: {
        purchaseId: purchase!.id,
      },
    });

    expect(access).not.toBeNull();

    expect(access?.purchaseId).toBe(purchase!.id);

    expect(access?.customerId).toBe("254712345678");

    expect(access?.grantedAt).toEqual(purchase!.purchasedAt);

    expect(access!.expiresAt.getTime()).toBeGreaterThan(
      access!.grantedAt.getTime(),
    );

    await server.close();
  });
});
