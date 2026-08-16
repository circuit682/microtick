import { describe, expect, it } from "vitest";

import { GetCustomer } from "@application/customer/GetCustomer.js";

import { Customer } from "@domain";

import { InMemoryCustomerRepository } from "../../doubles/customer/InMemoryCustomerRepository.js";

describe("GetCustomer", () => {
  it("should return the customer when the customer exists", async () => {
    const repository = new InMemoryCustomerRepository();

    const customer = Customer.create({
      id: "customer-001",
      phoneNumber: "0712345678",
    });

    await repository.save(customer);

    const getCustomer = new GetCustomer(repository);

    const result = await getCustomer.execute({
      customerId: customer.id,
    });

    expect(result).not.toBeNull();
    expect(result?.id).toBe(customer.id);
    expect(result?.phoneNumber).toBe(customer.phoneNumber);
  });

  it("should return null when the customer does not exist", async () => {
    const repository = new InMemoryCustomerRepository();

    const getCustomer = new GetCustomer(repository);

    const result = await getCustomer.execute({
      customerId: "missing-customer",
    });

    expect(result).toBeNull();
  });
});
