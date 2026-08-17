import { describe, expect, it } from "vitest";

import { OtpDeliveryService } from "@infrastructure/otp/OtpDeliveryService.js";

describe("OtpDeliveryService", () => {
  it("should send the OTP to the requested phone number", async () => {
    const sent: {
      phoneNumber: string;
      message: string;
    }[] = [];

    const provider = {
      send: async (phoneNumber: string, message: string): Promise<void> => {
        sent.push({
          phoneNumber,
          message,
        });
      },
    };

    const service = new OtpDeliveryService(provider);

    await service.send({
      phoneNumber: "0712345678",
      code: "123456",
    });

    expect(sent).toHaveLength(1);
    expect(sent[0]?.phoneNumber).toBe("0712345678");
    expect(sent[0]?.message).toContain("123456");
  });

  it("should use the OTP code only as delivery content", async () => {
    const sent: string[] = [];

    const provider = {
      send: async (_phoneNumber: string, message: string): Promise<void> => {
        sent.push(message);
      },
    };

    const service = new OtpDeliveryService(provider);

    await service.send({
      phoneNumber: "0712345678",
      code: "654321",
    });

    expect(sent).toHaveLength(1);
    expect(sent[0]).toContain("654321");
  });

  it("should propagate provider delivery failures", async () => {
    const provider = {
      send: async (): Promise<void> => {
        throw new Error("OTP delivery failed.");
      },
    };

    const service = new OtpDeliveryService(provider);

    await expect(
      service.send({
        phoneNumber: "0712345678",
        code: "123456",
      }),
    ).rejects.toThrow("OTP delivery failed.");
  });

  it("should not generate or verify OTP codes", async () => {
    const provider = {
      send: async (): Promise<void> => undefined,
    };

    const service = new OtpDeliveryService(provider);

    expect(service).toHaveProperty("send");
    expect(Object.getOwnPropertyNames(Object.getPrototypeOf(service))).toEqual([
      "constructor",
      "send",
    ]);
  });
});
