import { describe, expect, it } from "vitest";

import { BeginInternetAccessProvisioning } from "@application/access/BeginInternetAccessProvisioning.js";

import { InternetAccess, InternetAccessStatus } from "@domain";

import { MemoryInternetAccessRepository } from "@infrastructure/access/MemoryInternetAccessRepository.js";

describe("BeginInternetAccessProvisioning", () => {
  it("moves granted internet access to provisioning", async () => {
    const repository = new MemoryInternetAccessRepository();

    const access = InternetAccess.create({
      id: "access-001",
      purchaseId: "purchase-001",
      customerId: "customer-001",
      grantedAt: new Date("2026-01-01T10:00:00Z"),
      expiresAt: new Date("2026-01-02T10:00:00Z"),
      status: InternetAccessStatus.GRANTED,
    });

    await repository.save(access);

    const beginProvisioning = new BeginInternetAccessProvisioning(repository);

    const result = await beginProvisioning.execute({
      purchaseId: "purchase-001",
    });

    expect(result.status).toBe(InternetAccessStatus.PROVISIONING);

    const stored = await repository.findByPurchaseId("purchase-001");

    expect(stored?.status).toBe(InternetAccessStatus.PROVISIONING);
  });
});
