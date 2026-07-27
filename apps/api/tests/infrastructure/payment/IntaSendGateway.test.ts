import { describe, expect, it, vi } from "vitest";

import { Money } from "@domain";
import { IntaSendGateway } from "@infrastructure/payment/IntaSendGateway.js";
import { IntaSendCheckoutError } from "@infrastructure/payment/errors/IntaSendCheckoutError.js";

describe("IntaSendGateway", () => {
  describe("requestPayment", () => {
    it("should create an IntaSend Hosted Checkout session", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: "9542d2e6-4372-47bb-9ec4-1fbf8f3f4c82",
          url: "https://sandbox.intasend.com/checkout/9542d2e6-4372-47bb-9ec4-1fbf8f3f4c82",
        }),
      });

      globalThis.fetch = fetchMock as typeof fetch;

      const gateway = new IntaSendGateway({
        publishableKey: "ISPubKey_test_xxx",
        baseUrl: "https://sandbox.intasend.com",
        host: "https://microtick.test",
        redirectUrl: "https://microtick.test/payment/complete",
      });

      const request = {
        phoneNumber: "0712345678",
        amount: Money.fromMinorUnits(500),
        reference: "plan-123",
      };

      const response = await gateway.requestPayment(request);

      expect(response).toEqual({
        providerRequestId: "9542d2e6-4372-47bb-9ec4-1fbf8f3f4c82",
        checkoutUrl:
          "https://sandbox.intasend.com/checkout/9542d2e6-4372-47bb-9ec4-1fbf8f3f4c82",
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);

      expect(fetchMock).toHaveBeenCalledWith(
        "https://sandbox.intasend.com/api/v1/checkout/",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-IntaSend-Public-API-Key": "ISPubKey_test_xxx",
          },
        }),
      );

      const options = fetchMock.mock.calls[0]![1] as RequestInit;
      const payload = JSON.parse(options.body as string);

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

    it("should throw when IntaSend rejects the checkout request", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => "Invalid request",
      });

      globalThis.fetch = fetchMock as typeof fetch;

      const gateway = new IntaSendGateway({
        publishableKey: "ISPubKey_test_xxx",
        baseUrl: "https://sandbox.intasend.com",
        host: "https://microtick.test",
        redirectUrl: "https://microtick.test/payment/complete",
      });

      await expect(
  gateway.requestPayment({
    phoneNumber: "0712345678",
    amount: Money.fromMinorUnits(500),
    reference: "plan-123",
  }),
).rejects.toBeInstanceOf(IntaSendCheckoutError);

await expect(
  gateway.requestPayment({
    phoneNumber: "0712345678",
    amount: Money.fromMinorUnits(500),
    reference: "plan-123",
  }),
).rejects.toThrow("IntaSend checkout creation failed: 400 Invalid request");
    });
  });
});