import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

import type { CredentialEncryptor } from "@application/ports/CredentialEncryptor.js";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

export class Aes256GcmCredentialEncryptor implements CredentialEncryptor {
  constructor(private readonly key: Buffer) {
    if (key.length !== KEY_LENGTH) {
      throw new Error("Credential encryption key must be exactly 32 bytes.");
    }
  }

  encrypt(value: string): string {
    const iv = randomBytes(IV_LENGTH);

    const cipher = createCipheriv(ALGORITHM, this.key, iv);

    const ciphertext = Buffer.concat([
      cipher.update(value, "utf8"),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return Buffer.concat([iv, authTag, ciphertext]).toString("base64");
  }

  decrypt(value: string): string {
    const payload = Buffer.from(value, "base64");

    if (payload.length < IV_LENGTH + AUTH_TAG_LENGTH) {
      throw new Error("Invalid encrypted credential payload.");
    }

    const iv = payload.subarray(0, IV_LENGTH);
    const authTag = payload.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const ciphertext = payload.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = createDecipheriv(ALGORITHM, this.key, iv);

    decipher.setAuthTag(authTag);

    return Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]).toString("utf8");
  }
}
