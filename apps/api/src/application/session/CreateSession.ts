import { Session, SessionStatus } from "@domain";

import type { SessionRepository } from "@application/ports/SessionRepository.js";

import type { IdentifierGenerator } from "@shared";

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
    const session = Session.create({
      id: this.identifierGenerator.generate(),
      customerId: command.customerId,
      createdAt: new Date(),
      expiresAt: command.expiresAt,
      status: SessionStatus.ACTIVE,
    });

    await this.sessionRepository.save(session);

    return session;
  }
}
