import { describe, expect, it, vi } from "vitest";

import { VerifyOtpCodeController } from "@http/otp/controller/VerifyOtpCodeController.js";
import type { VerifyOtpCode } from "@application/otp/VerifyOtpCode.js";

describe("VerifyOtpCodeController", () => {
  it.each([true, false])(
    "returns the verification result (%s) from the use case",
    async (verified) => {
      const now = new Date("2026-09-14T10:00:00Z");

      vi.useFakeTimers();
      vi.setSystemTime(now);

      try {
        const receivedCommands: {
          challengeId: string;
          phoneNumber: string;
          code: string;
          now: Date;
        }[] = [];

        const verifyOtpCode = {
          execute: vi.fn(
            async (command: {
              challengeId: string;
              phoneNumber: string;
              code: string;
              now: Date;
            }) => {
              receivedCommands.push(command);
              return verified;
            },
          ),
        } as unknown as VerifyOtpCode;

        const reply = {
          code: vi.fn().mockReturnThis(),
          send: vi.fn(),
        };

        await new VerifyOtpCodeController(verifyOtpCode).handle(
          {
            body: {
              challengeId: "challenge-001",
              phoneNumber: "0712345678",
              code: "123456",
            },
          } as never,
          reply as never,
        );

        expect(receivedCommands).toEqual([
          {
            challengeId: "challenge-001",
            phoneNumber: "0712345678",
            code: "123456",
            now,
          },
        ]);

        expect(reply.code).toHaveBeenCalledWith(200);
        expect(reply.send).toHaveBeenCalledWith({ verified });
      } finally {
        vi.useRealTimers();
      }
    },
  );

  it("rejects a request missing a required field without verifying", async () => {
    const verifyOtpCode = {
      execute: vi.fn(),
    } as unknown as VerifyOtpCode;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };

    await expect(
      new VerifyOtpCodeController(verifyOtpCode).handle(
        {
          body: {
            challengeId: "challenge-001",
            phoneNumber: "0712345678",
            code: "",
          },
        } as never,
        reply as never,
      ),
    ).rejects.toThrow();

    expect(verifyOtpCode.execute).not.toHaveBeenCalled();
  });
});
