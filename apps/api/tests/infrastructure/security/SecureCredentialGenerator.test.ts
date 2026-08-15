import { describe, expect, it } from "vitest";

import { SecureCredentialGenerator } from "@infrastructure/security/SecureCredentialGenerator.js";

describe("SecureCredentialGenerator", () => {
  it("should generate a 16-character credential", () => {
    const generator = new SecureCredentialGenerator();

    const credential = generator.generate();

    expect(credential).toHaveLength(16);
  });

  it("should generate a credential using the supported character set", () => {
    const generator = new SecureCredentialGenerator();

    const credential = generator.generate();

    expect(credential).toMatch(
      /^[ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%]{16}$/,
    );
  });

  it("should generate different credentials across calls", () => {
    const generator = new SecureCredentialGenerator();

    const first = generator.generate();
    const second = generator.generate();

    expect(second).not.toBe(first);
  });

  it("should satisfy the CredentialGenerator contract", () => {
    const generator: import("@application/ports/CredentialGenerator.js").CredentialGenerator =
      new SecureCredentialGenerator();

    expect(generator.generate()).toHaveLength(16);
  });
});
