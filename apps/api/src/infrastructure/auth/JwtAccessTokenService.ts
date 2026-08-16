import { jwtVerify, SignJWT, type JWTPayload } from "jose";

import type {
  AccessTokenClaims,
  AccessTokenService,
  VerifiedAccessToken,
} from "@application/ports/AccessTokenService.js";

interface MicroTickJwtPayload extends JWTPayload {
  customerId: string;
  sessionId: string;
}

export interface JwtAccessTokenServiceOptions {
  secret: Uint8Array;
  issuer: string;
  audience: string;
}

export class JwtAccessTokenService implements AccessTokenService {
  constructor(private readonly options: JwtAccessTokenServiceOptions) {}

  async issue(claims: AccessTokenClaims): Promise<string> {
    const expirationTime = Math.floor(claims.expiresAt.getTime() / 1000);

    return new SignJWT({
      customerId: claims.customerId,
      sessionId: claims.sessionId,
    })
      .setProtectedHeader({
        alg: "HS256",
        typ: "JWT",
      })
      .setSubject(claims.customerId)
      .setIssuer(this.options.issuer)
      .setAudience(this.options.audience)
      .setIssuedAt()
      .setExpirationTime(expirationTime)
      .sign(this.options.secret);
  }

  async verify(token: string): Promise<VerifiedAccessToken> {
    const { payload } = await jwtVerify<MicroTickJwtPayload>(
      token,
      this.options.secret,
      {
        issuer: this.options.issuer,
        audience: this.options.audience,
        algorithms: ["HS256"],
      },
    );

    if (
      typeof payload.customerId !== "string" ||
      payload.customerId.trim().length === 0
    ) {
      throw new Error("Access token is missing customer identity.");
    }

    if (
      typeof payload.sessionId !== "string" ||
      payload.sessionId.trim().length === 0
    ) {
      throw new Error("Access token is missing session identity.");
    }

    return {
      customerId: payload.customerId,
      sessionId: payload.sessionId,
    };
  }
}
