import type { FastifyInstance } from "fastify";

import { IntaSendWebhookController } from "@http/payment/controller/IntaSendWebhookController.js";
import { IntaSendWebhookBody } from "@infrastructure/payment/IntaSendWebhook.types.js";
import { intaSendWebhookSchema } from "@infrastructure/payment/IntaSendWebhook.schema.js";

export function createPaymentRoutes(
  intaSendWebhookController: IntaSendWebhookController,
) {
  return async function registerPaymentRoutes(
    server: FastifyInstance,
  ): Promise<void> {
   server.post<{
     Body: IntaSendWebhookBody;
   }>(
     "/payments/intasend/webhook",
     {
       schema: intaSendWebhookSchema,
     },
     async (request, reply) => {
       await intaSendWebhookController.handle(request, reply);
     },
   );
  };
}