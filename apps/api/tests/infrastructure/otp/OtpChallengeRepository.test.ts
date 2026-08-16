import { describe, expect, it } from "vitest";

import type { OtpChallengeRepository } from "@application/ports/OtpChallengeRepository.js";

import { InMemoryOtpChallengeRepository } from "../../doubles/otp/InMemoryOtpChallengeRepository.js";

describe("OtpChallengeRepository", () => {
  function createRepository(): OtpChallengeRepository {
    return new InMemoryOtpChallengeRepository();
  }

  it("should save and retrieve an OTP challenge by id", async () => {
    const repository = createRepository();

    const challenge = {
      id: "challenge-001",
      phoneNumber: "0712345678",
      codeHash: "hash-001",
      expiresAt: new Date("2026-08-16T12:05:00Z"),
    };

    await repository.save(challenge);

    const result = await repository.findById(challenge.id);

    expect(result).toEqual(challenge);
  });

  it("should return null when the challenge does not exist", async () => {
    const repository = createRepository();

    const result = await repository.findById("missing-challenge");

    expect(result).toBeNull();
  });

  it("should retrieve the latest challenge for a phone number", async () => {
    const repository = createRepository();

    const olderChallenge = {
      id: "challenge-001",
      phoneNumber: "0712345678",
      codeHash: "hash-001",
      expiresAt: new Date("2026-08-16T12:05:00Z"),
    };

    const newerChallenge = {
      id: "challenge-002",
      phoneNumber: "0712345678",
      codeHash: "hash-002",
      expiresAt: new Date("2026-08-16T12:10:00Z"),
    };

    await repository.save(olderChallenge);
    await repository.save(newerChallenge);

    const result = await repository.findLatestByPhoneNumber("0712345678");

    expect(result).toEqual(newerChallenge);
  });

  it("should return null when the phone number has no challenges", async () => {
    const repository = createRepository();

    const result = await repository.findLatestByPhoneNumber("0712345678");

    expect(result).toBeNull();
  });

  it("should not overwrite a different challenge when saving another challenge", async () => {
    const repository = createRepository();

    const first = {
      id: "challenge-001",
      phoneNumber: "0712345678",
      codeHash: "hash-001",
      expiresAt: new Date("2026-08-16T12:05:00Z"),
    };

    const second = {
      id: "challenge-002",
      phoneNumber: "0712345678",
      codeHash: "hash-002",
      expiresAt: new Date("2026-08-16T12:10:00Z"),
    };

    await repository.save(first);
    await repository.save(second);

    expect(await repository.findById(first.id)).toEqual(first);
    expect(await repository.findById(second.id)).toEqual(second);
  });
});
