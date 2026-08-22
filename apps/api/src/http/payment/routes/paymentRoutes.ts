import type { FastifyInstance } from "fastify";

import { authenticateRequest } from "../../auth/middleware/authenticateRequest.js";
import { IntaSendWebhookController } from "../controller/IntaSendWebhookController.js";
import { PurchasePaymentController } from "../controller/PurchasePaymentController.js";

export function createPaymentRoutes(
  purchasePaymentController: PurchasePaymentController,
  intaSendWebhookController: IntaSendWebhookController,
) {
  return async function paymentRoutes(server: FastifyInstance): Promise<void> {
    server.post(
      "/purchase",
      {
        preHandler: authenticateRequest,
      },
      purchasePaymentController.handle.bind(purchasePaymentController),
    );

    server.post(
      "/intasend/webhook",
      intaSendWebhookController.handle.bind(intaSendWebhookController),
    );
  };
}
