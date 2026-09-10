import { describe, expect, it } from "vitest";

import { InternetAccess, InternetAccessStatus } from "@domain";

import { ErrorCode, ValidationError } from "@shared";

describe("InternetAccess", () => {
  function createAccess(
    status: InternetAccessStatus = InternetAccessStatus.GRANTED,
  ): InternetAccess {
    const grantedAt = new Date("2026-01-01T10:00:00Z");

    const expiresAt = new Date("2026-01-02T10:00:00Z");

    return InternetAccess.create({
      id: "access-001",
      purchaseId: "purchase-001",
      customerId: "customer-001",
      grantedAt,
      expiresAt,
      status,
    });
  }

  describe("Creation", () => {
    it("creates granted internet access", () => {
      const access = createAccess();

      expect(access.id).toBe("access-001");
      expect(access.purchaseId).toBe("purchase-001");
      expect(access.customerId).toBe("customer-001");
      expect(access.status).toBe(InternetAccessStatus.GRANTED);
    });

    it("rejects an expiration before the grant time", () => {
      const grantedAt = new Date("2026-01-01T10:00:00Z");

      const expiresAt = new Date("2026-01-01T09:59:59Z");

      expect(() =>
        InternetAccess.create({
          id: "access-001",
          purchaseId: "purchase-001",
          customerId: "customer-001",
          grantedAt,
          expiresAt,
          status: InternetAccessStatus.GRANTED,
        }),
      ).toThrow(
        new ValidationError(
          ErrorCode.ACCESS_INVALID_EXPIRATION,
          "Internet access cannot expire before it is granted.",
        ),
      );
    });
  });

  describe("Lifecycle", () => {
    it("moves granted access to provisioning", () => {
      const access = createAccess();

      const provisioning = access.beginProvisioning();

      expect(provisioning.status).toBe(InternetAccessStatus.PROVISIONING);

      expect(access.status).toBe(InternetAccessStatus.GRANTED);

      expect(provisioning).not.toBe(access);
    });

    it("moves provisioning access to active", () => {
      const access = createAccess(InternetAccessStatus.PROVISIONING);

      const active = access.activate();

      expect(active.status).toBe(InternetAccessStatus.ACTIVE);

      expect(access.status).toBe(InternetAccessStatus.PROVISIONING);

      expect(active).not.toBe(access);
    });

    it("moves access to expired", () => {
      const access = createAccess(InternetAccessStatus.ACTIVE);

      const expired = access.expire();

      expect(expired.status).toBe(InternetAccessStatus.EXPIRED);

      expect(access.status).toBe(InternetAccessStatus.ACTIVE);

      expect(expired).not.toBe(access);
    });

    it("moves access to revoked", () => {
      const access = createAccess(InternetAccessStatus.ACTIVE);

      const revoked = access.revoke();

      expect(revoked.status).toBe(InternetAccessStatus.REVOKED);

      expect(access.status).toBe(InternetAccessStatus.ACTIVE);

      expect(revoked).not.toBe(access);
    });

    it("moves access to failed", () => {
      const access = createAccess(InternetAccessStatus.PROVISIONING);

      const failed = access.fail();

      expect(failed.status).toBe(InternetAccessStatus.FAILED);

      expect(access.status).toBe(InternetAccessStatus.PROVISIONING);

      expect(failed).not.toBe(access);
    });

    it("returns the same instance when granting already granted access", () => {
      const access = createAccess();

      expect(access.grant()).toBe(access);
    });

    it("returns the same instance when provisioning already provisioning access", () => {
      const access = createAccess(InternetAccessStatus.PROVISIONING);

      expect(access.beginProvisioning()).toBe(access);
    });

    it("returns the same instance when activating already active access", () => {
      const access = createAccess(InternetAccessStatus.ACTIVE);

      expect(access.activate()).toBe(access);
    });

    it("returns the same instance when expiring already expired access", () => {
      const access = createAccess(InternetAccessStatus.EXPIRED);

      expect(access.expire()).toBe(access);
    });

    it("returns the same instance when revoking already revoked access", () => {
      const access = createAccess(InternetAccessStatus.REVOKED);

      expect(access.revoke()).toBe(access);
    });

    it("returns the same instance when failing already failed access", () => {
      const access = createAccess(InternetAccessStatus.FAILED);

      expect(access.fail()).toBe(access);
    });
    it("records actual connected usage duration", () => {
      const access = createAccess();

      const connectedAt = new Date("2026-01-01T10:00:00Z");

      const disconnectedAt = new Date("2026-01-01T10:12:00Z");

      const updated = access.recordUsage(connectedAt, disconnectedAt);

      expect(updated.consumedMinutes).toBe(12);

      expect(access.consumedMinutes).toBe(0);

      expect(updated).not.toBe(access);
    });

    it("accumulates usage across multiple connection intervals", () => {
      const access = createAccess();

      const first = access.recordUsage(
        new Date("2026-01-01T10:00:00Z"),
        new Date("2026-01-01T10:12:00Z"),
      );

      const second = first.recordUsage(
        new Date("2026-01-01T14:00:00Z"),
        new Date("2026-01-01T14:08:00Z"),
      );

      expect(second.consumedMinutes).toBe(20);

      expect(first.consumedMinutes).toBe(12);

      expect(access.consumedMinutes).toBe(0);

      expect(second).not.toBe(first);
    });

    it("records only the new duration when the same RouterOS session is polled again", () => {
      const access = createAccess();

      const first = access.recordSessionUsage(
        "router-session-001",
        new Date("2026-01-01T10:00:00Z"),
        new Date("2026-01-01T10:12:00Z"),
      );

      const second = first.recordSessionUsage(
        "router-session-001",
        new Date("2026-01-01T10:00:00Z"),
        new Date("2026-01-01T10:15:00Z"),
      );

      const duplicate = second.recordSessionUsage(
        "router-session-001",
        new Date("2026-01-01T10:00:00Z"),
        new Date("2026-01-01T10:15:00Z"),
      );

      expect(first.consumedMinutes).toBe(12);
      expect(second.consumedMinutes).toBe(15);
      expect(duplicate).toBe(second);
    });

    it("rejects a connection interval that ends before it starts", () => {
      const access = createAccess();

      const connectedAt = new Date("2026-01-01T10:12:00Z");

      const disconnectedAt = new Date("2026-01-01T10:00:00Z");

      expect(() => access.recordUsage(connectedAt, disconnectedAt)).toThrow(
        new ValidationError(
          ErrorCode.ACCESS_INVALID_USAGE,
          "Internet access usage cannot end before it starts.",
        ),
      );
    });
  });
});
