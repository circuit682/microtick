import { describe, expect, it } from "vitest";

import { GetCustomerInternetAccess } from "@application/access/GetCustomerInternetAccess.js";
import type { InternetAccessRepository } from "@application/ports/InternetAccessRepository.js";

import { InternetAccess, InternetAccessStatus } from "@domain";

describe("GetCustomerInternetAccess", () => {
  it("returns the customer's internet access", async () => {
    const access = InternetAccess.create({
      id: "access-001",
      purchaseId: "purchase-001",
      customerId: "customer-001",
      grantedAt: new Date("2026-09-14T10:00:00Z"),
      expiresAt: new Date("2026-09-14T11:00:00Z"),
      status: InternetAccessStatus.ACTIVE,
      consumedMinutes: 12,
    });

    const repository: InternetAccessRepository = {
      save: async () => {},
      findAll: async () => [access],
      findByPurchaseId: async () => null,
      findByCustomerId: async (customerId) =>
        customerId === access.customerId ? access : null,
    };

    const service = new GetCustomerInternetAccess(repository);

    await expect(
      service.execute({ customerId: access.customerId }),
    ).resolves.toBe(access);
  });

  it("returns null when the customer has no internet access", async () => {
    const repository: InternetAccessRepository = {
      save: async () => {},
      findAll: async () => [],
      findByPurchaseId: async () => null,
      findByCustomerId: async () => null,
    };

    const service = new GetCustomerInternetAccess(repository);

    await expect(
      service.execute({ customerId: "missing-customer" }),
    ).resolves.toBeNull();
  });
});
