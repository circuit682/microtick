import { beforeEach, describe, expect, it } from "vitest";

import { prisma } from "@infrastructure/database/prisma.js";
import { PrismaOtpChallengeRepository } from "@infrastructure/otp/PrismaOtpChallengeRepository.js";

describe("PrismaOtpChallengeRepository", () => {
  const repository = new PrismaOtpChallengeRepository();

  beforeEach(async () => {
    await prisma.otpChallenge.deleteMany();
  });

  it("should save and retrieve an OTP challenge by id", async () => {
    const challenge = {
      id: "challenge-prisma-001",
      phoneNumber: "0712345678",
      codeHash: "hash-prisma-001",
      expiresAt: new Date("2026-08-16T12:05:00Z"),
    };

    await repository.save(challenge);

    const result = await repository.findById(challenge.id);

    expect(result).not.toBeNull();
    expect(result).toEqual(challenge);
  });

  it("should return null when the challenge does not exist", async () => {
    const result = await repository.findById("missing-challenge");

    expect(result).toBeNull();
  });

  it("should retrieve the latest challenge for a phone number", async () => {
    const olderChallenge = {
      id: "challenge-prisma-002",
      phoneNumber: "0712345679",
      codeHash: "hash-prisma-002",
      expiresAt: new Date("2026-08-16T12:05:00Z"),
    };

    const newerChallenge = {
      id: "challenge-prisma-003",
      phoneNumber: "0712345679",
      codeHash: "hash-prisma-003",
      expiresAt: new Date("2026-08-16T12:10:00Z"),
    };

    await repository.save(olderChallenge);
    await repository.save(newerChallenge);

    const result = await repository.findLatestByPhoneNumber("0712345679");

    expect(result).not.toBeNull();
    expect(result).toEqual(newerChallenge);
  });

  it("should return null when the phone number has no challenges", async () => {
    const result = await repository.findLatestByPhoneNumber("0799999999");

    expect(result).toBeNull();
  });

  it("should preserve all challenge values through persistence", async () => {
    const challenge = {
      id: "challenge-prisma-004",
      phoneNumber: "0723456789",
      codeHash:
        "4f8b42e0f1d3b0c6e5a7d8f90123456789abcdef0123456789abcdef01234567",
      expiresAt: new Date("2026-08-16T18:30:00Z"),
    };

    await repository.save(challenge);

    const result = await repository.findById(challenge.id);

    expect(result).toEqual({
      id: challenge.id,
      phoneNumber: challenge.phoneNumber,
      codeHash: challenge.codeHash,
      expiresAt: challenge.expiresAt,
    });
  });
});
