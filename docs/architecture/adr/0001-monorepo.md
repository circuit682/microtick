# ADR 0001 — Adopt a Monorepo Architecture

**Status:** Accepted

## Context

MicroTick will consist of multiple applications and shared libraries,
including the backend API, captive portal, administration dashboard,
and reusable packages.

Managing these as separate repositories would introduce duplicated
configuration, fragmented versioning, and additional coordination.

---

## Decision

The project will be developed as a single pnpm workspace (monorepo).

Applications will live under:

apps/

Shared libraries will be introduced under:

packages/

when they are justified by actual reuse.

---

## Alternatives Considered

### Multiple repositories

Pros

- Smaller repositories

Cons

- Version synchronization
- Duplicate tooling
- Harder refactoring

### Monorepo

Pros

- Shared tooling
- Atomic commits
- Easier refactoring
- Consistent CI

Cons

- Slightly larger repository

---

## Consequences

Applications can evolve independently while sharing common
infrastructure and coding standards.

The repository becomes the single source of truth for the platform.

---

## Date

2026-07-13