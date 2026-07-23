import { describe, expect, it } from "vitest";
import { InternetAccess } from "@domain";
import { ValidationError, ErrorCode } from "@shared";

describe("InternetAccess", () => {
    it("rejects an expiration before the grant time", () => {
        const grantedAt = new Date("2026-01-01T10:00:00Z");
        const expiresAt = new Date("2026-01-01T09:59:59Z");

        expect(() =>
            InternetAccess.create({
                customerId: "customer-001",
                planId: "plan-hourly",
                grantedAt,
                expiresAt,
            }),
        ).toThrow(
            new ValidationError(
                ErrorCode.ACCESS_INVALID_EXPIRATION,
                "Internet access cannot expire before it is granted.",
            ),
        );
    });
});