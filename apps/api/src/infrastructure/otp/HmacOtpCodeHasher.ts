import { createHmac, timingSafeEqual } from "node:crypto";

import type { OtpCodeHasher } from "@application/ports/OtpCodeHasher.js";

export class HmacOtpCodeHasher implements OtpCodeHasher {
  constructor(private readonly secret: Uint8Array) {
    if (secret.length === 0) {
      throw new Error("OTP hashing secret cannot be empty.");
    }
  }

  hash(challengeId: string, code: string): string {
    return createHmac("sha256", this.secret)
      .update(challengeId)
      .update(":")
      .update(code)
      .digest("hex");
  }

  verify(challengeId: string, code: string, hash: string): boolean {
    if (!/^[a-f0-9]{64}$/i.test(hash)) {
      return false;
    }

    const expected = Buffer.from(this.hash(challengeId, code), "hex");

    const supplied = Buffer.from(hash, "hex");

    if (expected.length !== supplied.length) {
      return false;
    }

    return timingSafeEqual(expected, supplied);
  }
}
