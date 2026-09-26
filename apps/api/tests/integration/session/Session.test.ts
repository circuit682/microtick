import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createServer } from "../../../src/server.js";

import { env } from "@config/env.js";
import { prisma } from "@infrastructure/database/prisma.js";
import { JwtAccessTokenService } from "@infrastructure/auth/JwtAccessTokenService.js";

describe("Customer sessions", () => {
  beforeEach(async () => {
    await prisma.session.deleteMany();
    await prisma.customer.deleteMany();
  });

  afterEach(async () => {
    await prisma.session.deleteMany();
    await prisma.customer.deleteMany();
  });

  function createAccessTokenService(): JwtAccessTokenService {
    return new JwtAccessTokenService({
      secret: env.security.jwtSecret,
      issuer: env.security.jwtIssuer,
      audience: env.security.jwtAudience,
    });
  }

  it("creates an active session", async () => {
    const customer = await prisma.customer.create({
      data: {
        id: "customer-session-001",
        phoneNumber: "0712345678",
      },
    });

    // Bootstrap session backing this test's own auth token. Required
    // since authenticateRequest now verifies the token's sessionId
    // against a real, ACTIVE Session row (see authenticateRequest.ts).
    // This is distinct from the NEW session the test actually creates
    // and asserts on below.
    await prisma.session.create({
      data: {
        id: "session-auth-test-001",
        customerId: "customer-session-001",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        status: "ACTIVE",
      },
    });

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const accessTokenService = createAccessTokenService();

    const accessToken = await accessTokenService.issue({
      customerId: customer.id,
      sessionId: "session-auth-test-001",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    const server = createServer();

    const response = await server.inject({
      method: "POST",
      url: `/customers/${customer.id}/session`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        expiresAt: expiresAt.toISOString(),
      },
    });

    expect(response.statusCode).toBe(201);

    const body = response.json();

    expect(body.customerId).toBe(customer.id);
    expect(body.status).toBe("ACTIVE");
    expect(body.expiresAt).toBe(expiresAt.toISOString());

    const stored = await prisma.session.findUnique({
      where: {
        id: body.id,
      },
    });

    expect(stored).not.toBeNull();
    expect(stored?.customerId).toBe(customer.id);
    expect(stored?.status).toBe("ACTIVE");
    expect(stored?.expiresAt.toISOString()).toBe(expiresAt.toISOString());

    await server.close();
  });

  it("returns the customer's active session", async () => {
    const customer = await prisma.customer.create({
      data: {
        id: "customer-session-002",
        phoneNumber: "0798765432",
      },
    });

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const session = await prisma.session.create({
      data: {
        id: "session-http-001",
        customerId: customer.id,
        expiresAt,
        status: "ACTIVE",
      },
    });

    const accessTokenService = createAccessTokenService();

    const accessToken = await accessTokenService.issue({
      customerId: customer.id,
      sessionId: session.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    const server = createServer();

    const response = await server.inject({
      method: "GET",
      url: `/customers/${customer.id}/session`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response.statusCode).toBe(200);

    expect(response.json()).toEqual({
      id: session.id,
      customerId: customer.id,
      createdAt: session.createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: "ACTIVE",
    });

    await server.close();
  });

  it("rejects access to another customer's session", async () => {
    const customerA = await prisma.customer.create({
      data: {
        id: "customer-session-004",
        phoneNumber: "0711111111",
      },
    });

    const customerB = await prisma.customer.create({
      data: {
        id: "customer-session-005",
        phoneNumber: "0722222222",
      },
    });

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.session.create({
      data: {
        id: "session-http-002",
        customerId: customerB.id,
        expiresAt,
        status: "ACTIVE",
      },
    });

    // Bootstrap session backing customerA's own auth token, for the
    // same reason as the first test above.
    await prisma.session.create({
      data: {
        id: "session-auth-test-004",
        customerId: customerA.id,
        expiresAt,
        status: "ACTIVE",
      },
    });

    const accessTokenService = createAccessTokenService();

    const accessToken = await accessTokenService.issue({
      customerId: customerA.id,
      sessionId: "session-auth-test-004",
      expiresAt,
    });

    const server = createServer();

    const response = await server.inject({
      method: "GET",
      url: `/customers/${customerB.id}/session`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response.statusCode).toBe(403);

    await server.close();
  });
});
