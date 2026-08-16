import type { SessionStatus } from "@domain";

export interface CreateSessionResponse {
  id: string;
  customerId: string;
  createdAt: Date;
  expiresAt: Date;
  status: SessionStatus;
}
