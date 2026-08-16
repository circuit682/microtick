export interface AccessTokenClaims {
  customerId: string;
  sessionId: string;
  expiresAt: Date;
}

export interface VerifiedAccessToken {
  customerId: string;
  sessionId: string;
}

export interface AccessTokenService {
  issue(claims: AccessTokenClaims): Promise<string>;

  verify(token: string): Promise<VerifiedAccessToken>;
}
