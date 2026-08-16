import type { Session } from "@domain";

import type { SessionRepository } from "@application/ports/SessionRepository.js";

export interface GetActiveSessionCommand {
  customerId: string;
}

export interface GetActiveSessionUseCase {
  execute(command: GetActiveSessionCommand): Promise<Session | null>;
}

export class GetActiveSession implements GetActiveSessionUseCase {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(command: GetActiveSessionCommand): Promise<Session | null> {
    return this.sessionRepository.findActiveByCustomerId(command.customerId);
  }
}
