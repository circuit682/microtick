import type { FastifyReply, FastifyRequest } from "fastify";

import type { CreateOtpChallenge } from "@application/otp/CreateOtpChallenge.js";
import type { OtpDeliveryService } from "@infrastructure/otp/OtpDeliveryService.js";

import type { CreateOtpChallengeResponse } from "../dto/CreateOtpChallengeResponse.types.js";
import { createOtpChallengeSchema } from "../schema/CreateOtpChallenge.js";

interface CreateOtpChallengeRequest {
  Body: {
    phoneNumber: string;
  };
}

export class CreateOtpChallengeController {
  constructor(
    private readonly createOtpChallenge: CreateOtpChallenge,
    private readonly otpDeliveryService: OtpDeliveryService,
  ) {}

  async handle(
    request: FastifyRequest<CreateOtpChallengeRequest>,
    reply: FastifyReply,
  ): Promise<void> {
    const body = createOtpChallengeSchema.parse(request.body);

    const now = new Date();

    const result = await this.createOtpChallenge.execute({
      phoneNumber: body.phoneNumber,
      createdAt: now,
      expiresAt: new Date(now.getTime() + 5 * 60 * 1000),
    });

    await this.otpDeliveryService.send({
      phoneNumber: result.phoneNumber,
      code: result.code,
    });

    const response: CreateOtpChallengeResponse = {
      challengeId: result.challengeId,
      phoneNumber: result.phoneNumber,
      expiresAt: result.expiresAt,
    };

    await reply.code(201).send(response);
  }
}
