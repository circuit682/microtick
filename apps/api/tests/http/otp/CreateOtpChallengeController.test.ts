import { describe, expect, it, vi } from "vitest";

import { CreateOtpChallengeController } from "@http/otp/controller/CreateOtpChallengeController.js";
import type { CreateOtpChallenge } from "@application/otp/CreateOtpChallenge.js";
import type { OtpDeliveryService } from "@infrastructure/otp/OtpDeliveryService.js";

describe("CreateOtpChallengeController", () => {
  it("creates an OTP challenge, delivers it, and returns a response without the code", async () => {
    const now = new Date("2026-09-14T10:00:00Z");

    vi.useFakeTimers();
    vi.setSystemTime(now);

    try {
      const receivedCommands: {
        phoneNumber: string;
        createdAt: Date;
        expiresAt: Date;
      }[] = [];

      const createOtpChallenge = {
        execute: vi.fn(
          async (command: {
            phoneNumber: string;
            createdAt: Date;
            expiresAt: Date;
          }) => {
            receivedCommands.push(command);
            return {
              challengeId: "challenge-001",
              phoneNumber: command.phoneNumber,
              code: "123456",
              expiresAt: command.expiresAt,
            };
          },
        ),
      } as unknown as CreateOtpChallenge;

      const sentDeliveries: { phoneNumber: string; code: string }[] = [];

      const otpDeliveryService = {
        send: vi.fn(async (options: { phoneNumber: string; code: string }) => {
          sentDeliveries.push(options);
        }),
      } as unknown as OtpDeliveryService;

      const reply = {
        code: vi.fn().mockReturnThis(),
        send: vi.fn(),
      };

      await new CreateOtpChallengeController(
        createOtpChallenge,
        otpDeliveryService,
      ).handle(
        { body: { phoneNumber: "0712345678" } } as never,
        reply as never,
      );

      expect(receivedCommands).toEqual([
        {
          phoneNumber: "0712345678",
          createdAt: now,
          expiresAt: new Date("2026-09-14T10:05:00Z"),
        },
      ]);

      expect(sentDeliveries).toEqual([
        {
          phoneNumber: "0712345678",
          code: "123456",
        },
      ]);

      expect(reply.code).toHaveBeenCalledWith(201);
      expect(reply.send).toHaveBeenCalledWith({
        challengeId: "challenge-001",
        phoneNumber: "0712345678",
        expiresAt: new Date("2026-09-14T10:05:00Z"),
      });

      const sentResponse = reply.send.mock.calls[0]?.[0];
      expect(sentResponse).not.toHaveProperty("code");
    } finally {
      vi.useRealTimers();
    }
  });

  it("rejects a request with an empty phone number without creating or delivering a challenge", async () => {
    const createOtpChallenge = {
      execute: vi.fn(),
    } as unknown as CreateOtpChallenge;

    const otpDeliveryService = {
      send: vi.fn(),
    } as unknown as OtpDeliveryService;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };

    await expect(
      new CreateOtpChallengeController(
        createOtpChallenge,
        otpDeliveryService,
      ).handle({ body: { phoneNumber: "" } } as never, reply as never),
    ).rejects.toThrow();

    expect(createOtpChallenge.execute).not.toHaveBeenCalled();
    expect(otpDeliveryService.send).not.toHaveBeenCalled();
  });
});
