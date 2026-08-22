import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createServer } from "../../../src/server.js";

import { prisma } from "@infrastructure/database/prisma.js";
import type { OtpDeliveryProvider } from "@infrastructure/otp/OtpDeliveryService.js";

describe("Customer authentication", () => {
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

  it("authenticates a customer with a valid OTP and returns an access token", async () => {
    let deliveredCode: string | undefined;

    const provider: OtpDeliveryProvider = {
      send: async (_phoneNumber, message) => {
        deliveredCode = message.split(": ").at(-1);
      },
    };

    const customer = await prisma.customer.create({
      data: {
        id: "customer-auth-001",
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

    const body = authenticationResponse.json();

    expect(body).toEqual({
      customer: {
        id: customer.id,
        phoneNumber: customer.phoneNumber,
      },
      sessionId: expect.any(String),
      accessToken: expect.any(String),
    });

    const session = await prisma.session.findUnique({
      where: {
        id: body.sessionId,
      },
    });

    expect(session).not.toBeNull();
    expect(session?.customerId).toBe(customer.id);
    expect(session?.status).toBe("ACTIVE");
    expect(session?.expiresAt.toISOString()).toBe(
      sessionExpiresAt.toISOString(),
    );

    await server.close();
  });

  it("rejects an invalid OTP without creating a session", async () => {
    const customer = await prisma.customer.create({
      data: {
        id: "customer-auth-002",
        phoneNumber: "0798765432",
      },
    });

    const provider: OtpDeliveryProvider = {
      send: async () => undefined,
    };

    const server = createServer(provider);

    const challengeResponse = await server.inject({
      method: "POST",
      url: "/otp/challenge",
      payload: {
        phoneNumber: customer.phoneNumber,
      },
    });

    expect(challengeResponse.statusCode).toBe(201);

    const sessionExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const authenticationResponse = await server.inject({
      method: "POST",
      url: "/auth/authenticate",
      payload: {
        phoneNumber: customer.phoneNumber,
        verificationCode: "000000",
        sessionExpiresAt: sessionExpiresAt.toISOString(),
      },
    });

    expect(authenticationResponse.statusCode).not.toBe(200);

    const session = await prisma.session.findFirst({
      where: {
        customerId: customer.id,
      },
    });

    expect(session).toBeNull();

    await server.close();
  });
});
