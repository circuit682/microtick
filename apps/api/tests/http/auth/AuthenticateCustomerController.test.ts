import { describe, expect, it, vi } from "vitest";

import { AuthenticateCustomerController } from "@http/auth/controller/AuthenticateCustomerController.js";
import type { AuthenticateCustomer } from "@application/auth/AuthenticateCustomer.js";

import { Customer } from "@domain";

describe("AuthenticateCustomerController", () => {
  it("authenticates the customer and returns the session and access token", async () => {
    const customer = Customer.create({
      id: "customer-001",
      phoneNumber: "0712345678",
    });

    const receivedCommands: {
      phoneNumber: string;
      verificationCode: string;
      sessionExpiresAt: Date;
    }[] = [];

    const authenticateCustomer = {
      execute: vi.fn(
        async (command: {
          phoneNumber: string;
          verificationCode: string;
          sessionExpiresAt: Date;
        }) => {
          receivedCommands.push(command);
          return {
            customer,
            sessionId: "session-001",
            accessToken: "access-token-123",
          };
        },
      ),
    } as unknown as AuthenticateCustomer;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };

    await new AuthenticateCustomerController(authenticateCustomer).handle(
      {
        body: {
          phoneNumber: "0712345678",
          verificationCode: "123456",
          sessionExpiresAt: "2026-09-14T11:00:00.000Z",
        },
      } as never,
      reply as never,
    );

    expect(receivedCommands).toEqual([
      {
        phoneNumber: "0712345678",
        verificationCode: "123456",
        sessionExpiresAt: new Date("2026-09-14T11:00:00.000Z"),
      },
    ]);

    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      customer: {
        id: customer.id,
        phoneNumber: customer.phoneNumber,
      },
      sessionId: "session-001",
      accessToken: "access-token-123",
    });
  });

  it("rejects a request with a non-ISO sessionExpiresAt without authenticating", async () => {
    const authenticateCustomer = {
      execute: vi.fn(),
    } as unknown as AuthenticateCustomer;

    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };

    await expect(
      new AuthenticateCustomerController(authenticateCustomer).handle(
        {
          body: {
            phoneNumber: "0712345678",
            verificationCode: "123456",
            sessionExpiresAt: "not-a-date",
          },
        } as never,
        reply as never,
      ),
    ).rejects.toThrow();

    expect(authenticateCustomer.execute).not.toHaveBeenCalled();
  });
});
