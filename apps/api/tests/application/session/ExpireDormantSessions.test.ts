import { describe, expect, it } from "vitest";

import type { PurchaseRepository } from "@application/ports/PurchaseRepository.js";
import { ExpireDormantSessions } from "@application/session/ExpireDormantSessions.js";

import {
  AccessMethod,
  ConsumptionPolicy,
  Money,
  Purchase,
  ServiceLevel,
  Session,
  SessionStatus,
  Validity,
  ValidityUnit,
} from "@domain";

import { InMemorySessionRepository } from "../../doubles/session/InMemorySessionRepository.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = new Date("2026-09-30T12:00:00Z");

function daysAgo(days: number): Date {
  return new Date(NOW.getTime() - days * DAY_MS);
}

function createSession(
  id: string,
  customerId: string,
  createdAt: Date,
  status: SessionStatus = SessionStatus.ACTIVE,
): Session {
  return Session.create({
    id,
    customerId,
    createdAt,
    expiresAt: new Date(createdAt.getTime() + 30 * DAY_MS),
    status,
  });
}

function createPurchase(
  id: string,
  customerId: string,
  purchasedAt: Date,
): Purchase {
  return Purchase.create({
    id,
    paymentIntentId: `payment-${id}`,
    customerId,
    networkIdentityId: `identity-${id}`,
    planId: "plan-001",
    planName: "Test Plan",
    planPrice: Money.fromMinorUnits(100),
    validity: Validity.create({ amount: 60, unit: ValidityUnit.MINUTES }),
    consumptionPolicy: ConsumptionPolicy.USAGE,
    serviceLevel: ServiceLevel.create({ name: "Standard" }),
    accessMethod: AccessMethod.SESSION,
    purchasedAt,
  });
}

function createPurchaseRepository(purchases: Purchase[]): PurchaseRepository {
  return {
    save: async () => {},
    findById: async () => null,
    findByPaymentIntentId: async () => null,
    findByCustomerId: async (customerId) =>
      purchases.filter((purchase) => purchase.customerId === customerId),
    findByNetworkIdentityId: async () => null,
  };
}

describe("ExpireDormantSessions", () => {
  it("expires an active session with no purchases once exactly 15 days have passed since it was created", async () => {
    const sessions = new InMemorySessionRepository();
    const session = createSession("session-001", "customer-001", daysAgo(15));
    await sessions.save(session);

    const service = new ExpireDormantSessions(
      sessions,
      createPurchaseRepository([]),
    );

    const result = await service.execute({ now: NOW });

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("session-001");
    expect(result[0]?.status).toBe(SessionStatus.EXPIRED);
    expect((await sessions.findById("session-001"))?.status).toBe(
      SessionStatus.EXPIRED,
    );
  });

  it("does not expire a session that is 1ms short of 15 days old", async () => {
    const sessions = new InMemorySessionRepository();
    const session = createSession(
      "session-001",
      "customer-001",
      new Date(daysAgo(15).getTime() + 1),
    );
    await sessions.save(session);

    const service = new ExpireDormantSessions(
      sessions,
      createPurchaseRepository([]),
    );

    const result = await service.execute({ now: NOW });

    expect(result).toEqual([]);
    expect((await sessions.findById("session-001"))?.status).toBe(
      SessionStatus.ACTIVE,
    );
  });

  it("keeps an old session alive when the customer purchased within 15 days", async () => {
    const sessions = new InMemorySessionRepository();
    await sessions.save(
      createSession("session-001", "customer-001", daysAgo(20)),
    );

    const service = new ExpireDormantSessions(
      sessions,
      createPurchaseRepository([
        createPurchase("purchase-001", "customer-001", daysAgo(5)),
      ]),
    );

    const result = await service.execute({ now: NOW });

    expect(result).toEqual([]);
    expect((await sessions.findById("session-001"))?.status).toBe(
      SessionStatus.ACTIVE,
    );
  });

  it("expires an old session when the latest purchase is also older than 15 days", async () => {
    const sessions = new InMemorySessionRepository();
    await sessions.save(
      createSession("session-001", "customer-001", daysAgo(20)),
    );

    const service = new ExpireDormantSessions(
      sessions,
      createPurchaseRepository([
        createPurchase("purchase-001", "customer-001", daysAgo(25)),
        createPurchase("purchase-002", "customer-001", daysAgo(18)),
      ]),
    );

    const result = await service.execute({ now: NOW });

    expect(result).toHaveLength(1);
    expect(result[0]?.status).toBe(SessionStatus.EXPIRED);
  });

  // Regression guard for the lockout scenario: a customer dormant for
  // 30 days logs in again (fresh session) and must not be expired
  // immediately because of the old purchase, or they could never reach
  // the purchase endpoint (which requires an active session).
  it("does not expire a fresh session because the customer's last purchase is old", async () => {
    const sessions = new InMemorySessionRepository();
    await sessions.save(
      createSession("session-001", "customer-001", daysAgo(1)),
    );

    const service = new ExpireDormantSessions(
      sessions,
      createPurchaseRepository([
        createPurchase("purchase-001", "customer-001", daysAgo(30)),
      ]),
    );

    const result = await service.execute({ now: NOW });

    expect(result).toEqual([]);
    expect((await sessions.findById("session-001"))?.status).toBe(
      SessionStatus.ACTIVE,
    );
  });

  it.each([SessionStatus.EXPIRED, SessionStatus.REVOKED])(
    "does not touch %s sessions",
    async (status) => {
      const sessions = new InMemorySessionRepository();
      await sessions.save(
        createSession("session-001", "customer-001", daysAgo(20), status),
      );

      const service = new ExpireDormantSessions(
        sessions,
        createPurchaseRepository([]),
      );

      const result = await service.execute({ now: NOW });

      expect(result).toEqual([]);
      expect((await sessions.findById("session-001"))?.status).toBe(status);
    },
  );

  it("evaluates each customer's purchases separately", async () => {
    const sessions = new InMemorySessionRepository();
    await sessions.save(createSession("session-a", "customer-a", daysAgo(20)));
    await sessions.save(createSession("session-b", "customer-b", daysAgo(20)));

    const service = new ExpireDormantSessions(
      sessions,
      createPurchaseRepository([
        createPurchase("purchase-001", "customer-b", daysAgo(2)),
      ]),
    );

    const result = await service.execute({ now: NOW });

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("session-a");
    expect((await sessions.findById("session-a"))?.status).toBe(
      SessionStatus.EXPIRED,
    );
    expect((await sessions.findById("session-b"))?.status).toBe(
      SessionStatus.ACTIVE,
    );
  });
});
