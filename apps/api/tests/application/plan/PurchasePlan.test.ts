import { describe, expect, it } from "vitest";

import { CreatePlan } from "@application/plan/CreatePlan.js";
import { PurchasePlan } from "@application/plan/PurchasePlan.js";

import { MemoryPlanRepository } from "@infrastructure/plan/MemoryPlanRepository.js";
import { FakePaymentGateway } from "@infrastructure/payment/FakePaymentGateway.js";
import { Money } from "@domain/money/index.js";
import { ValidationError, ErrorCode } from "@shared";

describe("PurchasePlan", () => {
  it("should request payment for an existing plan", async () => {
    // Given
    const repository = new MemoryPlanRepository();
    const paymentGateway = new FakePaymentGateway();

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
      paymentGateway,
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

expect(paymentGateway.lastRequest?.amount.equals(Money.fromKES(500)))
  .toBe(true);

expect(paymentGateway.lastRequest?.reference).toBe("starter-30");
  });
  it("should reject purchasing an inactive plan", async () => {
  // Given
  const repository = new MemoryPlanRepository();
  const paymentGateway = new FakePaymentGateway();

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
    paymentGateway,
  );

  // When / Then
  await expect(
    purchasePlan.execute({
      planId: "starter-30",
      phoneNumber: "254712345678",
    }),
  ).rejects.toThrow();
});
it("should reject purchasing a non-existent plan", async () => {
  // Given
  const repository = new MemoryPlanRepository();
  const paymentGateway = new FakePaymentGateway();

  const purchasePlan = new PurchasePlan(
    repository,
    paymentGateway,
  );

  // When / Then
  await expect(
    purchasePlan.execute({
      planId: "missing-plan",
      phoneNumber: "254712345678",
    }),
  ).rejects.toThrow(ValidationError);
});
it("should return a payment intent when requesting payment", async () => {
  // Given
  const repository = new MemoryPlanRepository();
  const paymentGateway = new FakePaymentGateway();

  const createPlan = new CreatePlan(repository);

  await createPlan.execute({
    id: "starter-30",
    name: "Starter",
    price: 500,
    duration: 30,
    active: true,
  });

  const purchasePlan = new PurchasePlan(repository, paymentGateway);

  // When
  const paymentIntent = await purchasePlan.execute({
    planId: "starter-30",
    phoneNumber: "254712345678",
  });

  // Then
  expect(paymentIntent).toBeDefined();
});
});