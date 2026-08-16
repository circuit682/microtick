import { describe, expect, it } from "vitest";

import { GetActiveSession } from "@application/session/GetActiveSession.js";

import { Session, SessionStatus } from "@domain";

import { InMemorySessionRepository } from "../../doubles/session/InMemorySessionRepository.js";

describe("GetActiveSession", () => {
  it("should return the customer's active session", async () => {
    const repository = new InMemorySessionRepository();

    const session = Session.create({
      id: "session-001",
      customerId: "customer-001",
      createdAt: new Date("2026-08-16T12:00:00Z"),
      expiresAt: new Date("2026-08-16T13:00:00Z"),
      status: SessionStatus.ACTIVE,
    });

    await repository.save(session);

    const getActiveSession = new GetActiveSession(repository);

    const result = await getActiveSession.execute({
      customerId: "customer-001",
    });

    expect(result).not.toBeNull();
    expect(result?.id).toBe(session.id);
    expect(result?.customerId).toBe(session.customerId);
    expect(result?.status).toBe(SessionStatus.ACTIVE);
  });

  it("should return null when the customer has no active session", async () => {
    const repository = new InMemorySessionRepository();

    const session = Session.create({
      id: "session-001",
      customerId: "customer-001",
      createdAt: new Date("2026-08-16T12:00:00Z"),
      expiresAt: new Date("2026-08-16T13:00:00Z"),
      status: SessionStatus.EXPIRED,
    });

    await repository.save(session);

    const getActiveSession = new GetActiveSession(repository);

    const result = await getActiveSession.execute({
      customerId: "customer-001",
    });

    expect(result).toBeNull();
  });
});
