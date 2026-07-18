import { describe, expect, it } from "vitest";

import { Money } from "@domain/money/index.js";
import { TinyPesaGateway } from "@infrastructure/payment/TinyPesaGateway.js";

describe("TinyPesaGateway", () => {
  describe("normalizePhoneNumber", () => {
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
  });

  describe("buildPaymentPayload", () => {
    it("should build the TinyPesa payment payload", () => {
      const payload = TinyPesaGateway.buildPaymentPayload({
        phoneNumber: "0712345678",
        amount: Money.fromKES(500),
        reference: "plan-123",
      });

      expect(payload).toEqual({
        amount: 500,
        msisdn: "254712345678",
        account_no: "plan-123",
      });
    });
  });
});