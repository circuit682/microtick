import type { FastifyInstance } from "fastify";

import { DomainError } from "@shared";

export function registerErrorHandler(server: FastifyInstance): void {
  server.setErrorHandler((error, request, reply) => {
    if (error instanceof DomainError) {
      request.log.warn(error);

      const statusCode = error.code.startsWith("AUTH_") ? 401 : 400;

      void reply.code(statusCode).send({
        code: error.code,
        message: error.message,
      });

      return;
    }

    request.log.error(error);

    void reply.code(500).send({
      message: "Internal server error.",
    });
  });
}
