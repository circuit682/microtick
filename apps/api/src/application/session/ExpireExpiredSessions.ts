import type { SessionRepository } from "../ports/SessionRepository.js";
import { SessionStatus } from "@domain";

export interface ExpireExpiredSessionsCommand {
  now: Date;
}

export class ExpireExpiredSessions {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(command: ExpireExpiredSessionsCommand): Promise<void> {
    const sessions = await this.sessionRepository.findAll();

    const expiredSessions = sessions.filter(
      (session) =>
        session.status === SessionStatus.ACTIVE &&
        session.expiresAt <= command.now,
    );

    for (const session of expiredSessions) {
      const expiredSession = session.expire();
      await this.sessionRepository.save(expiredSession);
    }
  }
}
