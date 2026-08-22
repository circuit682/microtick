import { describe, expect, it, vi } from "vitest";

import type { AccessTokenService } from "@application/ports/AccessTokenService.js";

import { createAuthenticateRequest } from "@http/auth/AuthenticateRequest.js";

describe("AuthenticateRequest", () => {
  function createReply() {
    return {
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockResolvedValue(undefined),
    } as any;
  }

  it("should reject a request without an authorization header", async () => {
    const accessTokenService: AccessTokenService = {
      issue: vi.fn(),
      verify: vi.fn(),
    };

    const authenticateRequest = createAuthenticateRequest(accessTokenService);

    const request = {
      headers: {},
    } as any;

    const reply = createReply();

    await authenticateRequest(request, reply);

    expect(reply.code).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Authentication required.",
    });

    expect(accessTokenService.verify).not.toHaveBeenCalled();
  });

  it("should reject a malformed authorization header", async () => {
    const accessTokenService: AccessTokenService = {
      issue: vi.fn(),
      verify: vi.fn(),
    };

    const authenticateRequest = createAuthenticateRequest(accessTokenService);

    const request = {
      headers: {
        authorization: "Basic abc123",
      },
    } as any;

    const reply = createReply();

    await authenticateRequest(request, reply);

    expect(reply.code).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Invalid authorization header.",
    });

    expect(accessTokenService.verify).not.toHaveBeenCalled();
  });

  it("should reject an invalid access token", async () => {
    const accessTokenService: AccessTokenService = {
      issue: vi.fn(),
      verify: vi.fn().mockRejectedValue(new Error("Invalid token")),
    };

    const authenticateRequest = createAuthenticateRequest(accessTokenService);

    const request = {
      headers: {
        authorization: "Bearer invalid-token",
      },
    } as any;

    const reply = createReply();

    await authenticateRequest(request, reply);

    expect(accessTokenService.verify).toHaveBeenCalledWith("invalid-token");

    expect(reply.code).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Invalid access token.",
    });
  });

  it("should attach verified identity to the request", async () => {
    const accessTokenService: AccessTokenService = {
      issue: vi.fn(),
      verify: vi.fn().mockResolvedValue({
        customerId: "customer-001",
        sessionId: "session-001",
      }),
    };

    const authenticateRequest = createAuthenticateRequest(accessTokenService);

    const request = {
      headers: {
        authorization: "Bearer valid-token",
      },
    } as any;

    const reply = createReply();

    await authenticateRequest(request, reply);

    expect(accessTokenService.verify).toHaveBeenCalledWith("valid-token");

    expect(request.auth).toEqual({
      customerId: "customer-001",
      sessionId: "session-001",
    });

    expect(reply.code).not.toHaveBeenCalled();
    expect(reply.send).not.toHaveBeenCalled();
  });
});
