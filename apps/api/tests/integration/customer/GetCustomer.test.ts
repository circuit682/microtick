import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createServer } from "../../../src/server.js";

import { prisma } from "@infrastructure/database/prisma.js";
import type { OtpDeliveryProvider } from "@infrastructure/otp/OtpDeliveryService.js";

describe("GET /customers/:customerId", () => {
  beforeEach(async () => {
    await prisma.session.deleteMany();
    await prisma.otpChallenge.deleteMany();
    await prisma.customer.deleteMany();
  });

  afterEach(async () => {
    await prisma.session.deleteMany();
    await prisma.otpChallenge.deleteMany();
    await prisma.customer.deleteMany();
  });

  it("returns an existing customer", async () => {
    let deliveredCode: string | undefined;

    const provider: OtpDeliveryProvider = {
      send: async (_phoneNumber, message) => {
        deliveredCode = message.split(": ").at(-1);
      },
    };

    const customer = await prisma.customer.create({
      data: {
        id: "customer-http-001",
        phoneNumber: "0712345678",
      },
    });

    const server = createServer(provider);

    const challengeResponse = await server.inject({
      method: "POST",
      url: "/otp/challenge",
      payload: {
        phoneNumber: customer.phoneNumber,
      },
    });

    expect(challengeResponse.statusCode).toBe(201);
    expect(deliveredCode).toMatch(/^\d{6}$/);

    const sessionExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const authenticationResponse = await server.inject({
      method: "POST",
      url: "/auth/authenticate",
      payload: {
        phoneNumber: customer.phoneNumber,
        verificationCode: deliveredCode,
        sessionExpiresAt: sessionExpiresAt.toISOString(),
      },
    });

    expect(authenticationResponse.statusCode).toBe(200);

    const { accessToken } = authenticationResponse.json();

    const response = await server.inject({
      method: "GET",
      url: `/customers/${customer.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response.statusCode).toBe(200);

    expect(response.json()).toEqual({
      id: customer.id,
      phoneNumber: customer.phoneNumber,
    });

    await server.close();
  });

  it("rejects access to a customer that does not match the authenticated customer", async () => {
    let deliveredCode: string | undefined;

    const provider: OtpDeliveryProvider = {
      send: async (_phoneNumber, message) => {
        deliveredCode = message.split(": ").at(-1);
      },
    };

    const customer = await prisma.customer.create({
      data: {
        id: "customer-http-002",
        phoneNumber: "0798765432",
      },
    });

    const server = createServer(provider);

    const challengeResponse = await server.inject({
      method: "POST",
      url: "/otp/challenge",
      payload: {
        phoneNumber: customer.phoneNumber,
      },
    });

    expect(challengeResponse.statusCode).toBe(201);
    expect(deliveredCode).toMatch(/^\d{6}$/);

    const sessionExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const authenticationResponse = await server.inject({
      method: "POST",
      url: "/auth/authenticate",
      payload: {
        phoneNumber: customer.phoneNumber,
        verificationCode: deliveredCode,
        sessionExpiresAt: sessionExpiresAt.toISOString(),
      },
    });

    expect(authenticationResponse.statusCode).toBe(200);

    const { accessToken } = authenticationResponse.json();

    const response = await server.inject({
      method: "GET",
      url: "/customers/missing-customer",
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response.statusCode).toBe(403);

    await server.close();
  });

  it("rejects access to another customer's profile", async () => {
    let deliveredCode: string | undefined;

    const provider: OtpDeliveryProvider = {
      send: async (_phoneNumber, message) => {
        deliveredCode = message.split(": ").at(-1);
      },
    };

    const authenticatedCustomer = await prisma.customer.create({
      data: {
        id: "customer-http-003",
        phoneNumber: "0700000001",
      },
    });

    const otherCustomer = await prisma.customer.create({
      data: {
        id: "customer-http-004",
        phoneNumber: "0700000002",
      },
    });

    const server = createServer(provider);

    const challengeResponse = await server.inject({
      method: "POST",
      url: "/otp/challenge",
      payload: {
        phoneNumber: authenticatedCustomer.phoneNumber,
      },
    });

    expect(challengeResponse.statusCode).toBe(201);
    expect(deliveredCode).toMatch(/^\d{6}$/);

    const sessionExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const authenticationResponse = await server.inject({
      method: "POST",
      url: "/auth/authenticate",
      payload: {
        phoneNumber: authenticatedCustomer.phoneNumber,
        verificationCode: deliveredCode,
        sessionExpiresAt: sessionExpiresAt.toISOString(),
      },
    });

    expect(authenticationResponse.statusCode).toBe(200);

    const { accessToken } = authenticationResponse.json();

    const response = await server.inject({
      method: "GET",
      url: `/customers/${otherCustomer.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response.statusCode).toBe(403);

    await server.close();
  });
});
