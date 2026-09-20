import { describe, expect, it, vi } from "vitest";

import { GetCustomerController } from "@http/customer/controller/GetCustomerController.js";
import type { GetCustomer } from "@application/customer/GetCustomer.js";

import { Customer } from "@domain";

describe("GetCustomerController", () => {
  it("returns the customer when found", async () => {
    const customer = Customer.create({
      id: "customer-001",
      phoneNumber: "0712345678",
    });

    const useCase = {
      execute: vi.fn(async () => customer),
    } as unknown as GetCustomer;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };

    await new GetCustomerController(useCase).handle(
      { params: { customerId: customer.id } } as never,
      reply as never,
    );

    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      id: customer.id,
      phoneNumber: customer.phoneNumber,
    });
  });

  it("returns 404 when the customer is not found", async () => {
    const useCase = {
      execute: vi.fn(async () => null),
    } as unknown as GetCustomer;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };

    await new GetCustomerController(useCase).handle(
      { params: { customerId: "missing-customer" } } as never,
      reply as never,
    );

    expect(reply.code).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Customer not found.",
    });
  });
});
