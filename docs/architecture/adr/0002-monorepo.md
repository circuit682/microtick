# ADR 0002 — Use pnpm as the Package Manager

**Status:** Accepted

## Context

MicroTick is expected to grow into a multi-application workspace.

Dependency duplication should be minimized while maintaining fast
installs.

---

## Decision

Use pnpm workspaces.

---

## Alternatives Considered

- npm workspaces
- Yarn

pnpm provides excellent workspace support and efficient dependency
storage.

---

## Consequences

All contributors should use pnpm.

The workspace lockfile becomes part of source control.

---

## Date

2026-07-13