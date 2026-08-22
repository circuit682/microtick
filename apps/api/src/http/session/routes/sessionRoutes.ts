import type { FastifyInstance } from "fastify";

import { authenticateRequest } from "../../auth/middleware/authenticateRequest.js";
import { CreateSessionController } from "../controller/CreateSessionController.js";
import { GetActiveSessionController } from "../controller/GetActiveSessionController.js";

export function createSessionRoutes(
  createSessionController: CreateSessionController,
  getActiveSessionController: GetActiveSessionController,
) {
  return async function sessionRoutes(server: FastifyInstance): Promise<void> {
    server.post<{
      Params: {
        customerId: string;
      };
      Body: {
        expiresAt: string;
      };
    }>(
      "/:customerId/session",
      {
        preHandler: authenticateRequest,
      },
      createSessionController.handle.bind(createSessionController),
    );

    server.get<{
      Params: {
        customerId: string;
      };
    }>(
      "/:customerId/session",
      {
        preHandler: authenticateRequest,
      },
      getActiveSessionController.handle.bind(getActiveSessionController),
    );
  };
}
