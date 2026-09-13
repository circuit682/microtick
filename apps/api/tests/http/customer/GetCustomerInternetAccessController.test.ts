import { describe, expect, it, vi } from "vitest";

import { GetCustomerInternetAccessController } from "@http/customer/controller/GetCustomerInternetAccessController.js";
import type { GetCustomerInternetAccess } from "@application/access/GetCustomerInternetAccess.js";

import { InternetAccess, InternetAccessStatus } from "@domain";

describe("GetCustomerInternetAccessController", () => {
  it("returns the existing InternetAccess fields", async () => {
    const access = InternetAccess.create({
      id: "access-001",
      purchaseId: "purchase-001",
      customerId: "customer-001",
      grantedAt: new Date("2026-09-14T10:00:00Z"),
      expiresAt: new Date("2026-09-14T11:00:00Z"),
      status: InternetAccessStatus.ACTIVE,
      consumedMinutes: 12,
    });
    const useCase = {
      execute: vi.fn(async () => access),
    } as unknown as GetCustomerInternetAccess;
    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };

    await new GetCustomerInternetAccessController(useCase).handle(
      { params: { customerId: access.customerId } } as never,
      reply as never,
    );

    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      id: access.id,
      purchaseId: access.purchaseId,
      customerId: access.customerId,
      grantedAt: access.grantedAt,
      expiresAt: access.expiresAt,
      status: access.status,
      consumedMinutes: access.consumedMinutes,
    });
  });

  it("returns 404 when access is not found", async () => {
    const useCase = {
      execute: vi.fn(async () => null),
    } as unknown as GetCustomerInternetAccess;
    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };

    await new GetCustomerInternetAccessController(useCase).handle(
      { params: { customerId: "missing-customer" } } as never,
      reply as never,
    );

    expect(reply.code).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Internet access not found.",
    });
  });
});
