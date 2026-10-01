import { CreateSession } from "@application/session/CreateSession.js";
import { ExpireDormantSessions } from "@application/session/ExpireDormantSessions.js";
import { ExpireExpiredSessions } from "@application/session/ExpireExpiredSessions.js";
import { GetActiveSession } from "@application/session/GetActiveSession.js";
import { IntervalPoller } from "@application/access/IntervalPoller.js";

import { CreateSessionController } from "@http/session/controller/CreateSessionController.js";
import { GetActiveSessionController } from "@http/session/controller/GetActiveSessionController.js";

import { UlidIdentifierGenerator } from "@infrastructure/identity/UlidIdentifierGenerator.js";
import { PrismaPurchaseRepository } from "@infrastructure/purchase/PrismaPurchaseRepository.js";
import { PrismaSessionRepository } from "@infrastructure/session/PrismaSessionRepository.js";

export function createCreateSessionController(): CreateSessionController {
  const sessionRepository = new PrismaSessionRepository();

  const identifierGenerator = new UlidIdentifierGenerator();

  const createSession = new CreateSession(
    sessionRepository,
    identifierGenerator,
  );

  return new CreateSessionController(createSession);
}

export function createGetActiveSessionController(): GetActiveSessionController {
  const sessionRepository = new PrismaSessionRepository();

  const getActiveSession = new GetActiveSession(sessionRepository);

  return new GetActiveSessionController(getActiveSession);
}

// Session hygiene (time-based expiry, 15-day dormancy expiry) has no
// dependency on RouterOS and must keep running even when the RouterOS
// CHR is unreachable -- see apps/api/src/composition/access.ts, whose
// poller is gated behind a successful RouterOsClient.connect(). This
// poller is deliberately separate and started independently in
// server.ts.
//
// Runs every 60 seconds rather than the 1-second RouterOS poller
// interval: ExpireDormantSessions does a full session scan plus one
// purchase lookup per active session, and a 15-day-scale window has
// no need for sub-second checking.
export function createSessionHygienePoller(): IntervalPoller {
  const sessionRepository = new PrismaSessionRepository();
  const purchaseRepository = new PrismaPurchaseRepository();

  const expireExpiredSessions = new ExpireExpiredSessions(sessionRepository);
  const expireDormantSessions = new ExpireDormantSessions(
    sessionRepository,
    purchaseRepository,
  );

  return new IntervalPoller(async () => {
    const now = new Date();
    await expireExpiredSessions.execute({ now });
    await expireDormantSessions.execute({ now });
  }, 60_000);
}
