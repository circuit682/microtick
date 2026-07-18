import { describe, expect, it } from "vitest";

import { Money, PaymentIntent } from "@domain";

describe("PaymentIntent", () => {
  it("should start in the created state", () => {
    // Given
    const paymentIntent = new PaymentIntent({
      amount: Money.fromKES(500),
      phoneNumber: "254712345678",
    });

    // Then
    expect(paymentIntent.status).toBe("CREATED");
  });
});