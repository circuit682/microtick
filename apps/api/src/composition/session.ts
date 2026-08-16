import { CreateSession } from "@application/session/CreateSession.js";
import { GetActiveSession } from "@application/session/GetActiveSession.js";

import { CreateSessionController } from "@http/session/controller/CreateSessionController.js";
import { GetActiveSessionController } from "@http/session/controller/GetActiveSessionController.js";

import { UlidIdentifierGenerator } from "@infrastructure/identity/UlidIdentifierGenerator.js";
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
