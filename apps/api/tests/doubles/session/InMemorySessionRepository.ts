import type { SessionRepository } from "@application/ports/SessionRepository.js";
import type { Session } from "@domain";

export class InMemorySessionRepository implements SessionRepository {
  private readonly sessions = new Map<string, Session>();

  async save(session: Session): Promise<void> {
    this.sessions.set(session.id, session);
  }

  async findById(id: string): Promise<Session | null> {
    return this.sessions.get(id) ?? null;
  }

  async findActiveByCustomerId(customerId: string): Promise<Session | null> {
    const sessions = [...this.sessions.values()]
      .filter(
        (session) =>
          session.customerId === customerId && session.status === "ACTIVE",
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return sessions[0] ?? null;
  }
}
