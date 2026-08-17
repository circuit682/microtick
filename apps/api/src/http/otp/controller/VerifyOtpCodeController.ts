import type { FastifyReply, FastifyRequest } from "fastify";

import type { VerifyOtpCode } from "@application/otp/VerifyOtpCode.js";

import type { VerifyOtpCodeResponse } from "../dto/VerifyOtpCodeResponse.types.js";
import { verifyOtpCodeSchema } from "../schema/VerifyOtpCode.js";

interface VerifyOtpCodeRequest {
  Body: {
    challengeId: string;
    phoneNumber: string;
    code: string;
  };
}

export class VerifyOtpCodeController {
  constructor(private readonly verifyOtpCode: VerifyOtpCode) {}

  async handle(
    request: FastifyRequest<VerifyOtpCodeRequest>,
    reply: FastifyReply,
  ): Promise<void> {
    const body = verifyOtpCodeSchema.parse(request.body);

    const verified = await this.verifyOtpCode.execute({
      challengeId: body.challengeId,
      phoneNumber: body.phoneNumber,
      code: body.code,
      now: new Date(),
    });

    const response: VerifyOtpCodeResponse = {
      verified,
    };

    await reply.code(200).send(response);
  }
}
