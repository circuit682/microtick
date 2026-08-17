import { describe, expect, it } from "vitest";

import { OtpChallengeMapper } from "@infrastructure/otp/OtpChallengeMapper.js";

describe("OtpChallengeMapper", () => {
  it("should map an OTP challenge to persistence", () => {
    const challenge = {
      id: "challenge-001",
      phoneNumber: "0712345678",
      codeHash: "hash-001",
      expiresAt: new Date("2026-08-16T12:05:00Z"),
    };

    expect(OtpChallengeMapper.toPersistence(challenge)).toEqual(challenge);
  });

  it("should map an OTP challenge from persistence", () => {
    const persistence = {
      id: "challenge-001",
      phoneNumber: "0712345678",
      codeHash: "hash-001",
      expiresAt: new Date("2026-08-16T12:05:00Z"),
    };

    expect(OtpChallengeMapper.toDomain(persistence)).toEqual({
      id: "challenge-001",
      phoneNumber: "0712345678",
      codeHash: "hash-001",
      expiresAt: new Date("2026-08-16T12:05:00Z"),
    });
  });
});
