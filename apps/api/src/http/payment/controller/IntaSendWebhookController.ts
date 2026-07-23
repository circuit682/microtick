import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import { ReceivePaymentConfirmation } from "@application/payment/ReceivePaymentConfirmation.js";

import { parseIntaSendWebhook } from "@http/payment/schema/IntaSendWebhook.js";

import type {
  IntaSendWebhookResponse,
} from "../dto/IntaSendWebhookResponse.types.js";

export class IntaSendWebhookController {
  constructor(
    private readonly receivePaymentConfirmation: ReceivePaymentConfirmation,
  ) {}

  async handle(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const body = parseIntaSendWebhook(
      request.body,
    );

    await this.receivePaymentConfirmation.execute({
      reference: body.reference,
    });

    const response: IntaSendWebhookResponse = {
      message: "Payment confirmation received.",
    };

    await reply.status(200).send(response);
  }
}