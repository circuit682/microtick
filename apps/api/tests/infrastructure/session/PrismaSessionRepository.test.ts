import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { Customer, Session, SessionStatus } from "@domain";

import { prisma } from "@infrastructure/database/prisma.js";
import { PrismaCustomerRepository } from "@infrastructure/customer/PrismaCustomerRepository.js";
import { PrismaSessionRepository } from "@infrastructure/session/PrismaSessionRepository.js";

describe("PrismaSessionRepository", () => {
  const customerRepository = new PrismaCustomerRepository();
  const repository = new PrismaSessionRepository();

  beforeEach(async () => {
    await prisma.session.deleteMany();
    await prisma.customer.deleteMany();
  });

  afterEach(async () => {
    await prisma.session.deleteMany();
    await prisma.customer.deleteMany();
  });

  async function createCustomer(): Promise<Customer> {
    const customer = Customer.create({
      id: "customer-001",
      phoneNumber: "0712345678",
    });

    await customerRepository.save(customer);

    return customer;
  }

  function createSession(
    customerId: string,
    overrides: Partial<{
      id: string;
      createdAt: Date;
      expiresAt: Date;
      status: SessionStatus;
    }> = {},
  ): Session {
    return Session.create({
      id: overrides.id ?? "session-001",
      customerId,
      createdAt: overrides.createdAt ?? new Date("2026-08-16T10:00:00Z"),
      expiresAt: overrides.expiresAt ?? new Date("2026-08-16T11:00:00Z"),
      status: overrides.status ?? SessionStatus.ACTIVE,
    });
  }

  it("should save and retrieve a session by id", async () => {
    const customer = await createCustomer();
    const session = createSession(customer.id);

    await repository.save(session);

    const stored = await repository.findById(session.id);

    expect(stored).not.toBeNull();
    expect(stored?.id).toBe(session.id);
    expect(stored?.customerId).toBe(session.customerId);
    expect(stored?.createdAt).toEqual(session.createdAt);
    expect(stored?.expiresAt).toEqual(session.expiresAt);
    expect(stored?.status).toBe(SessionStatus.ACTIVE);
  });

  it("should find the active session belonging to a customer", async () => {
    const customer = await createCustomer();

    const session = createSession(customer.id);

    await repository.save(session);

    const stored = await repository.findActiveByCustomerId(customer.id);

    expect(stored).not.toBeNull();
    expect(stored?.id).toBe(session.id);
    expect(stored?.customerId).toBe(customer.id);
    expect(stored?.status).toBe(SessionStatus.ACTIVE);
  });

  it("should not return an expired session as active", async () => {
    const customer = await createCustomer();

    const session = createSession(customer.id, {
      status: SessionStatus.EXPIRED,
    });

    await repository.save(session);

    const stored = await repository.findActiveByCustomerId(customer.id);

    expect(stored).toBeNull();
  });

  it("should not return a revoked session as active", async () => {
    const customer = await createCustomer();

    const session = createSession(customer.id, {
      status: SessionStatus.REVOKED,
    });

    await repository.save(session);

    const stored = await repository.findActiveByCustomerId(customer.id);

    expect(stored).toBeNull();
  });

  it("should return null when the session does not exist", async () => {
    const stored = await repository.findById("missing-session");

    expect(stored).toBeNull();
  });

  it("should return null when a customer has no active session", async () => {
    const customer = await createCustomer();

    const stored = await repository.findActiveByCustomerId(customer.id);

    expect(stored).toBeNull();
  });

  it("should return the most recently created active session", async () => {
    const customer = await createCustomer();

    const older = createSession(customer.id, {
      id: "session-old",
      createdAt: new Date("2026-08-16T10:00:00Z"),
      expiresAt: new Date("2026-08-16T11:00:00Z"),
    });

    const newer = createSession(customer.id, {
      id: "session-new",
      createdAt: new Date("2026-08-16T10:30:00Z"),
      expiresAt: new Date("2026-08-16T11:30:00Z"),
    });

    await repository.save(older);
    await repository.save(newer);

    const stored = await repository.findActiveByCustomerId(customer.id);

    expect(stored).not.toBeNull();
    expect(stored?.id).toBe(newer.id);
  });
});
