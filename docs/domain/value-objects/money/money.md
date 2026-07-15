# Money Value Object

**Status:** Approved

## Purpose

`Money` represents a monetary value within the MicroTick domain.

It replaces primitive numeric values (`number`) wherever money is part of the business model, ensuring every monetary amount is valid, immutable, and expressive.

---

## Responsibilities

`Money` is responsible for representing:

- Plan prices
- Payment amounts
- Voucher values
- Refunds
- Discounts
- Revenue totals

It is **not** responsible for:

- Payment processing
- Currency conversion
- Tax calculations
- Database persistence
- User interface formatting

---

## Invariants

A valid `Money` instance must always satisfy the following rules:

1. Amount must be defined.
2. Amount must be finite.
3. Amount cannot be negative.
4. Currency must always be specified.
5. Instances are immutable.

---

## Equality

Two `Money` objects are equal when both their amount and currency are equal.

Identity is irrelevant.

---

## Internal Representation

Money is stored internally using the **smallest currency unit** (minor units).

Example:

| Display | Stored |
|---------|-------:|
| KES 5.00 | 500 |
| KES 12.50 | 1250 |

This avoids floating-point precision issues.

---

## Public Behaviour

`Money` supports domain operations including:

- Addition
- Subtraction
- Comparison
- Equality
- Zero value

All operations return new immutable instances.

---

## Design Principles

- Immutable
- Framework independent
- Database independent
- Serializable
- Side-effect free
- Fully testable

---

## Acceptance Criteria

`Money` is complete when:

- All invariants are enforced.
- Equality behaves correctly.
- Integer minor units are used internally.
- Every behaviour is specified through TDD before implementation.
- No aggregate accepts primitive monetary values where `Money` is appropriate.