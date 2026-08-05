import { describe, expect, it } from "vitest";

import {
  Money,
  PlanType,
  Purchase,
} from "@domain";

import { InMemoryPurchaseRepository } from "./InMemoryPurchaseRepository.js";

describe("InMemoryPurchaseRepository", () => {
  function createPurchase(
    paymentIntentId: string,
  ): Purchase {
    return Purchase.create({
      id: `purchase-${paymentIntentId}`,
      paymentIntentId,
      customerId: "customer-1",
      planId: "plan-1",
      planName: "Quiky",
      planPrice: Money.fromMinorUnits(500),
      planType: PlanType.USAGE,
      allowanceMinutes: 30,
      purchasedAt: new Date(),
    });
  }

  it("finds a purchase by payment intent id", async () => {
    const repository =
      new InMemoryPurchaseRepository();

    const purchase =
      createPurchase("payment-1");

    await repository.save(purchase);

    const found =
      await repository.findByPaymentIntentId(
        "payment-1",
      );

    expect(found).toBe(purchase);
  });

  it("returns null when payment intent id is unknown", async () => {
    const repository =
      new InMemoryPurchaseRepository();

    const found =
      await repository.findByPaymentIntentId(
        "unknown",
      );

    expect(found).toBeNull();
  });
});