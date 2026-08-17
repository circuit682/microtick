export interface CreateOtpChallengeResponse {
  challengeId: string;
  phoneNumber: string;
  expiresAt: Date;
}
