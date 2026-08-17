import { randomInt } from "node:crypto";

import type { OtpCodeGenerator } from "@application/ports/OtpCodeGenerator.js";

const OTP_LENGTH = 6;
const OTP_MIN = 100000;
const OTP_MAX = 1000000;

export class SecureOtpCodeGenerator implements OtpCodeGenerator {
  generate(): string {
    return randomInt(OTP_MIN, OTP_MAX).toString().padStart(OTP_LENGTH, "0");
  }
}
