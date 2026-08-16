import type { Session } from "@domain";

export interface SessionRepository {
  save(session: Session): Promise<void>;
  findById(id: string): Promise<Session | null>;
  findActiveByCustomerId(customerId: string): Promise<Session | null>;
}
