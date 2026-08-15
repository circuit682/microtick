import { describe, expect, it } from "vitest";

import { Aes256GcmCredentialEncryptor } from "@infrastructure/security/Aes256GcmCredentialEncryptor.js";

describe("Aes256GcmCredentialEncryptor", () => {
  const key = Buffer.from("0123456789abcdef0123456789abcdef", "utf8");

  it("should encrypt and decrypt a credential", () => {
    const encryptor = new Aes256GcmCredentialEncryptor(key);

    const credential = "uK8#pR2!xQ7@Lm4";

    const encrypted = encryptor.encrypt(credential);

    expect(encrypted).not.toBe(credential);

    expect(encryptor.decrypt(encrypted)).toBe(credential);
  });

  it("should produce different ciphertext for the same credential", () => {
    const encryptor = new Aes256GcmCredentialEncryptor(key);

    const first = encryptor.encrypt("uK8#pR2!xQ7@Lm4");

    const second = encryptor.encrypt("uK8#pR2!xQ7@Lm4");

    expect(first).not.toBe(second);
  });

  it("should reject a key that is not 32 bytes", () => {
    expect(
      () => new Aes256GcmCredentialEncryptor(Buffer.from("short-key")),
    ).toThrow("Credential encryption key must be exactly 32 bytes.");
  });

  it("should reject a tampered encrypted credential", () => {
    const encryptor = new Aes256GcmCredentialEncryptor(key);

    const encrypted = encryptor.encrypt("uK8#pR2!xQ7@Lm4");

    const payload = Buffer.from(encrypted, "base64");

    payload[payload.length - 1] = (payload[payload.length - 1] ?? 0) ^ 0xff;

    expect(() => encryptor.decrypt(payload.toString("base64"))).toThrow();
  });

  it("should reject an invalid encrypted payload", () => {
    const encryptor = new Aes256GcmCredentialEncryptor(key);

    expect(() => encryptor.decrypt("invalid")).toThrow();
  });
});
