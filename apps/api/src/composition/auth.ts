import { AuthenticateCustomer } from "@application/auth/AuthenticateCustomer.js";
import { AuthenticateCustomerController } from "@http/auth/controller/AuthenticateCustomerController.js";
import { VerifyOtpCode } from "@application/otp/VerifyOtpCode.js";
import { CreateSession } from "@application/session/CreateSession.js";

import { env } from "@config/env.js";

import { PrismaCustomerRepository } from "@infrastructure/customer/PrismaCustomerRepository.js";
import { JwtAccessTokenService } from "@infrastructure/auth/JwtAccessTokenService.js";
import { PrismaSessionRepository } from "@infrastructure/session/PrismaSessionRepository.js";
import { PrismaOtpChallengeRepository } from "@infrastructure/otp/PrismaOtpChallengeRepository.js";
import { HmacOtpCodeHasher } from "@infrastructure/otp/HmacOtpCodeHasher.js";
import { OtpVerificationService } from "@infrastructure/otp/OtpVerificationService.js";
import { UlidIdentifierGenerator } from "@infrastructure/identity/UlidIdentifierGenerator.js";

export function createAuthenticateCustomer(): AuthenticateCustomer {
  const customerRepository = new PrismaCustomerRepository();

  const otpChallengeRepository = new PrismaOtpChallengeRepository();

  const otpCodeHasher = new HmacOtpCodeHasher(env.otp.hashSecret);

  const verifyOtpCode = new VerifyOtpCode(
    otpChallengeRepository,
    otpCodeHasher,
  );

  const otpVerificationService = new OtpVerificationService(
    otpChallengeRepository,
    verifyOtpCode,
  );

  const sessionRepository = new PrismaSessionRepository();

  const identifierGenerator = new UlidIdentifierGenerator();

  const createSession = new CreateSession(
    sessionRepository,
    identifierGenerator,
  );

  const accessTokenService = new JwtAccessTokenService({
    secret: env.security.jwtSecret,
    issuer: env.security.jwtIssuer,
    audience: env.security.jwtAudience,
  });

  return new AuthenticateCustomer(
    customerRepository,
    otpVerificationService,
    createSession,
    accessTokenService,
  );
}
export function createAuthenticateCustomerController(): AuthenticateCustomerController {
  const authenticateCustomer = createAuthenticateCustomer();

  return new AuthenticateCustomerController(authenticateCustomer);
}
