import { describe, expect, it } from "vitest";

import { Customer } from "@domain";

import { CustomerMapper } from "@infrastructure/customer/CustomerMapper.js";

describe("CustomerMapper", () => {
  it("should map a domain customer to persistence data", () => {
    const customer = Customer.create({
      id: "customer-001",
      phoneNumber: "0712345678",
    });

    const persistence = CustomerMapper.toPersistence(customer);

    expect(persistence).toEqual({
      id: "customer-001",
      phoneNumber: "0712345678",
    });
  });

  it("should map persistence data back to the domain", () => {
    const domain = CustomerMapper.toDomain({
      id: "customer-001",
      phoneNumber: "0712345678",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(domain.id).toBe("customer-001");
    expect(domain.phoneNumber).toBe("0712345678");
  });
});
