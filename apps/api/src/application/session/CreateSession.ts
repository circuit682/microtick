import { Session, SessionStatus } from "@domain";

import type { SessionRepository } from "@application/ports/SessionRepository.js";

import { ErrorCode, ValidationError } from "@shared";
import type { IdentifierGenerator } from "@shared";

const MAX_SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

export interface CreateSessionCommand {
  customerId: string;
  expiresAt: Date;
}

export interface CreateSessionUseCase {
  execute(command: CreateSessionCommand): Promise<Session>;
}

export class CreateSession implements CreateSessionUseCase {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly identifierGenerator: IdentifierGenerator,
  ) {}

  async execute(command: CreateSessionCommand): Promise<Session> {
    const createdAt = new Date();

    if (
      command.expiresAt.getTime() - createdAt.getTime() >
      MAX_SESSION_LIFETIME_MS
    ) {
      throw new ValidationError(
        ErrorCode.SESSION_EXPIRATION_TOO_LONG,
        "Session expiration cannot exceed 30 days.",
        {
          requestedExpiresAt: command.expiresAt,
          maxLifetimeMs: MAX_SESSION_LIFETIME_MS,
        },
      );
    }

    const session = Session.create({
      id: this.identifierGenerator.generate(),
      customerId: command.customerId,
      createdAt,
      expiresAt: command.expiresAt,
      status: SessionStatus.ACTIVE,
    });

    await this.sessionRepository.save(session);

    return session;
  }
}
