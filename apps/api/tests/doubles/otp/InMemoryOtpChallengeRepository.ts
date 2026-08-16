import type {
  OtpChallenge,
  OtpChallengeRepository,
} from "@application/ports/OtpChallengeRepository.js";

export class InMemoryOtpChallengeRepository implements OtpChallengeRepository {
  private readonly challenges = new Map<string, OtpChallenge>();

  async save(challenge: OtpChallenge): Promise<void> {
    this.challenges.set(challenge.id, challenge);
  }

  async findById(id: string): Promise<OtpChallenge | null> {
    return this.challenges.get(id) ?? null;
  }

  async findLatestByPhoneNumber(
    phoneNumber: string,
  ): Promise<OtpChallenge | null> {
    const matches = [...this.challenges.values()].filter(
      (challenge) => challenge.phoneNumber === phoneNumber,
    );

    if (matches.length === 0) {
      return null;
    }

    return matches.reduce((latest, current) =>
      current.expiresAt > latest.expiresAt ? current : latest,
    );
  }
}
