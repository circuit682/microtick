import { afterEach, describe, expect, it, vi } from "vitest";

import { createServer } from "../../../src/server.js";

describe("POST /payments/purchase", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a hosted checkout session", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "checkout-123",
        url: "https://sandbox.intasend.com/checkout/checkout-123",
      }),
    }) as typeof fetch;

    const server = createServer();

    const response = await server.inject({
      method: "POST",
      url: "/payments/purchase",
      payload: {
        planId: "plan-123",
        phoneNumber: "0712345678",
      },
    });

    expect(response.statusCode).toBe(201);

    expect(response.json()).toEqual({
      providerRequestId: "checkout-123",
      checkoutUrl:
        "https://sandbox.intasend.com/checkout/checkout-123",
    });

    await server.close();
  });
});