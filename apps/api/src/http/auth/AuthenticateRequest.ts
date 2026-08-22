import type { FastifyReply, FastifyRequest } from "fastify";

import type { AccessTokenService } from "@application/ports/AccessTokenService.js";

export interface AuthenticatedRequest extends FastifyRequest {
  auth: {
    customerId: string;
    sessionId: string;
  };
}

export function createAuthenticateRequest(
  accessTokenService: AccessTokenService,
) {
  return async function authenticateRequest(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const authorization = request.headers.authorization;

    if (!authorization) {
      await reply.code(401).send({
        message: "Authentication required.",
      });
      return;
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      await reply.code(401).send({
        message: "Invalid authorization header.",
      });
      return;
    }

    try {
      const verified = await accessTokenService.verify(token);

      (request as AuthenticatedRequest).auth = verified;
    } catch {
      await reply.code(401).send({
        message: "Invalid access token.",
      });
    }
  };
}
