# Money Value Object — Design Decisions

**Status:** Accepted

---

# ADR-MONEY-001

## Decision

Store monetary values internally using **integer minor units**.

Examples:

- KES 5.00 → 500
- KES 12.50 → 1250

### Rationale

- Eliminates floating-point precision errors.
- Produces deterministic arithmetic.
- Aligns with financial software best practices.
- Future-proofs the domain for fractional pricing.

---

# ADR-MONEY-002

## Decision

`Money` is immutable.

Every operation returns a new instance.

### Rationale

- Prevents accidental mutation.
- Simplifies reasoning.
- Improves thread safety.
- Supports functional programming practices.

---

# ADR-MONEY-003

## Decision

Construction will be controlled through factory methods rather than public mutation.

Example:

```ts
Money.fromKES(500)
```

### Rationale

- Centralizes validation.
- Makes invalid construction impossible.
- Produces expressive domain code.

---

# ADR-MONEY-004

## Decision

`Money` represents a value, not an identity.

Equality is determined solely by amount and currency.

### Rationale

Two monetary values with identical amount and currency represent the same business concept regardless of where they were created.

---

# Future Considerations

The MVP supports only:

- KES

Future versions may introduce:

- USD
- EUR
- GBP

The design should accommodate additional currencies without requiring changes to existing aggregates.