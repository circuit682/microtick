import { describe, expect, it, vi } from "vitest";

import { GetActiveSessionController } from "@http/session/controller/GetActiveSessionController.js";
import type { GetActiveSession } from "@application/session/GetActiveSession.js";

import { Session, SessionStatus } from "@domain";

describe("GetActiveSessionController", () => {
  it("returns the active session when found", async () => {
    const session = Session.create({
      id: "session-001",
      customerId: "customer-001",
      createdAt: new Date("2026-09-14T10:00:00Z"),
      expiresAt: new Date("2026-09-14T11:00:00Z"),
      status: SessionStatus.ACTIVE,
    });

    const useCase = {
      execute: vi.fn(async () => session),
    } as unknown as GetActiveSession;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };

    await new GetActiveSessionController(useCase).handle(
      { params: { customerId: session.customerId } } as never,
      reply as never,
    );

    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      id: session.id,
      customerId: session.customerId,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      status: session.status,
    });
  });

  it("returns 404 when there is no active session", async () => {
    const useCase = {
      execute: vi.fn(async () => null),
    } as unknown as GetActiveSession;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };

    await new GetActiveSessionController(useCase).handle(
      { params: { customerId: "missing-customer" } } as never,
      reply as never,
    );

    expect(reply.code).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Active session not found.",
    });
  });
});
