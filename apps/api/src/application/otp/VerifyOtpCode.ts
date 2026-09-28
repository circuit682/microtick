import type { OtpChallengeRepository } from "@application/ports/OtpChallengeRepository.js";
import type { OtpCodeHasher } from "@application/ports/OtpCodeHasher.js";

export interface VerifyOtpCodeCommand {
  challengeId: string;
  phoneNumber: string;
  code: string;
  now: Date;
}

export interface VerifyOtpCodeUseCase {
  execute(command: VerifyOtpCodeCommand): Promise<boolean>;
}

export class VerifyOtpCode implements VerifyOtpCodeUseCase {
  constructor(
    private readonly challengeRepository: OtpChallengeRepository,
    private readonly codeHasher: OtpCodeHasher,
  ) {}

  async execute(command: VerifyOtpCodeCommand): Promise<boolean> {
    const challenge = await this.challengeRepository.findById(
      command.challengeId,
    );

    if (challenge === null) {
      return false;
    }

    if (challenge.consumedAt !== null && challenge.consumedAt !== undefined) {
      return false;
    }

    if (challenge.phoneNumber !== command.phoneNumber) {
      return false;
    }

    if (command.now >= challenge.expiresAt) {
      return false;
    }

    const verified = this.codeHasher.verify(
      challenge.id,
      command.code,
      challenge.codeHash,
    );

    if (!verified) {
      return false;
    }

    await this.challengeRepository.save({
      ...challenge,
      consumedAt: command.now,
    });

    return true;
  }
}
