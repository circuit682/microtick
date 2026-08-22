import type { FastifyInstance } from "fastify";

import { AuthenticateCustomerController } from "../controller/AuthenticateCustomerController.js";

export function createAuthRoutes(
  authenticateCustomerController: AuthenticateCustomerController,
) {
  return async function authRoutes(server: FastifyInstance): Promise<void> {
    server.post(
      "/authenticate",
      authenticateCustomerController.handle.bind(
        authenticateCustomerController,
      ),
    );
  };
}
