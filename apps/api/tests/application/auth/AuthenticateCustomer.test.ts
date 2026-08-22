import { describe, expect, it, vi } from "vitest";

import { AuthenticateCustomer } from "@application/auth/AuthenticateCustomer.js";
import type { AccessTokenService } from "@application/ports/AccessTokenService.js";
import type { OtpVerificationService } from "@application/ports/OtpVerificationService.js";
import { CreateSession } from "@application/session/CreateSession.js";

import { Customer } from "@domain";

import { UlidIdentifierGenerator } from "@infrastructure/identity/UlidIdentifierGenerator.js";

import { InMemoryCustomerRepository } from "../../doubles/customer/InMemoryCustomerRepository.js";
import { InMemorySessionRepository } from "../../doubles/session/InMemorySessionRepository.js";

describe("AuthenticateCustomer", () => {
  it("should verify the customer, create a session and issue an access token", async () => {
    vi.useFakeTimers();

    try {
      const createdAt = new Date("2026-08-16T12:00:00Z");

      vi.setSystemTime(createdAt);

      const sessionExpiresAt = new Date(createdAt.getTime() + 60 * 60 * 1000);

      const customerRepository = new InMemoryCustomerRepository();
      const sessionRepository = new InMemorySessionRepository();

      const otpVerificationService: OtpVerificationService = {
        verify: async (phoneNumber, code) => {
          return phoneNumber === "0712345678" && code === "123456";
        },
      };

      const issuedClaims: {
        customerId: string;
        sessionId: string;
        expiresAt: Date;
      }[] = [];

      const accessTokenService: AccessTokenService = {
        issue: async (claims) => {
          issuedClaims.push(claims);

          return "access-token-123";
        },

        verify: async () => ({
          customerId: "customer-001",
          sessionId: "session-001",
        }),
      };

      const customer = Customer.create({
        id: "customer-001",
        phoneNumber: "0712345678",
      });

      await customerRepository.save(customer);

      const createSession = new CreateSession(
        sessionRepository,
        new UlidIdentifierGenerator(),
      );

      const authenticateCustomer = new AuthenticateCustomer(
        customerRepository,
        otpVerificationService,
        createSession,
        accessTokenService,
      );

      const result = await authenticateCustomer.execute({
        phoneNumber: customer.phoneNumber,
        verificationCode: "123456",
        sessionExpiresAt,
      });

      expect(result.customer.id).toBe(customer.id);
      expect(result.customer.phoneNumber).toBe(customer.phoneNumber);

      expect(result.sessionId).toBeTruthy();
      expect(result.accessToken).toBe("access-token-123");

      expect(issuedClaims).toHaveLength(1);
      expect(issuedClaims[0]?.customerId).toBe(customer.id);
      expect(issuedClaims[0]?.sessionId).toBe(result.sessionId);
      expect(issuedClaims[0]?.expiresAt).toEqual(sessionExpiresAt);

      const session = await sessionRepository.findById(result.sessionId);

      expect(session).not.toBeNull();
      expect(session?.customerId).toBe(customer.id);
      expect(session?.createdAt).toEqual(createdAt);
      expect(session?.expiresAt).toEqual(sessionExpiresAt);
    } finally {
      vi.useRealTimers();
    }
  });

  it("should reject an invalid verification code", async () => {
    const customerRepository = new InMemoryCustomerRepository();
    const sessionRepository = new InMemorySessionRepository();

    const customer = Customer.create({
      id: "customer-001",
      phoneNumber: "0712345678",
    });

    await customerRepository.save(customer);

    const otpVerificationService: OtpVerificationService = {
      verify: async () => false,
    };

    const accessTokenService: AccessTokenService = {
      issue: async () => "should-not-be-issued",

      verify: async () => ({
        customerId: "customer-001",
        sessionId: "session-001",
      }),
    };

    const createSession = new CreateSession(
      sessionRepository,
      new UlidIdentifierGenerator(),
    );

    const authenticateCustomer = new AuthenticateCustomer(
      customerRepository,
      otpVerificationService,
      createSession,
      accessTokenService,
    );

    const sessionExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await expect(
      authenticateCustomer.execute({
        phoneNumber: customer.phoneNumber,
        verificationCode: "wrong-code",
        sessionExpiresAt,
      }),
    ).rejects.toThrow("Invalid verification code.");

    expect(
      await sessionRepository.findActiveByCustomerId(customer.id),
    ).toBeNull();
  });

  it("should reject a verified phone number when the customer does not exist", async () => {
    const customerRepository = new InMemoryCustomerRepository();
    const sessionRepository = new InMemorySessionRepository();

    const otpVerificationService: OtpVerificationService = {
      verify: async () => true,
    };

    const accessTokenService: AccessTokenService = {
      issue: async () => "should-not-be-issued",

      verify: async () => ({
        customerId: "missing-customer",
        sessionId: "session-001",
      }),
    };

    const createSession = new CreateSession(
      sessionRepository,
      new UlidIdentifierGenerator(),
    );

    const authenticateCustomer = new AuthenticateCustomer(
      customerRepository,
      otpVerificationService,
      createSession,
      accessTokenService,
    );

    const sessionExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await expect(
      authenticateCustomer.execute({
        phoneNumber: "0712345678",
        verificationCode: "123456",
        sessionExpiresAt,
      }),
    ).rejects.toThrow("Customer not found.");
  });
});
