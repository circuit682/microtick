import { SessionRepository } from "@application/ports/SessionRepository.js";
import { Session, SessionStatus } from "@domain";

import { prisma } from "@infrastructure/database/prisma.js";

import { SessionMapper } from "./SessionMapper.js";

export class PrismaSessionRepository implements SessionRepository {
  async save(session: Session): Promise<void> {
    const data = SessionMapper.toPersistence(session);

    await prisma.session.upsert({
      where: {
        id: data.id,
      },
      create: data,
      update: data,
    });
  }

  async findById(id: string): Promise<Session | null> {
    const session = await prisma.session.findUnique({
      where: {
        id,
      },
    });

    if (!session) {
      return null;
    }

    return SessionMapper.toDomain(session);
  }

  async findActiveByCustomerId(customerId: string): Promise<Session | null> {
    const session = await prisma.session.findFirst({
      where: {
        customerId,
        status: SessionStatus.ACTIVE,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!session) {
      return null;
    }

    return SessionMapper.toDomain(session);
  }

  async findAll(): Promise<Session[]> {
    const sessions = await prisma.session.findMany();
    return sessions.map((session) => SessionMapper.toDomain(session));
  }
}
