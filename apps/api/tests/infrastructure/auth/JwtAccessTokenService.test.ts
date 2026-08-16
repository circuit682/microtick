import { describe, expect, it } from "vitest";

import { JwtAccessTokenService } from "@infrastructure/auth/JwtAccessTokenService.js";

describe("JwtAccessTokenService", () => {
  const secret = new TextEncoder().encode(
    "microtick-test-secret-that-is-long-enough",
  );

  function createService(): JwtAccessTokenService {
    return new JwtAccessTokenService({
      secret,
      issuer: "microtick",
      audience: "microtick-api",
    });
  }

  it("should issue a token containing the customer and session identity", async () => {
    const service = createService();

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const token = await service.issue({
      customerId: "customer-001",
      sessionId: "session-001",
      expiresAt,
    });

    expect(token).toBeTruthy();
    expect(token.split(".")).toHaveLength(3);

    const verified = await service.verify(token);

    expect(verified).toEqual({
      customerId: "customer-001",
      sessionId: "session-001",
    });
  });

  it("should reject a token signed with another secret", async () => {
    const service = createService();

    const token = await service.issue({
      customerId: "customer-001",
      sessionId: "session-001",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    const otherService = new JwtAccessTokenService({
      secret: new TextEncoder().encode(
        "another-secret-that-is-long-enough-for-testing",
      ),
      issuer: "microtick",
      audience: "microtick-api",
    });

    await expect(otherService.verify(token)).rejects.toThrow();
  });

  it("should reject a token with the wrong audience", async () => {
    const service = createService();

    const token = await service.issue({
      customerId: "customer-001",
      sessionId: "session-001",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    const otherAudienceService = new JwtAccessTokenService({
      secret,
      issuer: "microtick",
      audience: "another-api",
    });

    await expect(otherAudienceService.verify(token)).rejects.toThrow();
  });

  it("should reject an expired token", async () => {
    const service = createService();

    const token = await service.issue({
      customerId: "customer-001",
      sessionId: "session-001",
      expiresAt: new Date(Date.now() - 1000),
    });

    await expect(service.verify(token)).rejects.toThrow();
  });
});
