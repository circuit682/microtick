import type {
  OtpChallenge,
  OtpChallengeRepository,
} from "@application/ports/OtpChallengeRepository.js";

import { prisma } from "@infrastructure/database/prisma.js";

import { OtpChallengeMapper } from "./OtpChallengeMapper.js";

export class PrismaOtpChallengeRepository implements OtpChallengeRepository {
  async save(challenge: OtpChallenge): Promise<void> {
    const data = OtpChallengeMapper.toPersistence(challenge);

    await prisma.otpChallenge.upsert({
      where: {
        id: data.id,
      },
      create: data,
      update: data,
    });
  }

  async findById(id: string): Promise<OtpChallenge | null> {
    const challenge = await prisma.otpChallenge.findUnique({
      where: {
        id,
      },
    });

    if (!challenge) {
      return null;
    }

    return OtpChallengeMapper.toDomain(challenge);
  }

  async findLatestByPhoneNumber(
    phoneNumber: string,
  ): Promise<OtpChallenge | null> {
    const challenge = await prisma.otpChallenge.findFirst({
      where: {
        phoneNumber,
      },
      orderBy: {
        expiresAt: "desc",
      },
    });

    if (!challenge) {
      return null;
    }

    return OtpChallengeMapper.toDomain(challenge);
  }
}
