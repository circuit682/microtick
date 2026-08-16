import type { FastifyReply, FastifyRequest } from "fastify";

import type { GetCustomer } from "@application/customer/GetCustomer.js";

export interface GetCustomerRequest {
  Params: {
    customerId: string;
  };
}

export class GetCustomerController {
  constructor(private readonly getCustomer: GetCustomer) {}

  async handle(
    request: FastifyRequest<GetCustomerRequest>,
    reply: FastifyReply,
  ): Promise<void> {
    const customer = await this.getCustomer.execute({
      customerId: request.params.customerId,
    });

    if (customer === null) {
      await reply.code(404).send({
        message: "Customer not found.",
      });
      return;
    }

    await reply.code(200).send({
      id: customer.id,
      phoneNumber: customer.phoneNumber,
    });
  }
}
