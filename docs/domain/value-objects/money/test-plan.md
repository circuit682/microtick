# Money Value Object — Test Plan

**Status:** Ready (Red Phase)

---

## Objective

This document defines the executable specification for the `Money` value object.

Every requirement listed here must first be implemented as a failing test before any production code is written.

---

## Construction

- [ ] Creates a Money instance from a valid amount.
- [ ] Creates a zero-value Money instance.
- [ ] Rejects undefined amounts.
- [ ] Rejects null amounts.
- [ ] Rejects NaN.
- [ ] Rejects positive infinity.
- [ ] Rejects negative infinity.
- [ ] Rejects negative monetary values.

---

## Currency

- [ ] Requires a valid currency.
- [ ] Stores the supplied currency.
- [ ] Preserves currency after construction.

---

## Equality

- [ ] Equal amounts and currencies are equal.
- [ ] Different amounts are not equal.
- [ ] Different currencies are not equal.

---

## Arithmetic

### Addition

- [ ] Adds two Money values.
- [ ] Returns a new immutable instance.
- [ ] Does not mutate operands.

### Subtraction

- [ ] Subtracts a smaller amount.
- [ ] Returns a new immutable instance.
- [ ] Prevents invalid negative results.

---

## Comparison

- [ ] Less than.
- [ ] Less than or equal.
- [ ] Greater than.
- [ ] Greater than or equal.

---

## Zero

- [ ] Supports zero monetary values.
- [ ] Zero equals zero.
- [ ] Zero behaves correctly during arithmetic.

---

## Immutability

- [ ] All operations return new instances.
- [ ] Original instances remain unchanged.

---

## Serialization

- [ ] Serializes correctly.
- [ ] Deserializes without information loss.

---

## Definition of Done

The `Money` value object is complete only when:

- Every test passes.
- No primitive monetary values remain in the domain where `Money` is appropriate.
- Coverage for the value object is effectively complete.