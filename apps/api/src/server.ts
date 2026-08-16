import Fastify from "fastify";

import {
  createIntaSendWebhookController,
  createPurchasePaymentController,
} from "./composition/payment.js";
import { createPaymentRoutes } from "./http/payment/routes/paymentRoutes.js";

import { createGetCustomerController } from "./composition/customer.js";

import {
  createCreateSessionController,
  createGetActiveSessionController,
} from "./composition/session.js";

import { createCustomerRoutes } from "./http/customer/routes/customerRoutes.js";
import { createSessionRoutes } from "./http/session/routes/sessionRoutes.js";

export function createServer() {
  const server = Fastify({
    logger: true,
  });

  const purchasePaymentController = createPurchasePaymentController();

  const intaSendWebhookController = createIntaSendWebhookController();

  const getCustomerController = createGetCustomerController();

  const createSessionController = createCreateSessionController();

  const getActiveSessionController = createGetActiveSessionController();

  server.register(
    createPaymentRoutes(purchasePaymentController, intaSendWebhookController),
    {
      prefix: "/payments",
    },
  );

  server.register(createCustomerRoutes(getCustomerController), {
    prefix: "/customers",
  });

  server.register(
    createSessionRoutes(createSessionController, getActiveSessionController),
    {
      prefix: "/customers",
    },
  );

  return server;
}
