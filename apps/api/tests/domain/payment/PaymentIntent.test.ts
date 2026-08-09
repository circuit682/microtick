import { describe, expect, it } from "vitest";

import {
  Money,
  PaymentDomainError,
  PaymentIntent,
  PaymentStatus,
} from "@domain";

describe("PaymentIntent", () => {
  function createPaymentIntent(): PaymentIntent {
    return PaymentIntent.create({
      id: "payment-intent-1",
      planId: "plan-1",
      amount: Money.fromMinorUnits(500),
      phoneNumber: "0712345678",
      reference: "payment-ref-123",
    });
  }

  describe("creation", () => {
    it("should start in the CREATED state", () => {
      const payment = createPaymentIntent();

      expect(payment.status).toBe(PaymentStatus.CREATED);
    });
  });

  describe("markPending", () => {
    it("should transition from CREATED to PENDING", () => {
      const payment = createPaymentIntent();

      payment.markPending();

      expect(payment.status).toBe(PaymentStatus.PENDING);
    });

    it("should reject transitioning to PENDING twice", () => {
      const payment = createPaymentIntent();

      payment.markPending();

      expect(() => payment.markPending()).toThrow(PaymentDomainError);
    });
  });

  describe("confirm", () => {
    it("should transition from PENDING to COMPLETED", () => {
      const payment = createPaymentIntent();

      payment.markPending();
      payment.confirm();

      expect(payment.status).toBe(PaymentStatus.COMPLETED);
    });

    it("should reject confirming a CREATED payment", () => {
      const payment = createPaymentIntent();

      expect(() => payment.confirm()).toThrow(PaymentDomainError);
    });

    it("should reject confirming an already completed payment", () => {
      const payment = createPaymentIntent();

      payment.markPending();
      payment.confirm();

      expect(() => payment.confirm()).toThrow(PaymentDomainError);
    });

    it("should reject confirming a FAILED payment", () => {
      const payment = createPaymentIntent();

      payment.markPending();
      payment.fail();

      expect(() => payment.confirm()).toThrow(PaymentDomainError);
    });
  });

  describe("fail", () => {
    it("should transition from PENDING to FAILED", () => {
      const payment = createPaymentIntent();

      payment.markPending();
      payment.fail();

      expect(payment.status).toBe(PaymentStatus.FAILED);
    });

    it("should reject failing a CREATED payment", () => {
      const payment = createPaymentIntent();

      expect(() => payment.fail()).toThrow(PaymentDomainError);
    });

    it("should reject failing a COMPLETED payment", () => {
      const payment = createPaymentIntent();

      payment.markPending();
      payment.confirm();

      expect(() => payment.fail()).toThrow(PaymentDomainError);
    });
  });
});
