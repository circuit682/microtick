import { describe, expect, it } from "vitest";

import { InitiatePayment } from "@application/payment/InitiatePayment.js";
import { CreatePlan } from "@application/plan/CreatePlan.js";
import { PurchasePlan } from "@application/plan/PurchasePlan.js";

import {
  AccessMethod,
  ConsumptionPolicy,
  Money,
  ServiceLevel,
  Validity,
  ValidityUnit,
} from "@domain";

import { ErrorCode, ValidationError } from "@shared";

import { UlidIdentifierGenerator } from "@infrastructure/identity/index.js";
import { FakePaymentGateway } from "@infrastructure/payment/FakePaymentGateway.js";
import { MemoryPaymentIntentRepository } from "@infrastructure/payment/MemoryPaymentIntentRepository.js";
import { MemoryPlanRepository } from "@infrastructure/plan/MemoryPlanRepository.js";

describe("PurchasePlan", () => {
  function createQuikyPlan(
    repository: MemoryPlanRepository,
    identifierGenerator: UlidIdentifierGenerator,
  ) {
    const createPlan = new CreatePlan(identifierGenerator, repository);

    return createPlan.execute({
      name: "Quiky",
      price: 500,

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

  it("should request payment for an existing plan", async () => {
    // Given
    const paymentGateway = new FakePaymentGateway();

    const paymentIntentRepository = new MemoryPaymentIntentRepository();

    const initiatePayment = new InitiatePayment(
      paymentGateway,
      paymentIntentRepository,
    );

    const repository = new MemoryPlanRepository();

    const identifierGenerator = new UlidIdentifierGenerator();

    const createdPlan = await createQuikyPlan(repository, identifierGenerator);

    const purchasePlan = new PurchasePlan(
      repository,
      initiatePayment,
      identifierGenerator,
    );

    // When
    await purchasePlan.execute({
      planId: createdPlan.id,
      phoneNumber: "254712345678",
    });

    // Then
    expect(paymentGateway.lastRequest).not.toBeNull();

    expect(paymentGateway.lastRequest?.phoneNumber).toBe("254712345678");

    expect(
      paymentGateway.lastRequest?.amount.equals(Money.fromMinorUnits(500)),
    ).toBe(true);

    expect(paymentGateway.lastRequest?.reference).toBeDefined();

    expect(paymentGateway.lastRequest?.reference).not.toBe(createdPlan.id);

    const stored = await paymentIntentRepository.findByReference(
      paymentGateway.lastRequest!.reference,
    );

    expect(stored).not.toBeNull();
    expect(stored?.planId).toBe(createdPlan.id);
  });

  it("should reject purchasing an inactive plan", async () => {
    // Given
    const repository = new MemoryPlanRepository();

    const paymentGateway = new FakePaymentGateway();

    const paymentIntentRepository = new MemoryPaymentIntentRepository();

    const initiatePayment = new InitiatePayment(
      paymentGateway,
      paymentIntentRepository,
    );

    const identifierGenerator = new UlidIdentifierGenerator();

    const createdPlan = await createQuikyPlan(repository, identifierGenerator);

    const inactivePlan = createdPlan.deactivate();

    await repository.save(inactivePlan);

    const purchasePlan = new PurchasePlan(
      repository,
      initiatePayment,
      identifierGenerator,
    );

    // When / Then
    await expect(
      purchasePlan.execute({
        planId: createdPlan.id,
        phoneNumber: "254712345678",
      }),
    ).rejects.toThrow(ValidationError);

    await expect(
      purchasePlan.execute({
        planId: createdPlan.id,
        phoneNumber: "254712345678",
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.PLAN_INACTIVE,
    });
  });

  it("should reject purchasing a non-existent plan", async () => {
    // Given
    const repository = new MemoryPlanRepository();

    const paymentGateway = new FakePaymentGateway();

    const paymentIntentRepository = new MemoryPaymentIntentRepository();

    const initiatePayment = new InitiatePayment(
      paymentGateway,
      paymentIntentRepository,
    );

    const identifierGenerator = new UlidIdentifierGenerator();

    const purchasePlan = new PurchasePlan(
      repository,
      initiatePayment,
      identifierGenerator,
    );

    // When / Then
    await expect(
      purchasePlan.execute({
        planId: "missing-plan",
        phoneNumber: "254712345678",
      }),
    ).rejects.toThrow(ValidationError);

    await expect(
      purchasePlan.execute({
        planId: "missing-plan",
        phoneNumber: "254712345678",
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.PLAN_NOT_FOUND,
    });
  });

  it("should return the purchase plan result", async () => {
    // Given
    const repository = new MemoryPlanRepository();

    const paymentGateway = new FakePaymentGateway();

    const paymentIntentRepository = new MemoryPaymentIntentRepository();

    const initiatePayment = new InitiatePayment(
      paymentGateway,
      paymentIntentRepository,
    );

    const identifierGenerator = new UlidIdentifierGenerator();

    const createdPlan = await createQuikyPlan(repository, identifierGenerator);

    const purchasePlan = new PurchasePlan(
      repository,
      initiatePayment,
      identifierGenerator,
    );

    // When
    const result = await purchasePlan.execute({
      planId: createdPlan.id,
      phoneNumber: "254712345678",
    });

    // Then
    expect(result.paymentIntent).toBeDefined();
    expect(result.providerRequestId).toBeDefined();
    expect(result.checkoutUrl).toBeDefined();

    const stored = await paymentIntentRepository.findByReference(
      result.paymentIntent.reference,
    );

    expect(stored).not.toBeNull();

    expect(stored?.id).toBe(result.paymentIntent.id);
  });
});
