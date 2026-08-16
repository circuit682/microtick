import type { SessionStatus } from "@domain";

export interface GetActiveSessionResponse {
  id: string;
  customerId: string;
  createdAt: Date;
  expiresAt: Date;
  status: SessionStatus;
}
