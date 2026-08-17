import AfricaTalking from "africastalking";

import { CreateOtpChallenge } from "@application/otp/CreateOtpChallenge.js";
import { VerifyOtpCode } from "@application/otp/VerifyOtpCode.js";

import { env } from "@config/env.js";

import { CreateOtpChallengeController } from "@http/otp/controller/CreateOtpChallengeController.js";
import { VerifyOtpCodeController } from "@http/otp/controller/VerifyOtpCodeController.js";

import { UlidIdentifierGenerator } from "@infrastructure/identity/UlidIdentifierGenerator.js";
import { HmacOtpCodeHasher } from "@infrastructure/otp/HmacOtpCodeHasher.js";
import {
  OtpDeliveryProvider,
  OtpDeliveryService,
} from "@infrastructure/otp/OtpDeliveryService.js";
import { AfricaTalkingOtpDeliveryProvider } from "@infrastructure/otp/AfricaTalkingOtpDeliveryProvider.js";
import { PrismaOtpChallengeRepository } from "@infrastructure/otp/PrismaOtpChallengeRepository.js";
import { SecureOtpCodeGenerator } from "@infrastructure/otp/SecureOtpCodeGenerator.js";

function createOtpChallengeUseCase(): CreateOtpChallenge {
  const challengeRepository = new PrismaOtpChallengeRepository();

  const identifierGenerator = new UlidIdentifierGenerator();

  const codeHasher = new HmacOtpCodeHasher(env.otp.hashSecret);

  const codeGenerator = new SecureOtpCodeGenerator();

  return new CreateOtpChallenge(
    challengeRepository,
    identifierGenerator,
    codeHasher,
    codeGenerator,
  );
}

function createVerifyOtpCodeUseCase(): VerifyOtpCode {
  const challengeRepository = new PrismaOtpChallengeRepository();

  const codeHasher = new HmacOtpCodeHasher(env.otp.hashSecret);

  return new VerifyOtpCode(challengeRepository, codeHasher);
}

export function createOtpDeliveryService(
  provider?: OtpDeliveryProvider,
): OtpDeliveryService {
  if (provider) {
    return new OtpDeliveryService(provider);
  }

  const africaTalkingProvider = new AfricaTalkingOtpDeliveryProvider(
    {
      username: env.otp.username,
      apiKey: env.otp.apiKey,
      ...(env.otp.senderId ? { senderId: env.otp.senderId } : {}),
    },
    (options) =>
      AfricaTalking({
        username: options.username,
        apiKey: options.apiKey,
      }),
  );

  return new OtpDeliveryService(africaTalkingProvider);
}

export function createCreateOtpChallengeController(
  provider?: OtpDeliveryProvider,
): CreateOtpChallengeController {
  const createOtpChallenge = createOtpChallengeUseCase();

  const otpDeliveryService = createOtpDeliveryService(provider);

  return new CreateOtpChallengeController(
    createOtpChallenge,
    otpDeliveryService,
  );
}

export function createVerifyOtpCodeController(): VerifyOtpCodeController {
  const verifyOtpCode = createVerifyOtpCodeUseCase();

  return new VerifyOtpCodeController(verifyOtpCode);
}
