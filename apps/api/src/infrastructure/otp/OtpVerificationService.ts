import type { OtpVerificationService as OtpVerificationServicePort } from "@application/ports/OtpVerificationService.js";
import type { OtpChallengeRepository } from "@application/ports/OtpChallengeRepository.js";

import { VerifyOtpCode } from "@application/otp/VerifyOtpCode.js";

export class OtpVerificationService implements OtpVerificationServicePort {
  constructor(
    private readonly challengeRepository: OtpChallengeRepository,
    private readonly verifyOtpCode: VerifyOtpCode,
  ) {}

  async verify(phoneNumber: string, code: string): Promise<boolean> {
    const challenge =
      await this.challengeRepository.findLatestByPhoneNumber(phoneNumber);

    if (challenge === null) {
      return false;
    }

    return this.verifyOtpCode.execute({
      challengeId: challenge.id,
      phoneNumber,
      code,
      now: new Date(),
    });
  }
}
