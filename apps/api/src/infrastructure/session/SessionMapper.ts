import type { Session as PrismaSession } from "@generated/prisma/client.js";

import { Session, SessionStatus } from "@domain";

export class SessionMapper {
  static toDomain(session: PrismaSession): Session {
    return Session.reconstitute({
      id: session.id,
      customerId: session.customerId,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      status: session.status as SessionStatus,
    });
  }

  static toPersistence(session: Session): {
    id: string;
    customerId: string;
    createdAt: Date;
    expiresAt: Date;
    status: SessionStatus;
  } {
    return {
      id: session.id,
      customerId: session.customerId,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      status: session.status,
    };
  }
}
