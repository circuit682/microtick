import Fastify from "fastify";

import { createIntaSendWebhookController } from "./composition/payment.js";
import { createPaymentRoutes } from "./http/payment/routes/paymentRoutes.js";

export function createServer() {
  const server = Fastify({
    logger: true,
  });

  const intaSendWebhookController =
    createIntaSendWebhookController();

  server.register(
    createPaymentRoutes(intaSendWebhookController),
  );

  return server;
}