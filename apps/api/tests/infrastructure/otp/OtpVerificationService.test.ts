import { describe, expect, it } from "vitest";

import type { OtpChallengeRepository } from "@application/ports/OtpChallengeRepository.js";
import { VerifyOtpCode } from "@application/otp/VerifyOtpCode.js";
import type { OtpCodeHasher } from "@application/ports/OtpCodeHasher.js";

import { OtpVerificationService } from "@infrastructure/otp/OtpVerificationService.js";

describe("OtpVerificationService", () => {
  function createRepository(
    challenge: {
      id: string;
      phoneNumber: string;
      codeHash: string;
      expiresAt: Date;
    } | null,
  ): OtpChallengeRepository {
    return {
      save: async () => {},
      findById: async () => challenge,
      findLatestByPhoneNumber: async () => challenge,
    };
  }

  function createHasher(valid: boolean): OtpCodeHasher {
    return {
      hash: () => "unused-hash",
      verify: () => valid,
    };
  }

  it("should verify the latest OTP challenge for the phone number", async () => {
    const challenge = {
      id: "challenge-001",
      phoneNumber: "0712345678",
      codeHash: "stored-hash",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    };

    const verifyOtpCode = new VerifyOtpCode(
      createRepository(challenge),
      createHasher(true),
    );

    const service = new OtpVerificationService(
      createRepository(challenge),
      verifyOtpCode,
    );

    const result = await service.verify("0712345678", "123456");

    expect(result).toBe(true);
  });

  it("should return false when no OTP challenge exists", async () => {
    const repository = createRepository(null);

    const verifyOtpCode = new VerifyOtpCode(repository, createHasher(true));

    const service = new OtpVerificationService(repository, verifyOtpCode);

    const result = await service.verify("0712345678", "123456");

    expect(result).toBe(false);
  });

  it("should return false when the OTP code is invalid", async () => {
    const challenge = {
      id: "challenge-002",
      phoneNumber: "0712345678",
      codeHash: "stored-hash",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    };

    const repository = createRepository(challenge);

    const verifyOtpCode = new VerifyOtpCode(repository, createHasher(false));

    const service = new OtpVerificationService(repository, verifyOtpCode);

    const result = await service.verify("0712345678", "wrong-code");

    expect(result).toBe(false);
  });

  it("should reject an expired OTP challenge", async () => {
    const challenge = {
      id: "challenge-003",
      phoneNumber: "0712345678",
      codeHash: "stored-hash",
      expiresAt: new Date(Date.now() - 1),
    };

    const repository = createRepository(challenge);

    const verifyOtpCode = new VerifyOtpCode(repository, createHasher(true));

    const service = new OtpVerificationService(repository, verifyOtpCode);

    const result = await service.verify("0712345678", "123456");

    expect(result).toBe(false);
  });
});
