export interface OtpChallenge {
  id: string;
  phoneNumber: string;
  codeHash: string;
  expiresAt: Date;
}

export interface OtpChallengeRepository {
  save(challenge: OtpChallenge): Promise<void>;

  findById(id: string): Promise<OtpChallenge | null>;

  findLatestByPhoneNumber(phoneNumber: string): Promise<OtpChallenge | null>;
}
