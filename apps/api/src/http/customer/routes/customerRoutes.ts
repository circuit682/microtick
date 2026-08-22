import type { FastifyInstance } from "fastify";

import { authenticateRequest } from "../../auth/middleware/authenticateRequest.js";
import { GetCustomerController } from "../controller/GetCustomerController.js";

export function createCustomerRoutes(
  getCustomerController: GetCustomerController,
) {
  return async function customerRoutes(server: FastifyInstance): Promise<void> {
    server.get<{ Params: { customerId: string } }>(
      "/:customerId",
      {
        preHandler: authenticateRequest,
      },
      getCustomerController.handle.bind(getCustomerController),
    );
  };
}
