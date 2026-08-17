import type { OtpChallengeRepository } from "@application/ports/OtpChallengeRepository.js";
import type { OtpCodeGenerator } from "@application/ports/OtpCodeGenerator.js";
import type { OtpCodeHasher } from "@application/ports/OtpCodeHasher.js";

import type { IdentifierGenerator } from "@shared";

export interface CreateOtpChallengeCommand {
  phoneNumber: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface CreateOtpChallengeResult {
  challengeId: string;
  phoneNumber: string;
  code: string;
  expiresAt: Date;
}

export interface CreateOtpChallengeUseCase {
  execute(
    command: CreateOtpChallengeCommand,
  ): Promise<CreateOtpChallengeResult>;
}

export class CreateOtpChallenge implements CreateOtpChallengeUseCase {
  constructor(
    private readonly challengeRepository: OtpChallengeRepository,
    private readonly identifierGenerator: IdentifierGenerator,
    private readonly codeHasher: OtpCodeHasher,
    private readonly codeGenerator: OtpCodeGenerator,
  ) {}

  async execute(
    command: CreateOtpChallengeCommand,
  ): Promise<CreateOtpChallengeResult> {
    const challengeId = this.identifierGenerator.generate();
    const code = this.codeGenerator.generate();

    const codeHash = this.codeHasher.hash(challengeId, code);

    await this.challengeRepository.save({
      id: challengeId,
      phoneNumber: command.phoneNumber,
      codeHash,
      expiresAt: command.expiresAt,
    });

    return {
      challengeId,
      phoneNumber: command.phoneNumber,
      code,
      expiresAt: command.expiresAt,
    };
  }
}
