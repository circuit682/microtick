import { describe, expect, it, vi } from "vitest";

import {
  AfricaTalkingOtpDeliveryProvider,
  type AfricaTalkingOtpDeliveryProviderOptions,
} from "@infrastructure/otp/AfricaTalkingOtpDeliveryProvider.js";

describe("AfricaTalkingOtpDeliveryProvider", () => {
  const options: AfricaTalkingOtpDeliveryProviderOptions = {
    username: "sandbox",
    apiKey: "test-api-key",
    senderId: "MicroTick",
  };

  it("should send the phone number and message through Africa's Talking", async () => {
    const send = vi.fn().mockResolvedValue({
      SMSMessageData: {
        Recipients: [
          {
            status: "Success",
            messageId: "AT-message-001",
          },
        ],
      },
    });

    const createClient = vi.fn(() => ({
      SMS: {
        send,
      },
    }));

    const provider = new AfricaTalkingOtpDeliveryProvider(
      options,
      createClient,
    );

    await provider.send(
      "+254712345678",
      "Your MicroTick verification code is: 123456",
    );

    expect(createClient).toHaveBeenCalledWith({
      username: "sandbox",
      apiKey: "test-api-key",
    });

    expect(send).toHaveBeenCalledWith({
      to: ["+254712345678"],
      message: "Your MicroTick verification code is: 123456",
      from: "MicroTick",
    });
  });

  it("should omit the sender id when none is configured", async () => {
    const send = vi.fn().mockResolvedValue({
      SMSMessageData: {
        Recipients: [
          {
            status: "Success",
          },
        ],
      },
    });

    const createClient = vi.fn(() => ({
      SMS: {
        send,
      },
    }));

    const provider = new AfricaTalkingOtpDeliveryProvider(
      {
        username: "sandbox",
        apiKey: "test-api-key",
      },
      createClient,
    );

    await provider.send(
      "+254712345678",
      "Your MicroTick verification code is: 123456",
    );

    expect(send).toHaveBeenCalledWith({
      to: ["+254712345678"],
      message: "Your MicroTick verification code is: 123456",
    });
  });

  it("should reject when Africa's Talking reports delivery failure", async () => {
    const createClient = () => ({
      SMS: {
        send: vi.fn().mockResolvedValue({
          SMSMessageData: {
            Recipients: [
              {
                status: "Failed",
              },
            ],
          },
        }),
      },
    });

    const provider = new AfricaTalkingOtpDeliveryProvider(
      options,
      createClient,
    );

    await expect(
      provider.send(
        "+254712345678",
        "Your MicroTick verification code is: 123456",
      ),
    ).rejects.toThrow("Africa's Talking OTP delivery failed: Failed");
  });

  it("should reject when Africa's Talking returns no recipient result", async () => {
    const createClient = () => ({
      SMS: {
        send: vi.fn().mockResolvedValue({
          SMSMessageData: {
            Recipients: [],
          },
        }),
      },
    });

    const provider = new AfricaTalkingOtpDeliveryProvider(
      options,
      createClient,
    );

    await expect(
      provider.send(
        "+254712345678",
        "Your MicroTick verification code is: 123456",
      ),
    ).rejects.toThrow("Africa's Talking returned no SMS recipient result.");
  });

  it("should propagate provider request failures", async () => {
    const createClient = () => ({
      SMS: {
        send: vi
          .fn()
          .mockRejectedValue(new Error("Africa's Talking unavailable.")),
      },
    });

    const provider = new AfricaTalkingOtpDeliveryProvider(
      options,
      createClient,
    );

    await expect(
      provider.send(
        "+254712345678",
        "Your MicroTick verification code is: 123456",
      ),
    ).rejects.toThrow("Africa's Talking unavailable.");
  });
});
