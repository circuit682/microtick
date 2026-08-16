import type { FastifyReply, FastifyRequest } from "fastify";

import type { CreateSession } from "@application/session/CreateSession.js";

export interface CreateSessionRequest {
  Params: {
    customerId: string;
  };

  Body: {
    expiresAt: string;
  };
}

export class CreateSessionController {
  constructor(private readonly createSession: CreateSession) {}

  async handle(
    request: FastifyRequest<CreateSessionRequest>,
    reply: FastifyReply,
  ): Promise<void> {
    const session = await this.createSession.execute({
      customerId: request.params.customerId,
      expiresAt: new Date(request.body.expiresAt),
    });

    await reply.code(201).send({
      id: session.id,
      customerId: session.customerId,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      status: session.status,
    });
  }
}
