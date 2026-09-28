import { describe, expect, it } from "vitest";

import { OtpChallengeMapper } from "@infrastructure/otp/OtpChallengeMapper.js";

describe("OtpChallengeMapper", () => {
  it("should map an unconsumed OTP challenge to persistence", () => {
    const challenge = {
      id: "challenge-001",
      phoneNumber: "0712345678",
      codeHash: "hash-001",
      expiresAt: new Date("2026-08-16T12:05:00Z"),
    };

    expect(OtpChallengeMapper.toPersistence(challenge)).toEqual({
      ...challenge,
      consumedAt: null,
    });
  });

  it("should map a consumed OTP challenge to persistence", () => {
    const consumedAt = new Date("2026-08-16T12:03:00Z");

    const challenge = {
      id: "challenge-002",
      phoneNumber: "0712345678",
      codeHash: "hash-002",
      expiresAt: new Date("2026-08-16T12:05:00Z"),
      consumedAt,
    };

    expect(OtpChallengeMapper.toPersistence(challenge)).toEqual({
      ...challenge,
      consumedAt,
    });
  });

  it("should map an unconsumed OTP challenge from persistence", () => {
    const persistence = {
      id: "challenge-001",
      phoneNumber: "0712345678",
      codeHash: "hash-001",
      expiresAt: new Date("2026-08-16T12:05:00Z"),
      consumedAt: null,
    };

    expect(OtpChallengeMapper.toDomain(persistence)).toEqual({
      id: "challenge-001",
      phoneNumber: "0712345678",
      codeHash: "hash-001",
      expiresAt: new Date("2026-08-16T12:05:00Z"),
      consumedAt: null,
    });
  });

  it("should map a consumed OTP challenge from persistence", () => {
    const consumedAt = new Date("2026-08-16T12:03:00Z");

    const persistence = {
      id: "challenge-002",
      phoneNumber: "0712345678",
      codeHash: "hash-002",
      expiresAt: new Date("2026-08-16T12:05:00Z"),
      consumedAt,
    };

    expect(OtpChallengeMapper.toDomain(persistence)).toEqual({
      id: "challenge-002",
      phoneNumber: "0712345678",
      codeHash: "hash-002",
      expiresAt: new Date("2026-08-16T12:05:00Z"),
      consumedAt,
    });
  });
});
