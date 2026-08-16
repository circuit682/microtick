export interface OtpCodeHasher {
  hash(challengeId: string, code: string): string;

  verify(challengeId: string, code: string, hash: string): boolean;
}
