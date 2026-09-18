import { describe, expect, it, vi } from "vitest";

import { env } from "@config/env.js";
import { authenticateRequest } from "@http/auth/middleware/authenticateRequest.js";
import { JwtAccessTokenService } from "@infrastructure/auth/JwtAccessTokenService.js";

describe("authenticateRequest", () => {
  const accessTokenService = new JwtAccessTokenService({
    secret: env.security.jwtSecret,
    issuer: env.security.jwtIssuer,
    audience: env.security.jwtAudience,
  });

  function createReply() {
    return {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
  }

  it("rejects a request with no Authorization header", async () => {
    const request = { headers: {}, params: {} };
    const reply = createReply();

    await authenticateRequest(request as never, reply as never);

    expect(reply.code).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Authentication required.",
    });
  });

  it("rejects a request whose Authorization header is not a Bearer token", async () => {
    const request = {
      headers: { authorization: "Basic abc123" },
      params: {},
    };
    const reply = createReply();

    await authenticateRequest(request as never, reply as never);

    expect(reply.code).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Authentication required.",
    });
  });

  it("rejects a request with an empty bearer token", async () => {
    const request = {
      headers: { authorization: "Bearer    " },
      params: {},
    };
    const reply = createReply();

    await authenticateRequest(request as never, reply as never);

    expect(reply.code).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Authentication required.",
    });
  });

  it("rejects a request bearing a malformed token", async () => {
    const request = {
      headers: { authorization: "Bearer not-a-real-jwt" },
      params: {},
    };
    const reply = createReply();

    await authenticateRequest(request as never, reply as never);

    expect(reply.code).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Invalid access token.",
    });
  });

  it("allows a request with a valid token and no customerId param", async () => {
    const token = await accessTokenService.issue({
      customerId: "customer-001",
      sessionId: "session-001",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    const request = {
      headers: { authorization: `Bearer ${token}` },
      params: {},
    };
    const reply = createReply();

    await authenticateRequest(request as never, reply as never);

    expect(reply.code).not.toHaveBeenCalled();
    expect(reply.send).not.toHaveBeenCalled();
    expect(
      (
        request as unknown as {
          auth: { customerId: string; sessionId: string };
        }
      ).auth.customerId,
    ).toBe("customer-001");
    expect(
      (
        request as unknown as {
          auth: { customerId: string; sessionId: string };
        }
      ).auth.sessionId,
    ).toBe("session-001");
  });

  it("allows a request with a valid token whose customerId param matches the token", async () => {
    const token = await accessTokenService.issue({
      customerId: "customer-001",
      sessionId: "session-001",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    const request = {
      headers: { authorization: `Bearer ${token}` },
      params: { customerId: "customer-001" },
    };
    const reply = createReply();

    await authenticateRequest(request as never, reply as never);

    expect(reply.code).not.toHaveBeenCalled();
    expect(reply.send).not.toHaveBeenCalled();
  });

  it("rejects a request with a valid token whose customerId param does not match the token", async () => {
    const token = await accessTokenService.issue({
      customerId: "customer-001",
      sessionId: "session-001",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    const request = {
      headers: { authorization: `Bearer ${token}` },
      params: { customerId: "customer-999" },
    };
    const reply = createReply();

    await authenticateRequest(request as never, reply as never);

    expect(reply.code).toHaveBeenCalledWith(403);
    expect(reply.send).toHaveBeenCalledWith({
      message: "You are not authorized to access this customer.",
    });
  });
});
