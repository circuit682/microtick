import { describe, expect, it } from "vitest";

import {
  createAuthenticateCustomer,
  createAuthenticateCustomerController,
} from "@composition/auth.js";

import { AuthenticateCustomer } from "@application/auth/AuthenticateCustomer.js";
import { AuthenticateCustomerController } from "@http/auth/controller/AuthenticateCustomerController.js";

describe("auth composition", () => {
  it("creates the AuthenticateCustomer use case", () => {
    const useCase = createAuthenticateCustomer();

    expect(useCase).toBeInstanceOf(AuthenticateCustomer);
    expect(typeof useCase.execute).toBe("function");
  });

  it("creates the AuthenticateCustomerController", () => {
    const controller = createAuthenticateCustomerController();

    expect(controller).toBeInstanceOf(AuthenticateCustomerController);
    expect(typeof controller.handle).toBe("function");
  });
});
