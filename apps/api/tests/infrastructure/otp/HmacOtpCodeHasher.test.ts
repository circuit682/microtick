import { describe, expect, it } from "vitest";

import { HmacOtpCodeHasher } from "@infrastructure/otp/HmacOtpCodeHasher.js";

describe("HmacOtpCodeHasher", () => {
  const secret = new TextEncoder().encode(
    "microtick-test-otp-secret-that-is-long-enough",
  );

  function createHasher(): HmacOtpCodeHasher {
    return new HmacOtpCodeHasher(secret);
  }

  it("should produce the same hash for the same code and challenge context", () => {
    const hasher = createHasher();

    const first = hasher.hash("challenge-001", "123456");
    const second = hasher.hash("challenge-001", "123456");

    expect(first).toBe(second);
  });

  it("should produce different hashes for different verification codes", () => {
    const hasher = createHasher();

    const first = hasher.hash("challenge-001", "123456");
    const second = hasher.hash("challenge-001", "654321");

    expect(first).not.toBe(second);
  });

  it("should produce different hashes for different challenge ids", () => {
    const hasher = createHasher();

    const first = hasher.hash("challenge-001", "123456");
    const second = hasher.hash("challenge-002", "123456");

    expect(first).not.toBe(second);
  });

  it("should not expose the verification code in the generated hash", () => {
    const hasher = createHasher();

    const hash = hasher.hash("challenge-001", "123456");

    expect(hash).not.toContain("123456");
    expect(hash).not.toContain("challenge-001");
  });

  it("should verify the correct code against the stored hash", () => {
    const hasher = createHasher();

    const hash = hasher.hash("challenge-001", "123456");

    expect(hasher.verify("challenge-001", "123456", hash)).toBe(true);
  });

  it("should reject an incorrect verification code", () => {
    const hasher = createHasher();

    const hash = hasher.hash("challenge-001", "123456");

    expect(hasher.verify("challenge-001", "654321", hash)).toBe(false);
  });

  it("should reject the correct code when the challenge id is different", () => {
    const hasher = createHasher();

    const hash = hasher.hash("challenge-001", "123456");

    expect(hasher.verify("challenge-002", "123456", hash)).toBe(false);
  });

  it("should reject a malformed stored hash", () => {
    const hasher = createHasher();

    expect(hasher.verify("challenge-001", "123456", "not-a-valid-hash")).toBe(
      false,
    );
  });
});
