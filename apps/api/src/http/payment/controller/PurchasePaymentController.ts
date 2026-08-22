import type { FastifyReply, FastifyRequest } from "fastify";

import { PurchasePlan } from "@application/plan/PurchasePlan.js";

import { parsePurchasePayment } from "@http/payment/schema/PurchasePayment.js";
import type { AuthenticatedRequest } from "@http/auth/middleware/authenticateRequest.js";

import type { PurchasePaymentResponse } from "../dto/PurchasePaymentResponse.types.js";

export class PurchasePaymentController {
  constructor(private readonly purchasePlan: PurchasePlan) {}

  async handle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = parsePurchasePayment(request.body);

    const authenticatedRequest = request as AuthenticatedRequest;

    const result = await this.purchasePlan.execute({
      customerId: authenticatedRequest.auth.customerId,
      planId: body.planId,
      phoneNumber: body.phoneNumber,
    });

    const response: PurchasePaymentResponse = {
      providerRequestId: result.providerRequestId,
      checkoutUrl: result.checkoutUrl,
    };

    await reply.status(201).send(response);
  }
}
