import { describe, expect, it } from "vitest";

import { ExpireExpiredSessions } from "@application/session/ExpireExpiredSessions.js";
import type { SessionRepository } from "@application/ports/SessionRepository.js";
import { Session, SessionStatus } from "@domain";

class FakeSessionRepository implements SessionRepository {
  public sessions: Session[] = [];
  public savedSessions: Session[] = [];

  async save(session: Session): Promise<void> {
    this.savedSessions.push(session);
    const index = this.sessions.findIndex((s) => s.id === session.id);
    if (index >= 0) {
      this.sessions[index] = session;
    } else {
      this.sessions.push(session);
    }
  }

  async findById(id: string): Promise<Session | null> {
    return this.sessions.find((s) => s.id === id) || null;
  }

  async findActiveByCustomerId(customerId: string): Promise<Session | null> {
    return (
      this.sessions.find(
        (s) => s.customerId === customerId && s.status === SessionStatus.ACTIVE,
      ) || null
    );
  }

  async findAll(): Promise<Session[]> {
    return this.sessions;
  }
}

describe("ExpireExpiredSessions", () => {
  it("expires ACTIVE sessions whose expiresAt is before or equal to now", async () => {
    const repository = new FakeSessionRepository();
    const useCase = new ExpireExpiredSessions(repository);

    const now = new Date("2026-09-28T12:00:00Z");

    const pastActive = Session.reconstitute({
      id: "session-1",
      customerId: "customer-1",
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      expiresAt: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
      status: SessionStatus.ACTIVE,
    });

    const futureActive = Session.reconstitute({
      id: "session-2",
      customerId: "customer-2",
      createdAt: now,
      expiresAt: new Date(now.getTime() + 1 * 60 * 60 * 1000), // 1 hour from now
      status: SessionStatus.ACTIVE,
    });

    const exactlyNowActive = Session.reconstitute({
      id: "session-3",
      customerId: "customer-3",
      createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      expiresAt: now, // Exactly now
      status: SessionStatus.ACTIVE,
    });

    const pastRevoked = Session.reconstitute({
      id: "session-4",
      customerId: "customer-4",
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      expiresAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      status: SessionStatus.REVOKED,
    });

    repository.sessions = [
      pastActive,
      futureActive,
      exactlyNowActive,
      pastRevoked,
    ];

    await useCase.execute({ now });

    // Should only have saved the two that needed expiring
    expect(repository.savedSessions).toHaveLength(2);
    expect(repository.savedSessions.map((s) => s.id)).toContain("session-1");
    expect(repository.savedSessions.map((s) => s.id)).toContain("session-3");

    // The saved sessions should now be EXPIRED
    expect(
      repository.savedSessions.every((s) => s.status === SessionStatus.EXPIRED),
    ).toBe(true);

    // The repository's state should reflect the updates, while leaving the others alone
    expect((await repository.findById("session-1"))?.status).toBe(
      SessionStatus.EXPIRED,
    );
    expect((await repository.findById("session-2"))?.status).toBe(
      SessionStatus.ACTIVE,
    );
    expect((await repository.findById("session-3"))?.status).toBe(
      SessionStatus.EXPIRED,
    );
    expect((await repository.findById("session-4"))?.status).toBe(
      SessionStatus.REVOKED,
    );
  });
});
