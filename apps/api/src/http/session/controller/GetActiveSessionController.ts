import type { FastifyReply, FastifyRequest } from "fastify";

import type { GetActiveSession } from "@application/session/GetActiveSession.js";

export interface GetActiveSessionRequest {
  Params: {
    customerId: string;
  };
}

export class GetActiveSessionController {
  constructor(private readonly getActiveSession: GetActiveSession) {}

  async handle(
    request: FastifyRequest<GetActiveSessionRequest>,
    reply: FastifyReply,
  ): Promise<void> {
    const session = await this.getActiveSession.execute({
      customerId: request.params.customerId,
    });

    if (session === null) {
      await reply.code(404).send({
        message: "Active session not found.",
      });
      return;
    }

    await reply.code(200).send({
      id: session.id,
      customerId: session.customerId,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      status: session.status,
    });
  }
}
