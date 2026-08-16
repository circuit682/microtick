import { describe, expect, it } from "vitest";

import { Session, SessionStatus } from "@domain";

describe("Session", () => {
  const createdAt = new Date("2026-08-16T10:00:00Z");
  const expiresAt = new Date("2026-08-16T11:00:00Z");

  function createSession() {
    return Session.create({
      id: "session-001",
      customerId: "customer-001",
      createdAt,
      expiresAt,
      status: SessionStatus.ACTIVE,
    });
  }

  it("should create a valid session", () => {
    const session = createSession();

    expect(session.id).toBe("session-001");
    expect(session.customerId).toBe("customer-001");
    expect(session.createdAt).toEqual(createdAt);
    expect(session.expiresAt).toEqual(expiresAt);
    expect(session.status).toBe(SessionStatus.ACTIVE);
  });

  it("should reject an empty id", () => {
    expect(() =>
      Session.create({
        id: "",
        customerId: "customer-001",
        createdAt,
        expiresAt,
        status: SessionStatus.ACTIVE,
      }),
    ).toThrow();
  });

  it("should reject an empty customer id", () => {
    expect(() =>
      Session.create({
        id: "session-001",
        customerId: "",
        createdAt,
        expiresAt,
        status: SessionStatus.ACTIVE,
      }),
    ).toThrow();
  });

  it("should reject expiration before creation", () => {
    const invalidExpiresAt = new Date("2026-08-16T09:00:00Z");

    expect(() =>
      Session.create({
        id: "session-001",
        customerId: "customer-001",
        createdAt,
        expiresAt: invalidExpiresAt,
        status: SessionStatus.ACTIVE,
      }),
    ).toThrow();
  });

  it("should change ACTIVE to EXPIRED immutably", () => {
    const session = createSession();

    const expired = session.expire();

    expect(expired).not.toBe(session);
    expect(session.status).toBe(SessionStatus.ACTIVE);
    expect(expired.status).toBe(SessionStatus.EXPIRED);

    expect(expired.id).toBe(session.id);
    expect(expired.customerId).toBe(session.customerId);
    expect(expired.createdAt).toEqual(session.createdAt);
    expect(expired.expiresAt).toEqual(session.expiresAt);
  });

  it("should change ACTIVE to REVOKED immutably", () => {
    const session = createSession();

    const revoked = session.revoke();

    expect(revoked).not.toBe(session);
    expect(session.status).toBe(SessionStatus.ACTIVE);
    expect(revoked.status).toBe(SessionStatus.REVOKED);

    expect(revoked.id).toBe(session.id);
    expect(revoked.customerId).toBe(session.customerId);
    expect(revoked.createdAt).toEqual(session.createdAt);
    expect(revoked.expiresAt).toEqual(session.expiresAt);
  });
});
