import type { FastifyReply, FastifyRequest } from "fastify";

import type { AuthenticateCustomer } from "@application/auth/AuthenticateCustomer.js";

import { authenticateCustomerSchema } from "../schema/AuthenticateCustomer.js";

export interface AuthenticateCustomerRequest {
  Body: {
    phoneNumber: string;
    verificationCode: string;
    sessionExpiresAt: string;
  };
}

export class AuthenticateCustomerController {
  constructor(private readonly authenticateCustomer: AuthenticateCustomer) {}

  async handle(
    request: FastifyRequest<AuthenticateCustomerRequest>,
    reply: FastifyReply,
  ): Promise<void> {
    const body = authenticateCustomerSchema.parse(request.body);

    const result = await this.authenticateCustomer.execute({
      phoneNumber: body.phoneNumber,
      verificationCode: body.verificationCode,
      sessionExpiresAt: new Date(body.sessionExpiresAt),
    });

    await reply.code(200).send({
      customer: {
        id: result.customer.id,
        phoneNumber: result.customer.phoneNumber,
      },
      sessionId: result.sessionId,
      accessToken: result.accessToken,
    });
  }
}
