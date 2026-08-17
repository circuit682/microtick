import type { OtpChallenge as PrismaOtpChallenge } from "@generated/prisma/client.js";

import type { OtpChallenge } from "@application/ports/OtpChallengeRepository.js";

export class OtpChallengeMapper {
  static toDomain(challenge: PrismaOtpChallenge): OtpChallenge {
    return {
      id: challenge.id,
      phoneNumber: challenge.phoneNumber,
      codeHash: challenge.codeHash,
      expiresAt: challenge.expiresAt,
    };
  }

  static toPersistence(challenge: OtpChallenge): {
    id: string;
    phoneNumber: string;
    codeHash: string;
    expiresAt: Date;
  } {
    return {
      id: challenge.id,
      phoneNumber: challenge.phoneNumber,
      codeHash: challenge.codeHash,
      expiresAt: challenge.expiresAt,
    };
  }
}
