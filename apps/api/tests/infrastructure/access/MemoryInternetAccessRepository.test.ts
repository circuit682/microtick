import { describe, expect, it } from "vitest";

import { InternetAccess } from "@domain";

import { MemoryInternetAccessRepository } from "@infrastructure/access/MemoryInternetAccessRepository.js";

describe("MemoryInternetAccessRepository", () => {
  function createAccess(): InternetAccess {
    return InternetAccess.create({
      id: "access-001",
      purchaseId: "purchase-001",
      customerId: "customer-001",
      grantedAt: new Date("2026-08-01T10:00:00Z"),
      expiresAt: new Date("2026-08-01T10:30:00Z"),
    });
  }

  it("saves and retrieves access by purchase id", async () => {
    const repository = new MemoryInternetAccessRepository();

    const access = createAccess();

    await repository.save(access);

    const stored = await repository.findByPurchaseId("purchase-001");

    expect(stored).not.toBeNull();
    expect(stored?.id).toBe(access.id);
  });

  it("retrieves access by customer id", async () => {
    const repository = new MemoryInternetAccessRepository();

    const access = createAccess();

    await repository.save(access);

    const stored = await repository.findByCustomerId("customer-001");

    expect(stored).not.toBeNull();
    expect(stored?.purchaseId).toBe("purchase-001");
  });

  it("returns null when purchase does not exist", async () => {
    const repository = new MemoryInternetAccessRepository();

    const stored = await repository.findByPurchaseId("missing-purchase");

    expect(stored).toBeNull();
  });

  it("returns null when customer has no access", async () => {
    const repository = new MemoryInternetAccessRepository();

    const stored = await repository.findByCustomerId("missing-customer");

    expect(stored).toBeNull();
  });
});
