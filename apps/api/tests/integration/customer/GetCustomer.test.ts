import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createServer } from "../../../src/server.js";

import { prisma } from "@infrastructure/database/prisma.js";

describe("GET /customers/:customerId", () => {
  beforeEach(async () => {
    await prisma.session.deleteMany();
    await prisma.customer.deleteMany();
  });

  afterEach(async () => {
    await prisma.session.deleteMany();
    await prisma.customer.deleteMany();
  });

  it("returns an existing customer", async () => {
    const customer = await prisma.customer.create({
      data: {
        id: "customer-http-001",
        phoneNumber: "0712345678",
      },
    });

    const server = createServer();

    const response = await server.inject({
      method: "GET",
      url: `/customers/${customer.id}`,
    });

    expect(response.statusCode).toBe(200);

    expect(response.json()).toEqual({
      id: customer.id,
      phoneNumber: customer.phoneNumber,
    });

    await server.close();
  });

  it("returns 404 when the customer does not exist", async () => {
    const server = createServer();

    const response = await server.inject({
      method: "GET",
      url: "/customers/missing-customer",
    });

    expect(response.statusCode).toBe(404);

    await server.close();
  });
});
