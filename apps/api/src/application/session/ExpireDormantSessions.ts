import type { PurchaseRepository } from "@application/ports/PurchaseRepository.js";
import type { SessionRepository } from "@application/ports/SessionRepository.js";

import { SessionStatus } from "@domain";
import type { Session } from "@domain";

const DORMANCY_WINDOW_MS = 15 * 24 * 60 * 60 * 1000;

export interface ExpireDormantSessionsCommand {
  now: Date;
}

export class ExpireDormantSessions {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly purchaseRepository: PurchaseRepository,
  ) {}

  async execute(command: ExpireDormantSessionsCommand): Promise<Session[]> {
    const sessions = await this.sessionRepository.findAll();
    const expired: Session[] = [];

    for (const session of sessions) {
      if (session.status !== SessionStatus.ACTIVE) {
        continue;
      }

      const purchases = await this.purchaseRepository.findByCustomerId(
        session.customerId,
      );

      // Last activity is the later of the session's own creation (a fresh
      // OTP login) and the customer's most recent purchase. Measuring from
      // the purchase alone would expire a just-created session for a
      // long-dormant customer, locking them out of the purchase endpoint.
      const lastActivityAt = purchases.reduce(
        (latest, purchase) =>
          purchase.purchasedAt > latest ? purchase.purchasedAt : latest,
        session.createdAt,
      );

      if (
        command.now.getTime() - lastActivityAt.getTime() <
        DORMANCY_WINDOW_MS
      ) {
        continue;
      }

      const expiredSession = session.expire();
      await this.sessionRepository.save(expiredSession);
      expired.push(expiredSession);
    }

    return expired;
  }
}
