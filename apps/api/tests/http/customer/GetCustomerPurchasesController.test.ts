import { describe, expect, it, vi } from "vitest";

import { GetCustomerPurchasesController } from "@http/customer/controller/GetCustomerPurchasesController.js";
import type { GetCustomerPurchases } from "@application/customer/GetCustomerPurchases.js";

import {
  AccessMethod,
  ConsumptionPolicy,
  Money,
  Purchase,
  ServiceLevel,
  Validity,
  ValidityUnit,
} from "@domain";

describe("GetCustomerPurchasesController", () => {
  it("returns customer-safe purchase projections", async () => {
    const purchase = Purchase.create({
      id: "purchase-001",
      paymentIntentId: "payment-internal",
      customerId: "customer-001",
      networkIdentityId: "identity-internal",
      planId: "plan-001",
      planName: "One Hour",
      planPrice: Money.fromMinorUnits(100),
      validity: Validity.create({ amount: 60, unit: ValidityUnit.MINUTES }),
      consumptionPolicy: ConsumptionPolicy.USAGE,
      serviceLevel: ServiceLevel.create({ name: "Standard" }),
      accessMethod: AccessMethod.SESSION,
      purchasedAt: new Date("2026-09-14T10:00:00Z"),
    });
    const useCase = {
      execute: vi.fn(async () => [purchase]),
    } as unknown as GetCustomerPurchases;
    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };

    await new GetCustomerPurchasesController(useCase).handle(
      { params: { customerId: purchase.customerId } } as never,
      reply as never,
    );

    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith([
      {
        id: purchase.id,
        planId: purchase.planId,
        planName: purchase.planName,
        planPriceMinor: 100,
        validity: { amount: 60, unit: ValidityUnit.MINUTES },
        consumptionPolicy: purchase.consumptionPolicy,
        serviceLevel: "Standard",
        accessMethod: purchase.accessMethod,
        purchasedAt: purchase.purchasedAt,
      },
    ]);
  });

  it("returns an empty list for a customer with no purchases", async () => {
    const useCase = {
      execute: vi.fn(async () => []),
    } as unknown as GetCustomerPurchases;
    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };

    await new GetCustomerPurchasesController(useCase).handle(
      { params: { customerId: "customer-001" } } as never,
      reply as never,
    );

    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith([]);
  });
});
