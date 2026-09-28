import { describe, expect, it, vi } from "vitest";

import type { OtpChallenge } from "@application/ports/OtpChallengeRepository.js";
import type { OtpChallengeRepository } from "@application/ports/OtpChallengeRepository.js";
import type { OtpCodeHasher } from "@application/ports/OtpCodeHasher.js";
import { VerifyOtpCode } from "@application/otp/VerifyOtpCode.js";

describe("VerifyOtpCode", () => {
  function createRepository(
    challenge: OtpChallenge | null,
  ): OtpChallengeRepository & { save: ReturnType<typeof vi.fn> } {
    return {
      save: vi.fn(async () => {}),
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

  it("should verify a valid OTP code", async () => {
    const challenge = {
      id: "challenge-001",
      phoneNumber: "0712345678",
      codeHash: "stored-hash",
      expiresAt: new Date("2026-08-16T19:00:00Z"),
    };

    const service = new VerifyOtpCode(
      createRepository(challenge),
      createHasher(true),
    );

    const result = await service.execute({
      challengeId: challenge.id,
      phoneNumber: challenge.phoneNumber,
      code: "123456",
      now: new Date("2026-08-16T18:55:00Z"),
    });

    expect(result).toBe(true);
  });

  it("should reject an OTP challenge that does not exist", async () => {
    const service = new VerifyOtpCode(
      createRepository(null),
      createHasher(true),
    );

    const result = await service.execute({
      challengeId: "missing-challenge",
      phoneNumber: "0712345678",
      code: "123456",
      now: new Date("2026-08-16T18:55:00Z"),
    });

    expect(result).toBe(false);
  });

  it("should reject an expired OTP challenge", async () => {
    const challenge = {
      id: "challenge-002",
      phoneNumber: "0712345678",
      codeHash: "stored-hash",
      expiresAt: new Date("2026-08-16T18:50:00Z"),
    };

    const service = new VerifyOtpCode(
      createRepository(challenge),
      createHasher(true),
    );

    const result = await service.execute({
      challengeId: challenge.id,
      phoneNumber: challenge.phoneNumber,
      code: "123456",
      now: new Date("2026-08-16T18:55:00Z"),
    });

    expect(result).toBe(false);
  });

  it("should reject a challenge when the phone number does not match", async () => {
    const challenge = {
      id: "challenge-003",
      phoneNumber: "0712345678",
      codeHash: "stored-hash",
      expiresAt: new Date("2026-08-16T19:00:00Z"),
    };

    const service = new VerifyOtpCode(
      createRepository(challenge),
      createHasher(true),
    );

    const result = await service.execute({
      challengeId: challenge.id,
      phoneNumber: "0799999999",
      code: "123456",
      now: new Date("2026-08-16T18:55:00Z"),
    });

    expect(result).toBe(false);
  });

  it("should reject an incorrect OTP code", async () => {
    const challenge = {
      id: "challenge-004",
      phoneNumber: "0712345678",
      codeHash: "stored-hash",
      expiresAt: new Date("2026-08-16T19:00:00Z"),
    };

    const service = new VerifyOtpCode(
      createRepository(challenge),
      createHasher(false),
    );

    const result = await service.execute({
      challengeId: challenge.id,
      phoneNumber: challenge.phoneNumber,
      code: "wrong-code",
      now: new Date("2026-08-16T18:55:00Z"),
    });

    expect(result).toBe(false);
  });

  it("should reject the code exactly at the challenge expiration time", async () => {
    const challenge = {
      id: "challenge-005",
      phoneNumber: "0712345678",
      codeHash: "stored-hash",
      expiresAt: new Date("2026-08-16T19:00:00Z"),
    };

    const service = new VerifyOtpCode(
      createRepository(challenge),
      createHasher(true),
    );

    const result = await service.execute({
      challengeId: challenge.id,
      phoneNumber: challenge.phoneNumber,
      code: "123456",
      now: new Date("2026-08-16T19:00:00Z"),
    });

    expect(result).toBe(false);
  });

  it("should reject a challenge that has already been consumed, even with the correct code", async () => {
    const challenge = {
      id: "challenge-006",
      phoneNumber: "0712345678",
      codeHash: "stored-hash",
      expiresAt: new Date("2026-08-16T19:00:00Z"),
      consumedAt: new Date("2026-08-16T18:50:00Z"),
    };

    const repository = createRepository(challenge);

    const service = new VerifyOtpCode(repository, createHasher(true));

    const result = await service.execute({
      challengeId: challenge.id,
      phoneNumber: challenge.phoneNumber,
      code: "123456",
      now: new Date("2026-08-16T18:55:00Z"),
    });

    expect(result).toBe(false);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it("should mark the challenge as consumed after a successful verification", async () => {
    const challenge = {
      id: "challenge-007",
      phoneNumber: "0712345678",
      codeHash: "stored-hash",
      expiresAt: new Date("2026-08-16T19:00:00Z"),
    };

    const repository = createRepository(challenge);

    const service = new VerifyOtpCode(repository, createHasher(true));

    const now = new Date("2026-08-16T18:55:00Z");

    const result = await service.execute({
      challengeId: challenge.id,
      phoneNumber: challenge.phoneNumber,
      code: "123456",
      now,
    });

    expect(result).toBe(true);
    expect(repository.save).toHaveBeenCalledWith({
      ...challenge,
      consumedAt: now,
    });
  });
});
