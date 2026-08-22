import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createServer } from "../../../src/server.js";

import { prisma } from "@infrastructure/database/prisma.js";
import type { OtpDeliveryProvider } from "@infrastructure/otp/OtpDeliveryService.js";

describe("OTP", () => {
  beforeEach(async () => {
    await prisma.otpChallenge.deleteMany();
  });

  afterEach(async () => {
    await prisma.otpChallenge.deleteMany();
  });

  it("creates an OTP challenge and delivers the generated code", async () => {
    const delivered: {
      phoneNumber: string;
      message: string;
    }[] = [];

    const provider: OtpDeliveryProvider = {
      send: async (phoneNumber, message) => {
        delivered.push({
          phoneNumber,
          message,
        });
      },
    };

    const server = createServer(provider);

    const response = await server.inject({
      method: "POST",
      url: "/otp/challenge",
      payload: {
        phoneNumber: "0712345678",
      },
    });

    expect(response.statusCode).toBe(201);

    const body = response.json();

    expect(body.challengeId).toEqual(expect.any(String));
    expect(body.phoneNumber).toBe("0712345678");
    expect(body.expiresAt).toEqual(expect.any(String));

    expect(delivered).toHaveLength(1);
    expect(delivered[0]?.phoneNumber).toBe("0712345678");
    expect(delivered[0]?.message).toMatch(
      /^Your MicroTick verification code is: \d{6}$/,
    );

    const stored = await prisma.otpChallenge.findUnique({
      where: {
        id: body.challengeId,
      },
    });

    expect(stored).not.toBeNull();
    expect(stored?.phoneNumber).toBe("0712345678");
    expect(stored?.codeHash).toBeTruthy();
    expect(stored?.codeHash).not.toContain(
      delivered[0]?.message.split(": ").at(-1) ?? "",
    );

    await server.close();
  });

  it("verifies a delivered OTP code", async () => {
    let deliveredCode: string | undefined;

    const provider: OtpDeliveryProvider = {
      send: async (_phoneNumber, message) => {
        deliveredCode = message.split(": ").at(-1);
      },
    };

    const server = createServer(provider);

    const challengeResponse = await server.inject({
      method: "POST",
      url: "/otp/challenge",
      payload: {
        phoneNumber: "0712345678",
      },
    });

    expect(challengeResponse.statusCode).toBe(201);

    const challenge = challengeResponse.json();

    expect(deliveredCode).toMatch(/^\d{6}$/);

    const verifyResponse = await server.inject({
      method: "POST",
      url: "/otp/verify",
      payload: {
        challengeId: challenge.challengeId,
        phoneNumber: "0712345678",
        code: deliveredCode,
      },
    });

    expect(verifyResponse.statusCode).toBe(200);
    expect(verifyResponse.json()).toEqual({
      verified: true,
    });

    await server.close();
  });

  it("rejects an incorrect OTP code", async () => {
    const provider: OtpDeliveryProvider = {
      send: async () => undefined,
    };

    const server = createServer(provider);

    const challengeResponse = await server.inject({
      method: "POST",
      url: "/otp/challenge",
      payload: {
        phoneNumber: "0712345678",
      },
    });

    expect(challengeResponse.statusCode).toBe(201);

    const challenge = challengeResponse.json();

    const verifyResponse = await server.inject({
      method: "POST",
      url: "/otp/verify",
      payload: {
        challengeId: challenge.challengeId,
        phoneNumber: "0712345678",
        code: "000000",
      },
    });

    expect(verifyResponse.statusCode).toBe(200);
    expect(verifyResponse.json()).toEqual({
      verified: false,
    });

    await server.close();
  });

  it("rejects an OTP code for a different phone number", async () => {
    let deliveredCode: string | undefined;

    const provider: OtpDeliveryProvider = {
      send: async (_phoneNumber, message) => {
        deliveredCode = message.split(": ").at(-1);
      },
    };

    const server = createServer(provider);

    const challengeResponse = await server.inject({
      method: "POST",
      url: "/otp/challenge",
      payload: {
        phoneNumber: "0712345678",
      },
    });

    expect(challengeResponse.statusCode).toBe(201);

    const challenge = challengeResponse.json();

    const verifyResponse = await server.inject({
      method: "POST",
      url: "/otp/verify",
      payload: {
        challengeId: challenge.challengeId,
        phoneNumber: "0798765432",
        code: deliveredCode,
      },
    });

    expect(verifyResponse.statusCode).toBe(200);
    expect(verifyResponse.json()).toEqual({
      verified: false,
    });

    await server.close();
  });

  it("rejects an expired OTP code", async () => {
    let deliveredCode: string | undefined;

    const provider: OtpDeliveryProvider = {
      send: async (_phoneNumber, message) => {
        deliveredCode = message.split(": ").at(-1);
      },
    };

    const server = createServer(provider);

    const challengeResponse = await server.inject({
      method: "POST",
      url: "/otp/challenge",
      payload: {
        phoneNumber: "0712345678",
      },
    });

    expect(challengeResponse.statusCode).toBe(201);

    const challenge = challengeResponse.json();

    await prisma.otpChallenge.update({
      where: {
        id: challenge.challengeId,
      },
      data: {
        expiresAt: new Date(Date.now() - 1000),
      },
    });

    const verifyResponse = await server.inject({
      method: "POST",
      url: "/otp/verify",
      payload: {
        challengeId: challenge.challengeId,
        phoneNumber: "0712345678",
        code: deliveredCode,
      },
    });

    expect(verifyResponse.statusCode).toBe(200);
    expect(verifyResponse.json()).toEqual({
      verified: false,
    });

    await server.close();
  });
});
