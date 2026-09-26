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

    // Currently unreachable through this route's live wiring: reaching
    // this handler at all requires authenticateRequest to have already
    // verified a real, ACTIVE Session for this customer, so
    // getActiveSession.execute() will always resolve one. Kept
    // deliberately rather than pruned -- GetActiveSession.ts itself is
    // a general-purpose use case with no inherent tie to this route or
    // its middleware, and a future caller without the same guarantee
    // (e.g. an admin querying a customer's active session, per the
    // roadmap's Admin System milestone) would need this branch. Same
    // category of finding as GetCustomerController's dead 404 branch.
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
