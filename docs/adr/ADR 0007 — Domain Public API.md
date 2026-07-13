ADR 0007 — Domain Public API

Status
Accepted

Context

The domain layer contains multiple bounded contexts
(plan, session, payment, router, etc.).

Decision

The domain exposes a single public entry point:

@domain

Each bounded context exposes its own barrel (index.ts).

The root domain index re-exports those bounded contexts.

Consumers must never import implementation files directly.

Preferred:

import { Plan } from "@domain";

Avoid:

import { Plan } from "@domain/plan/Plan";

Rationale

- Stable public API
- Easier refactoring
- Cleaner imports
- Implementation details remain private