# ADR 0003 — Strict TypeScript Configuration

**Status:** Accepted

## Context

MicroTick is intended to operate payment and networking workflows.

Compile-time safety should prevent avoidable runtime failures.

---

## Decision

Adopt a shared strict TypeScript baseline.

Application-specific configuration should extend the root
configuration rather than duplicate it.

---

## Alternatives Considered

Relaxed compiler settings.

---

## Consequences

Developers receive earlier feedback during development.

The codebase maintains consistent compiler behavior across all
applications.

---

## Date

2026-07-13