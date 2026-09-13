import type { FastifyReply, FastifyRequest } from "fastify";

import type { GetCustomerInternetAccess } from "@application/access/GetCustomerInternetAccess.js";

export interface GetCustomerInternetAccessRequest {
  Params: {
    customerId: string;
  };
}

export class GetCustomerInternetAccessController {
  constructor(
    private readonly getCustomerInternetAccess: GetCustomerInternetAccess,
  ) {}

  async handle(
    request: FastifyRequest<GetCustomerInternetAccessRequest>,
    reply: FastifyReply,
  ): Promise<void> {
    const access = await this.getCustomerInternetAccess.execute({
      customerId: request.params.customerId,
    });

    if (access === null) {
      await reply.code(404).send({
        message: "Internet access not found.",
      });
      return;
    }

    await reply.code(200).send({
      id: access.id,
      purchaseId: access.purchaseId,
      customerId: access.customerId,
      grantedAt: access.grantedAt,
      expiresAt: access.expiresAt,
      status: access.status,
      consumedMinutes: access.consumedMinutes,
    });
  }
}
