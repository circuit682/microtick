import type { FastifyReply, FastifyRequest } from "fastify";

import { env } from "@config/env.js";
import { JwtAccessTokenService } from "@infrastructure/auth/JwtAccessTokenService.js";
import { PrismaSessionRepository } from "@infrastructure/session/PrismaSessionRepository.js";

import { SessionStatus } from "@domain";

const accessTokenService = new JwtAccessTokenService({
  secret: env.security.jwtSecret,
  issuer: env.security.jwtIssuer,
  audience: env.security.jwtAudience,
});

const sessionRepository = new PrismaSessionRepository();

export interface AuthenticatedRequest extends FastifyRequest {
  auth: {
    customerId: string;
    sessionId: string;
  };
}

export async function authenticateRequest(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    await reply.code(401).send({
      message: "Authentication required.",
    });
    return;
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    await reply.code(401).send({
      message: "Authentication required.",
    });
    return;
  }

  try {
    const claims = await accessTokenService.verify(token);

    (request as AuthenticatedRequest).auth = claims;
  } catch {
    await reply.code(401).send({
      message: "Invalid access token.",
    });
    return;
  }

  const session = await sessionRepository.findById(
    (request as AuthenticatedRequest).auth.sessionId,
  );

  if (session === null || session.status !== SessionStatus.ACTIVE) {
    await reply.code(401).send({
      message: "Session is no longer active.",
    });
    return;
  }

  const customerId = (request.params as { customerId?: string }).customerId;

  if (
    customerId &&
    customerId !== (request as AuthenticatedRequest).auth.customerId
  ) {
    await reply.code(403).send({
      message: "You are not authorized to access this customer.",
    });
    return;
  }
}
