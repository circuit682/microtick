import { describe, expect, it, vi } from "vitest";

import { CreateSessionController } from "@http/session/controller/CreateSessionController.js";
import type { CreateSession } from "@application/session/CreateSession.js";

import { Session, SessionStatus } from "@domain";

describe("CreateSessionController", () => {
  it("creates a session from the request body and returns it", async () => {
    const session = Session.create({
      id: "session-001",
      customerId: "customer-001",
      createdAt: new Date("2026-09-14T10:00:00Z"),
      expiresAt: new Date("2026-09-14T11:00:00Z"),
      status: SessionStatus.ACTIVE,
    });

    const receivedCommands: { customerId: string; expiresAt: Date }[] = [];

    const useCase = {
      execute: vi.fn(
        async (command: { customerId: string; expiresAt: Date }) => {
          receivedCommands.push(command);
          return session;
        },
      ),
    } as unknown as CreateSession;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };

    await new CreateSessionController(useCase).handle(
      {
        params: { customerId: session.customerId },
        body: { expiresAt: "2026-09-14T11:00:00Z" },
      } as never,
      reply as never,
    );

    expect(receivedCommands).toEqual([
      {
        customerId: session.customerId,
        expiresAt: new Date("2026-09-14T11:00:00Z"),
      },
    ]);

    expect(reply.code).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalledWith({
      id: session.id,
      customerId: session.customerId,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      status: session.status,
    });
  });
});
