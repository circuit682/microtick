import { randomInt } from "node:crypto";

import type { CredentialGenerator } from "@application/ports/CredentialGenerator.js";

const CREDENTIAL_LENGTH = 16;

const CREDENTIAL_ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";

export class SecureCredentialGenerator implements CredentialGenerator {
  generate(): string {
    let credential = "";

    for (let index = 0; index < CREDENTIAL_LENGTH; index += 1) {
      credential +=
        CREDENTIAL_ALPHABET[randomInt(0, CREDENTIAL_ALPHABET.length)];
    }

    return credential;
  }
}
