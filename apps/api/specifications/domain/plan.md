# Plan Specification

## Purpose

A Plan represents a purchasable internet access offering.

Examples:

- KES 5 for 30 minutes
- KES 10 for 1 hour
- KES 20 for 3 hours
- KES 50 for 24 hours

---

## Responsibilities

A Plan must:

- have a unique identifier
- have a display name
- have a price
- have a duration
- be active or inactive

---

## Business Rules

### Name

- cannot be empty
- should be human readable

Examples:

- Starter
- Student
- Weekend

---

### Price

- must be greater than zero
- stored in Kenyan Shillings (integer)

Examples:

5

10

20

---

### Duration

Stored in minutes.

Examples:

30

60

180

1440

Duration must be greater than zero.

---

### Active

Plans may be:

- Active
- Inactive

Inactive plans cannot be purchased.

---

## Non-Responsibilities

A Plan does not:

- process payments
- communicate with routers
- manage sessions
- authenticate users