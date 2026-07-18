import { describe, expect, it } from "vitest";

import { TinyPesaGateway } from "@infrastructure/payment/TinyPesaGateway.js";
import { Money } from "@domain/money/index.js";

describe("TinyPesaGateway", () => {
  it("should normalize local Kenyan phone numbers", () => {
    expect(
      TinyPesaGateway.normalizePhoneNumber("0712345678"),
    ).toBe("254712345678");
  });

  it("should normalize nine-digit Kenyan phone numbers", () => {
    expect(
      TinyPesaGateway.normalizePhoneNumber("712345678"),
    ).toBe("254712345678");
  });

  it("should preserve international Kenyan phone numbers", () => {
    expect(
      TinyPesaGateway.normalizePhoneNumber("254712345678"),
    ).toBe("254712345678");
  });
  describe("TinyPesaGateway", () => {
    it("should build the TinyPesa payment payload", () => {
      const payload = TinyPesaGateway.buildPaymentPayload({
        phoneNumber: "0712345678",
        amount: Money.fromKES(500),
      });

      expect(payload).toEqual({
        amount: 500,
        msisdn: "254712345678",
      });
    });
  });
});