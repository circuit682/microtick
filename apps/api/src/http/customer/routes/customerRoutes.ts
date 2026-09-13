import type { FastifyInstance } from "fastify";

import { authenticateRequest } from "../../auth/middleware/authenticateRequest.js";
import { GetCustomerController } from "../controller/GetCustomerController.js";
import { GetCustomerInternetAccessController } from "../controller/GetCustomerInternetAccessController.js";
import { GetCustomerPurchasesController } from "../controller/GetCustomerPurchasesController.js";

export function createCustomerRoutes(
  getCustomerController: GetCustomerController,
  getCustomerInternetAccessController: GetCustomerInternetAccessController,
  getCustomerPurchasesController: GetCustomerPurchasesController,
) {
  return async function customerRoutes(server: FastifyInstance): Promise<void> {
    server.get<{ Params: { customerId: string } }>(
      "/:customerId",
      {
        preHandler: authenticateRequest,
      },
      getCustomerController.handle.bind(getCustomerController),
    );

    server.get<{ Params: { customerId: string } }>(
      "/:customerId/access",
      {
        preHandler: authenticateRequest,
      },
      getCustomerInternetAccessController.handle.bind(
        getCustomerInternetAccessController,
      ),
    );

    server.get<{ Params: { customerId: string } }>(
      "/:customerId/purchases",
      {
        preHandler: authenticateRequest,
      },
      getCustomerPurchasesController.handle.bind(
        getCustomerPurchasesController,
      ),
    );
  };
}
