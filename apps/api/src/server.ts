import Fastify from "fastify";

import { createIntaSendWebhookController, createPurchasePaymentController } from "./composition/payment.js";
import { createPaymentRoutes } from "./http/payment/routes/paymentRoutes.js";

export function createServer() {
  const server = Fastify({
    logger: true,
  });

  const purchasePaymentController =
  createPurchasePaymentController();

const intaSendWebhookController =
  createIntaSendWebhookController();

server.register(
  createPaymentRoutes(purchasePaymentController, intaSendWebhookController),
  {
    prefix: "/payments",
  },
);

  return server;
}