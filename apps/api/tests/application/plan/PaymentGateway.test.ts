import { describe, expectTypeOf, it } from "vitest";

import type {
  PaymentGateway,
} from "@application/payment/PaymentGateway.js";

describe("PaymentGateway", () => {
  it("should define a contract for requesting payments", () => {
    expectTypeOf<PaymentGateway>().toBeObject();
  });
});