import { describe, expect, it } from "vitest";

import {
  createGetCustomerController,
  createGetCustomerInternetAccessController,
  createGetCustomerPurchasesController,
} from "@composition/customer.js";

import { GetCustomerController } from "@http/customer/controller/GetCustomerController.js";
import { GetCustomerInternetAccessController } from "@http/customer/controller/GetCustomerInternetAccessController.js";
import { GetCustomerPurchasesController } from "@http/customer/controller/GetCustomerPurchasesController.js";

describe("customer composition", () => {
  it("creates the GetCustomerController", () => {
    const controller = createGetCustomerController();

    expect(controller).toBeInstanceOf(GetCustomerController);
    expect(typeof controller.handle).toBe("function");
  });

  it("creates the GetCustomerInternetAccessController", () => {
    const controller = createGetCustomerInternetAccessController();

    expect(controller).toBeInstanceOf(GetCustomerInternetAccessController);
    expect(typeof controller.handle).toBe("function");
  });

  it("creates the GetCustomerPurchasesController", () => {
    const controller = createGetCustomerPurchasesController();

    expect(controller).toBeInstanceOf(GetCustomerPurchasesController);
    expect(typeof controller.handle).toBe("function");
  });
});
