import { describe, expect, it, vi } from "vitest";

import { Money } from "@domain";
import { IntaSendGateway } from "@infrastructure/payment/IntaSendGateway.js";

describe("IntaSendGateway", () => {
  describe("buildPaymentPayload", () => {
    it("should build the IntaSend STK Push payload", () => {
      const payload = IntaSendGateway.buildPaymentPayload({
        phoneNumber: "0712345678",
        amount: Money.fromKES(500),
        reference: "plan-123",
      });

      expect(payload).toEqual({
        amount: 5,
        phone_number: "254712345678",
        api_ref: "plan-123",
      });
    });
  });

  describe("requestPayment", () => {
    it("should return the IntaSend invoice id", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: "9542d2e6-4372-47bb-9ec4-1fbf8f3f4c82",
          invoice: {
            invoice_id: "QWKOV0Q",
            state: "PENDING",
            provider: "M-PESA",
            charges: 0,
            net_amount: "5.00",
            currency: "KES",
            value: 5,
            account: "254712345678",
            api_ref: "microtick-test-001",
          },
        }),
      });

      globalThis.fetch = fetchMock as typeof fetch;

      const gateway = new IntaSendGateway({
        apiKey: "ISSecretKey_test_xxx",
        baseUrl: "https://sandbox.intasend.com/api",
      });

      const request = {
        phoneNumber: "0712345678",
        amount: Money.fromKES(500),
        reference: "plan-123",
      };

      const response = await gateway.requestPayment(request);

      expect(response).toEqual({
        providerRequestId: "QWKOV0Q",
      });

      expect(fetchMock).toHaveBeenCalledWith(
        "https://sandbox.intasend.com/api/v1/payment/mpesa-stk-push/",
        expect.objectContaining({
          method: "POST",
          headers: {
            Authorization: "Bearer ISSecretKey_test_xxx",
            "Content-Type": "application/json",
          },
        }),
      );

      // Ensure exactly one HTTP request was made.
      expect(fetchMock).toHaveBeenCalledTimes(1);

      // Retrieve the RequestInit argument passed to fetch.
      const options = fetchMock.mock.calls[0]![1] as RequestInit;

      // Verify the serialized payload without depending on JSON property order.
      expect(JSON.parse(options.body as string)).toEqual(
        IntaSendGateway.buildPaymentPayload(request),
      );
    });
  });
});