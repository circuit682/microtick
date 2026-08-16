import { describe, expect, it } from "vitest";

import { Customer } from "@domain";

describe("Customer", () => {
  it("should create a valid customer", () => {
    const customer = Customer.create({
      id: "customer-001",
      phoneNumber: "0712345678",
    });

    expect(customer.id).toBe("customer-001");
    expect(customer.phoneNumber).toBe("0712345678");
  });

  it("should reject an empty id", () => {
    expect(() =>
      Customer.create({
        id: "",
        phoneNumber: "0712345678",
      }),
    ).toThrow();
  });

  it("should reject an empty phone number", () => {
    expect(() =>
      Customer.create({
        id: "customer-001",
        phoneNumber: "",
      }),
    ).toThrow();
  });

  it("should trim id and phone number", () => {
    const customer = Customer.create({
      id: "  customer-001  ",
      phoneNumber: " 0712345678 ",
    });

    expect(customer.id).toBe("customer-001");
    expect(customer.phoneNumber).toBe("0712345678");
  });

  it("should reconstitute an existing customer", () => {
    const customer = Customer.reconstitute({
      id: "customer-001",
      phoneNumber: "0712345678",
    });

    expect(customer.id).toBe("customer-001");
    expect(customer.phoneNumber).toBe("0712345678");
  });
});
