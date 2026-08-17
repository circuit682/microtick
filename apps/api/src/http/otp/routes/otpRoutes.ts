import type { FastifyInstance } from "fastify";

import { CreateOtpChallengeController } from "../controller/CreateOtpChallengeController.js";
import { VerifyOtpCodeController } from "../controller/VerifyOtpCodeController.js";

export function createOtpRoutes(
  createOtpChallengeController: CreateOtpChallengeController,
  verifyOtpCodeController: VerifyOtpCodeController,
) {
  return async function otpRoutes(server: FastifyInstance): Promise<void> {
    server.post(
      "/challenge",
      createOtpChallengeController.handle.bind(createOtpChallengeController),
    );

    server.post(
      "/verify",
      verifyOtpCodeController.handle.bind(verifyOtpCodeController),
    );
  };
}
