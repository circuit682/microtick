import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { Customer } from "@domain";

import { prisma } from "@infrastructure/database/prisma.js";
import { PrismaCustomerRepository } from "@infrastructure/customer/PrismaCustomerRepository.js";

describe("PrismaCustomerRepository", () => {
  const repository = new PrismaCustomerRepository();

  beforeEach(async () => {
    await prisma.session.deleteMany();
    await prisma.customer.deleteMany();
  });

  afterEach(async () => {
    await prisma.session.deleteMany();
    await prisma.customer.deleteMany();
  });

  it("should save and retrieve a customer by id", async () => {
    const customer = Customer.create({
      id: "customer-001",
      phoneNumber: "0712345678",
    });

    await repository.save(customer);

    const stored = await repository.findById(customer.id);

    expect(stored).not.toBeNull();
    expect(stored?.id).toBe(customer.id);
    expect(stored?.phoneNumber).toBe(customer.phoneNumber);
  });

  it("should find a customer by phone number", async () => {
    const customer = Customer.create({
      id: "customer-002",
      phoneNumber: "0723456789",
    });

    await repository.save(customer);

    const stored = await repository.findByPhoneNumber(customer.phoneNumber);

    expect(stored).not.toBeNull();
    expect(stored?.id).toBe(customer.id);
    expect(stored?.phoneNumber).toBe(customer.phoneNumber);
  });

  it("should return null when the customer does not exist", async () => {
    const stored = await repository.findById("missing-customer");

    expect(stored).toBeNull();
  });

  it("should return null when the phone number does not exist", async () => {
    const stored = await repository.findByPhoneNumber("0799999999");

    expect(stored).toBeNull();
  });

  it("should update an existing customer", async () => {
    const customer = Customer.create({
      id: "customer-003",
      phoneNumber: "0734567890",
    });

    await repository.save(customer);

    const updated = Customer.reconstitute({
      id: customer.id,
      phoneNumber: "0745678901",
    });

    await repository.save(updated);

    const stored = await repository.findById(customer.id);

    expect(stored).not.toBeNull();
    expect(stored?.phoneNumber).toBe("0745678901");
  });
});
