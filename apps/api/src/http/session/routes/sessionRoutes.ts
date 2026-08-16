import type { FastifyInstance } from "fastify";

import { CreateSessionController } from "../controller/CreateSessionController.js";
import { GetActiveSessionController } from "../controller/GetActiveSessionController.js";

export function createSessionRoutes(
  createSessionController: CreateSessionController,
  getActiveSessionController: GetActiveSessionController,
) {
  return async function sessionRoutes(server: FastifyInstance): Promise<void> {
    server.post(
      "/:customerId/session",
      createSessionController.handle.bind(createSessionController),
    );

    server.get(
      "/:customerId/session",
      getActiveSessionController.handle.bind(getActiveSessionController),
    );
  };
}
