import { describe, expect, it, vi } from "vitest";

import {
  createCreateOtpChallengeController,
  createVerifyOtpCodeController,
} from "@composition/otp.js";

import { CreateOtpChallengeController } from "@http/otp/controller/CreateOtpChallengeController.js";
import { VerifyOtpCodeController } from "@http/otp/controller/VerifyOtpCodeController.js";

import type { OtpDeliveryProvider } from "@infrastructure/otp/OtpDeliveryService.js";

describe("otp composition", () => {
  it("creates the CreateOtpChallengeController with an injected delivery provider", () => {
    const provider: OtpDeliveryProvider = {
      send: vi.fn(async () => {}),
    };

    const controller = createCreateOtpChallengeController(provider);

    expect(controller).toBeInstanceOf(CreateOtpChallengeController);
    expect(typeof controller.handle).toBe("function");
  });

  // Uses the real Africa's Talking factory construction path (env.otp.* →
  // AfricaTalkingOtpDeliveryProvider). Confirmed safe to construct: the
  // .env.sandbox credentials are Africa's Talking's own documented sandbox
  // values (username "sandbox", an "atsk_"-prefixed API key), and this test
  // only constructs the controller — it never calls .handle() or .send(), so
  // no SMS delivery attempt is made either way.
  it("creates the CreateOtpChallengeController with the default Africa's Talking delivery provider", () => {
    const controller = createCreateOtpChallengeController();

    expect(controller).toBeInstanceOf(CreateOtpChallengeController);
    expect(typeof controller.handle).toBe("function");
  });

  it("creates the VerifyOtpCodeController", () => {
    const controller = createVerifyOtpCodeController();

    expect(controller).toBeInstanceOf(VerifyOtpCodeController);
    expect(typeof controller.handle).toBe("function");
  });
});
