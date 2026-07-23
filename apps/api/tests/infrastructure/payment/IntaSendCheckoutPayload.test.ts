import { describe, expect, it } from "vitest";

import { Money } from "@domain";
import { IntaSendCheckoutPayload } from "@infrastructure/payment/IntaSendCheckoutPayload.js";

describe("IntaSendCheckoutPayload", () => {
  const config = {
    publishableKey: "ISPubKey_test_xxx",
    baseUrl: "https://sandbox.intasend.com",
    host: "https://microtick.test",
    redirectUrl: "https://microtick.test/payment/complete",
  };

  describe("from", () => {
    it("should build a Hosted Checkout payload", () => {
      const payload = IntaSendCheckoutPayload.from(
        {
          phoneNumber: "0712345678",
          amount: Money.fromKES(500),
          reference: "plan-123",
        },
        config,
      );

      expect(payload).toEqual({
        amount: 5,
        currency: "KES",
        phone_number: "254712345678",
        api_ref: "plan-123",

        host: "https://microtick.test",
        redirect_url: "https://microtick.test/payment/complete",

        channel: "WEBSITE",

        mobile_tarrif: "BUSINESS-PAYS",
        card_tarrif: "BUSINESS-PAYS",
      });
    });

    it("should preserve an already normalized phone number", () => {
      const payload = IntaSendCheckoutPayload.from(
        {
          phoneNumber: "254712345678",
          amount: Money.fromKES(500),
          reference: "plan-123",
        },
        config,
      );

      expect(payload.phone_number).toBe("254712345678");
    });

    it("should normalize a phone number without a leading zero", () => {
      const payload = IntaSendCheckoutPayload.from(
        {
          phoneNumber: "712345678",
          amount: Money.fromKES(500),
          reference: "plan-123",
        },
        config,
      );

      expect(payload.phone_number).toBe("254712345678");
    });
  });
});