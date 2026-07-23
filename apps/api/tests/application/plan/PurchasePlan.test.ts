import { describe, expect, it } from "vitest";

import { InitiatePayment } from "@application/payment/InitiatePayment.js";
import { CreatePlan } from "@application/plan/CreatePlan.js";
import { PurchasePlan } from "@application/plan/PurchasePlan.js";

import { FakePaymentGateway } from "@infrastructure/payment/FakePaymentGateway.js";
import { MemoryPlanRepository } from "@infrastructure/plan/MemoryPlanRepository.js";

import { Money } from "@domain/money/index.js";
import { ErrorCode, ValidationError } from "@shared";

describe("PurchasePlan", () => {
  it("should request payment for an existing plan", async () => {
    // Given
    const repository = new MemoryPlanRepository();

    const paymentGateway = new FakePaymentGateway();
    const initiatePayment = new InitiatePayment(paymentGateway);

    const createPlan = new CreatePlan(repository);

    await createPlan.execute({
      id: "starter-30",
      name: "Starter",
      price: 500,
      duration: 30,
      active: true,
    });

    const purchasePlan = new PurchasePlan(
      repository,
      initiatePayment,
    );

    // When
    await purchasePlan.execute({
      planId: "starter-30",
      phoneNumber: "254712345678",
    });

    // Then
    expect(paymentGateway.lastRequest).not.toBeNull();

    expect(paymentGateway.lastRequest?.phoneNumber)
      .toBe("254712345678");

    expect(
      paymentGateway.lastRequest?.amount.equals(
        Money.fromKES(500),
      ),
    ).toBe(true);

    expect(paymentGateway.lastRequest?.reference)
      .toBe("starter-30");
  });

  it("should reject purchasing an inactive plan", async () => {
    // Given
    const repository = new MemoryPlanRepository();

    const paymentGateway = new FakePaymentGateway();
    const initiatePayment = new InitiatePayment(paymentGateway);

    const createPlan = new CreatePlan(repository);

    await createPlan.execute({
      id: "starter-30",
      name: "Starter",
      price: 500,
      duration: 30,
      active: false,
    });

    const purchasePlan = new PurchasePlan(
      repository,
      initiatePayment,
    );

    // When / Then
    await expect(
      purchasePlan.execute({
        planId: "starter-30",
        phoneNumber: "254712345678",
      }),
    ).rejects.toThrow(ValidationError);
  });

  it("should reject purchasing a non-existent plan", async () => {
    // Given
    const repository = new MemoryPlanRepository();

    const paymentGateway = new FakePaymentGateway();
    const initiatePayment = new InitiatePayment(paymentGateway);

    const purchasePlan = new PurchasePlan(
      repository,
      initiatePayment,
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

  it("should return a payment intent when requesting payment", async () => {
    // Given
    const repository = new MemoryPlanRepository();

    const paymentGateway = new FakePaymentGateway();
    const initiatePayment = new InitiatePayment(paymentGateway);

    const createPlan = new CreatePlan(repository);

    await createPlan.execute({
      id: "starter-30",
      name: "Starter",
      price: 500,
      duration: 30,
      active: true,
    });

    const purchasePlan = new PurchasePlan(
      repository,
      initiatePayment,
    );

    // When
    const paymentIntent = await purchasePlan.execute({
      planId: "starter-30",
      phoneNumber: "254712345678",
    });

    // Then
    expect(paymentIntent).toBeDefined();
  });
});