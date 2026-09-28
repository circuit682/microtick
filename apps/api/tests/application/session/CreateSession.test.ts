import { describe, expect, it, vi } from "vitest";

import { CreateSession } from "@application/session/CreateSession.js";

import { SessionStatus } from "@domain";

import { UlidIdentifierGenerator } from "@infrastructure/identity/UlidIdentifierGenerator.js";

import { InMemorySessionRepository } from "../../doubles/session/InMemorySessionRepository.js";

describe("CreateSession", () => {
  it("should create and persist an active session", async () => {
    const repository = new InMemorySessionRepository();

    const identifierGenerator = new UlidIdentifierGenerator();

    const createdAt = new Date("2026-08-16T12:00:00Z");
    const expiresAt = new Date("2026-08-16T13:00:00Z");

    vi.useFakeTimers();
    vi.setSystemTime(createdAt);

    const createSession = new CreateSession(repository, identifierGenerator);

    const session = await createSession.execute({
      customerId: "customer-001",
      expiresAt,
    });

    expect(session.id).toBeTruthy();
    expect(session.customerId).toBe("customer-001");
    expect(session.createdAt).toEqual(createdAt);
    expect(session.expiresAt).toEqual(expiresAt);
    expect(session.status).toBe(SessionStatus.ACTIVE);

    const stored = await repository.findById(session.id);

    expect(stored).not.toBeNull();
    expect(stored?.id).toBe(session.id);
    expect(stored?.customerId).toBe(session.customerId);
    expect(stored?.expiresAt).toEqual(expiresAt);
    expect(stored?.status).toBe(SessionStatus.ACTIVE);

    vi.useRealTimers();
  });

  it("should create a session whose expiration is exactly 30 days away", async () => {
    const repository = new InMemorySessionRepository();

    const identifierGenerator = new UlidIdentifierGenerator();

    const createdAt = new Date("2026-08-16T12:00:00Z");
    const expiresAt = new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000);

    vi.useFakeTimers();
    vi.setSystemTime(createdAt);

    try {
      const createSession = new CreateSession(repository, identifierGenerator);

      const session = await createSession.execute({
        customerId: "customer-002",
        expiresAt,
      });

      expect(session.expiresAt).toEqual(expiresAt);
    } finally {
      vi.useRealTimers();
    }
  });

  it("should reject a session expiration beyond the 30-day maximum", async () => {
    const repository = new InMemorySessionRepository();

    const identifierGenerator = new UlidIdentifierGenerator();

    const createdAt = new Date("2026-08-16T12:00:00Z");
    const expiresAt = new Date(
      createdAt.getTime() + 30 * 24 * 60 * 60 * 1000 + 1,
    );

    vi.useFakeTimers();
    vi.setSystemTime(createdAt);

    try {
      const createSession = new CreateSession(repository, identifierGenerator);

      await expect(
        createSession.execute({
          customerId: "customer-003",
          expiresAt,
        }),
      ).rejects.toThrow("Session expiration cannot exceed 30 days.");

      const stored = await repository.findActiveByCustomerId("customer-003");

      expect(stored).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});
