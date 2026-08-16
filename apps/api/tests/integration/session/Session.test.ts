import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createServer } from "../../../src/server.js";

import { prisma } from "@infrastructure/database/prisma.js";

describe("Customer sessions", () => {
  beforeEach(async () => {
    await prisma.session.deleteMany();
    await prisma.customer.deleteMany();
  });

  afterEach(async () => {
    await prisma.session.deleteMany();
    await prisma.customer.deleteMany();
  });

  it("creates an active session", async () => {
    const customer = await prisma.customer.create({
      data: {
        id: "customer-session-001",
        phoneNumber: "0712345678",
      },
    });

    const server = createServer();

    const response = await server.inject({
      method: "POST",
      url: `/customers/${customer.id}/session`,
      payload: {
        expiresAt: "2026-08-16T14:00:00.000Z",
      },
    });

    expect(response.statusCode).toBe(201);

    const body = response.json();

    expect(body.customerId).toBe(customer.id);
    expect(body.status).toBe("ACTIVE");
    expect(body.expiresAt).toBe("2026-08-16T14:00:00.000Z");

    const stored = await prisma.session.findUnique({
      where: {
        id: body.id,
      },
    });

    expect(stored).not.toBeNull();
    expect(stored?.customerId).toBe(customer.id);
    expect(stored?.status).toBe("ACTIVE");

    await server.close();
  });

  it("returns the customer's active session", async () => {
    const customer = await prisma.customer.create({
      data: {
        id: "customer-session-002",
        phoneNumber: "0798765432",
      },
    });

    const session = await prisma.session.create({
      data: {
        id: "session-http-001",
        customerId: customer.id,
        expiresAt: new Date("2026-08-16T14:00:00.000Z"),
        status: "ACTIVE",
      },
    });

    const server = createServer();

    const response = await server.inject({
      method: "GET",
      url: `/customers/${customer.id}/session`,
    });

    expect(response.statusCode).toBe(200);

    expect(response.json()).toEqual({
      id: session.id,
      customerId: customer.id,
      createdAt: session.createdAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
      status: "ACTIVE",
    });

    await server.close();
  });

  it("returns 404 when the customer has no active session", async () => {
    const customer = await prisma.customer.create({
      data: {
        id: "customer-session-003",
        phoneNumber: "0700000000",
      },
    });

    const server = createServer();

    const response = await server.inject({
      method: "GET",
      url: `/customers/${customer.id}/session`,
    });

    expect(response.statusCode).toBe(404);

    await server.close();
  });
});
