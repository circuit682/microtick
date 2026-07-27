import { describe, expect, it } from "vitest";

import { InitiatePayment } from "@application/payment/InitiatePayment.js";
import { CreatePlan } from "@application/plan/CreatePlan.js";
import { PurchasePlan } from "@application/plan/PurchasePlan.js";

import { UlidIdentifierGenerator } from "@infrastructure/identity/index.js";
import { FakePaymentGateway } from "@infrastructure/payment/FakePaymentGateway.js";
import { MemoryPlanRepository } from "@infrastructure/plan/MemoryPlanRepository.js";

import { Money, PlanType } from "@domain";
import { ErrorCode, ValidationError } from "@shared";

describe("PurchasePlan", () => {
  it("should request payment for an existing plan", async () => {
    // Given
    const paymentGateway = new FakePaymentGateway();
    const initiatePayment = new InitiatePayment(paymentGateway);

    const repository = new MemoryPlanRepository();
    const identifierGenerator = new UlidIdentifierGenerator();

    const createPlan = new CreatePlan(identifierGenerator, repository);

    const createdPlan = await createPlan.execute({
      name: "Quiky",
      price: 500,
      type: PlanType.USAGE,
      allowanceMinutes: 30,
    });

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
  });

  it("should reject purchasing an inactive plan", async () => {
    // Given
    const repository = new MemoryPlanRepository();

    const paymentGateway = new FakePaymentGateway();
    const initiatePayment = new InitiatePayment(paymentGateway);

    const identifierGenerator = new UlidIdentifierGenerator();

    const createPlan = new CreatePlan(identifierGenerator, repository);

    const createdPlan = await createPlan.execute({
      name: "Quiky",
      price: 500,
      type: PlanType.USAGE,
      allowanceMinutes: 30,
    });

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
    const initiatePayment = new InitiatePayment(paymentGateway);

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
    const initiatePayment = new InitiatePayment(paymentGateway);

    const identifierGenerator = new UlidIdentifierGenerator();

    const createPlan = new CreatePlan(identifierGenerator, repository);

    const createdPlan = await createPlan.execute({
      name: "Quiky",
      price: 500,
      type: PlanType.USAGE,
      allowanceMinutes: 30,
    });

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
  });
});
