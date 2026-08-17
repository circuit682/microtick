import { describe, expect, it } from "vitest";

import { SecureOtpCodeGenerator } from "@infrastructure/otp/SecureOtpCodeGenerator.js";

describe("SecureOtpCodeGenerator", () => {
  it("should generate a six-digit numeric OTP", () => {
    const generator = new SecureOtpCodeGenerator();

    const code = generator.generate();

    expect(code).toMatch(/^\d{6}$/);
  });

  it("should generate OTPs within the six-digit range", () => {
    const generator = new SecureOtpCodeGenerator();

    for (let index = 0; index < 100; index += 1) {
      const code = Number(generator.generate());

      expect(code).toBeGreaterThanOrEqual(100000);
      expect(code).toBeLessThanOrEqual(999999);
    }
  });

  it("should generate strings rather than numbers", () => {
    const generator = new SecureOtpCodeGenerator();

    expect(typeof generator.generate()).toBe("string");
  });
});
