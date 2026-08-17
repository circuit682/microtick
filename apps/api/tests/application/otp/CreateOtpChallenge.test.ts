import { describe, expect, it } from "vitest";

import { CreateOtpChallenge } from "@application/otp/CreateOtpChallenge.js";
import type {
  OtpChallenge,
  OtpChallengeRepository,
} from "@application/ports/OtpChallengeRepository.js";
import type { OtpCodeGenerator } from "@application/ports/OtpCodeGenerator.js";
import type { OtpCodeHasher } from "@application/ports/OtpCodeHasher.js";
import type { IdentifierGenerator } from "@shared";

describe("CreateOtpChallenge", () => {
  function createRepository(): {
    repository: OtpChallengeRepository;
    saved: OtpChallenge[];
  } {
    const saved: OtpChallenge[] = [];

    const repository: OtpChallengeRepository = {
      save: async (challenge) => {
        saved.push(challenge);
      },

      findById: async (id) =>
        saved.find((challenge) => challenge.id === id) ?? null,

      findLatestByPhoneNumber: async (phoneNumber) =>
        [...saved]
          .filter((challenge) => challenge.phoneNumber === phoneNumber)
          .at(-1) ?? null,
    };

    return {
      repository,
      saved,
    };
  }

  it("should generate, hash and persist an OTP challenge", async () => {
    const { repository, saved } = createRepository();

    const identifierGenerator: IdentifierGenerator = {
      generate: () => "challenge-001",
    };

    const codeGenerator: OtpCodeGenerator = {
      generate: () => "123456",
    };

    const hashedInputs: {
      challengeId: string;
      code: string;
    }[] = [];

    const codeHasher: OtpCodeHasher = {
      hash: (challengeId, code) => {
        hashedInputs.push({
          challengeId,
          code,
        });

        return "hashed-otp";
      },

      verify: () => true,
    };

    const service = new CreateOtpChallenge(
      repository,
      identifierGenerator,
      codeHasher,
      codeGenerator,
    );

    const result = await service.execute({
      phoneNumber: "0712345678",
      expiresAt: new Date("2026-08-16T19:05:00Z"),
      createdAt: new Date("2026-08-16T19:00:00Z"),
    });

    expect(result).toEqual({
      challengeId: "challenge-001",
      phoneNumber: "0712345678",
      code: "123456",
      expiresAt: new Date("2026-08-16T19:05:00Z"),
    });

    expect(hashedInputs).toEqual([
      {
        challengeId: "challenge-001",
        code: "123456",
      },
    ]);

    expect(saved).toEqual([
      {
        id: "challenge-001",
        phoneNumber: "0712345678",
        codeHash: "hashed-otp",
        expiresAt: new Date("2026-08-16T19:05:00Z"),
      },
    ]);
  });

  it("should preserve the generated challenge id when hashing the OTP", async () => {
    const { repository } = createRepository();

    const identifierGenerator: IdentifierGenerator = {
      generate: () => "challenge-specific-id",
    };

    const codeGenerator: OtpCodeGenerator = {
      generate: () => "654321",
    };

    let receivedChallengeId: string | undefined;

    const codeHasher: OtpCodeHasher = {
      hash: (challengeId) => {
        receivedChallengeId = challengeId;
        return "hashed-otp";
      },

      verify: () => true,
    };

    const service = new CreateOtpChallenge(
      repository,
      identifierGenerator,
      codeHasher,
      codeGenerator,
    );

    await service.execute({
      phoneNumber: "0712345678",
      expiresAt: new Date("2026-08-16T19:05:00Z"),
      createdAt: new Date("2026-08-16T19:00:00Z"),
    });

    expect(receivedChallengeId).toBe("challenge-specific-id");
  });

  it("should not persist the plaintext OTP", async () => {
    const { repository, saved } = createRepository();

    const identifierGenerator: IdentifierGenerator = {
      generate: () => "challenge-002",
    };

    const codeGenerator: OtpCodeGenerator = {
      generate: () => "123456",
    };

    const codeHasher: OtpCodeHasher = {
      hash: () => "hashed-otp-value",
      verify: () => true,
    };

    const service = new CreateOtpChallenge(
      repository,
      identifierGenerator,
      codeHasher,
      codeGenerator,
    );

    await service.execute({
      phoneNumber: "0712345678",
      expiresAt: new Date("2026-08-16T19:05:00Z"),
      createdAt: new Date("2026-08-16T19:00:00Z"),
    });

    expect(saved[0]?.codeHash).toBe("hashed-otp-value");
    expect(saved[0]?.codeHash).not.toBe("123456");
  });

  it("should return the generated code for the delivery boundary", async () => {
    const { repository } = createRepository();

    const identifierGenerator: IdentifierGenerator = {
      generate: () => "challenge-003",
    };

    const codeGenerator: OtpCodeGenerator = {
      generate: () => "987654",
    };

    const codeHasher: OtpCodeHasher = {
      hash: () => "hashed-otp",
      verify: () => true,
    };

    const service = new CreateOtpChallenge(
      repository,
      identifierGenerator,
      codeHasher,
      codeGenerator,
    );

    const result = await service.execute({
      phoneNumber: "0712345678",
      expiresAt: new Date("2026-08-16T19:05:00Z"),
      createdAt: new Date("2026-08-16T19:00:00Z"),
    });

    expect(result.code).toBe("987654");
  });
});
