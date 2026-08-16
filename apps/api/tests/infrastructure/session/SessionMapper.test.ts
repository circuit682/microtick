import { describe, expect, it } from "vitest";

import { Session, SessionStatus } from "@domain";

import { SessionMapper } from "@infrastructure/session/SessionMapper.js";

describe("SessionMapper", () => {
  const createdAt = new Date("2026-08-16T10:00:00Z");
  const expiresAt = new Date("2026-08-16T11:00:00Z");

  it("should map a domain session to persistence data", () => {
    const session = Session.create({
      id: "session-001",
      customerId: "customer-001",
      createdAt,
      expiresAt,
      status: SessionStatus.ACTIVE,
    });

    const persistence = SessionMapper.toPersistence(session);

    expect(persistence).toEqual({
      id: "session-001",
      customerId: "customer-001",
      createdAt,
      expiresAt,
      status: SessionStatus.ACTIVE,
    });
  });

  it("should map persistence data back to the domain", () => {
    const domain = SessionMapper.toDomain({
      id: "session-001",
      customerId: "customer-001",
      createdAt,
      expiresAt,
      status: SessionStatus.ACTIVE,
    });

    expect(domain.id).toBe("session-001");
    expect(domain.customerId).toBe("customer-001");
    expect(domain.createdAt).toEqual(createdAt);
    expect(domain.expiresAt).toEqual(expiresAt);
    expect(domain.status).toBe(SessionStatus.ACTIVE);
  });
});
