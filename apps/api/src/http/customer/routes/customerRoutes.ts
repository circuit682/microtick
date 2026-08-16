import type { FastifyInstance } from "fastify";

import { GetCustomerController } from "../controller/GetCustomerController.js";

export function createCustomerRoutes(
  getCustomerController: GetCustomerController,
) {
  return async function customerRoutes(server: FastifyInstance): Promise<void> {
    server.get(
      "/:customerId",
      getCustomerController.handle.bind(getCustomerController),
    );
  };
}
