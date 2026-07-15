# ENGINEERING_HANDBOOK.md

> **MicroTick Engineering Handbook**
>
> **Status:** Active
>
> **Version:** 1.0
>
> This handbook defines the engineering philosophy, architectural principles, development workflow, and project conventions that govern the MicroTick codebase. It exists to ensure that every contribution—whether by a human engineer or an AI coding assistant—is intentional, consistent, and aligned with the long-term vision of the project.

---

# Table of Contents

1. Purpose
2. Vision
3. Engineering Philosophy
4. Core Principles
5. Domain-First Development Lifecycle
6. Repository Structure
7. Repository Responsibilities
8. Naming Conventions
9. Documentation Standards
10. Testing Standards
11. Domain Modeling Standards
12. Error Handling Standards
13. Architectural Decision Records (ADRs)
14. Git & Commit Standards
15. Definition of Done
16. Future Evolution Guidelines
17. Architecture Freeze v1.0

---

# 1. Purpose

MicroTick is engineered using a Domain-First architecture.

The primary asset of the project is **the business domain**, not the API, database, framework, or user interface.

Every engineering decision should preserve the clarity, independence, and correctness of the domain model.

Infrastructure exists to support the domain.

The domain never exists to support infrastructure.

This handbook serves as the engineering constitution of the project. It establishes the standards by which architectural decisions are made and provides a consistent reference for all future development.

---

# 2. Vision

MicroTick is intended to become a maintainable, extensible, and well-modeled software system.

The project values:

* clarity over cleverness
* simplicity over unnecessary abstraction
* correctness over speed
* explicitness over magic
* business language over technical jargon

The objective is not simply to build software that works, but software whose architecture remains understandable as the system grows.

---

# 3. Engineering Philosophy

The following beliefs guide all engineering decisions within MicroTick.

## 3.1 The Domain is the Product

Business concepts are the heart of the system.

Everything else exists to support those concepts.

---

## 3.2 Infrastructure is Replaceable

Express, Prisma, RouterOS integrations, TinyPesa integrations, databases, and external APIs are implementation details.

The domain must remain independent of all external technologies.

---

## 3.3 Business Language Comes First

The code should speak the language of the business.

Classes, methods, tests, documentation, and specifications should read naturally within the problem domain.

---

## 3.4 Every Abstraction Must Be Earned

MicroTick intentionally avoids premature abstraction.

New layers, patterns, and architectural concepts are introduced only when a real business problem justifies them.

---

## 3.5 Documentation is Part of the Architecture

Documentation is not optional.

It explains architectural intent.

It records decisions.

It preserves reasoning.

---

# 4. Core Principles

Every engineering decision should satisfy these principles.

## Principle 1

The domain is the single source of truth.

---

## Principle 2

Infrastructure depends on the domain.

The domain never depends on infrastructure.

---

## Principle 3

Business rules belong inside domain models.

---

## Principle 4

Protect invariants at construction.

Invalid domain objects must never exist.

---

## Principle 5

Prefer immutability.

Objects should not change unless mutation is itself part of the business model.

---

## Principle 6

Prefer explicit behavior over implicit behavior.

---

## Principle 7

Tests describe business behavior.

They do not verify implementation details.

---

## Principle 8

Documentation records intent.

Code records implementation.

---

# 5. Domain-First Development Lifecycle

Every new domain concept follows the same lifecycle.

Business Requirement

↓

Domain Specification

↓

Architecture Decision (if required)

↓

Executable Test Plan

↓

Red

↓

Green

↓

Refactor

↓

Commit

No implementation begins before the business concept has been specified.

---

# 6. Repository Structure

The repository communicates architectural boundaries.

Each top-level folder has a specific responsibility.

```
docs/
    architecture/
        adr/
        ENGINEERING_HANDBOOK.md

    domain/
        value-objects/
        entities/
        aggregates/

apps/
    api/
        src/
            application/
            domain/
            infrastructure/
            shared/
```

Folders should communicate intent before implementation.

---

# 7. Repository Responsibilities

## docs/

Contains architectural knowledge.

Documentation should explain why the software is designed the way it is.

---

## docs/architecture/

Contains architectural decisions and engineering guidance.

---

## docs/domain/

Contains business specifications.

Specifications describe the domain independently of implementation.

---

## application/

Coordinates use cases.

Contains application services.

No business rules belong here.

---

## domain/

Contains the business model.

This is the heart of the project.

Everything inside this folder should remain independent of frameworks.

---

## infrastructure/

Contains adapters.

Examples include:

* databases
* payment gateways
* RouterOS
* HTTP frameworks
* persistence

Infrastructure implements the needs of the domain.

---

## shared/

Contains project-wide shared functionality that does not belong to a single domain concept.

As the project evolves, reusable domain building blocks may be promoted into a dedicated Domain Kernel.

---

# 8. Naming Conventions

## Folders

Use lowercase directory names.

```
plan/
money/
payment/
```

---

## Classes

Use PascalCase.

```
Plan
Money
Voucher
Payment
```

---

## Interfaces

Construction data should use the Props suffix.

Example:

```
PlanProps
```

---

## Test Names

Describe observable business behavior.

Preferred style:

```
should create...

should reject...

should calculate...
```

Avoid implementation-focused wording.

---

## Specifications

Describe business concepts.

Do not describe implementation.

---

# 9. Documentation Standards

MicroTick distinguishes between several forms of documentation.

## ADRs

Explain why architectural decisions were made.

---

## Specifications

Describe business requirements.

---

## Test Plans

Describe executable business behavior.

---

## Engineering Handbook

Defines project-wide standards.

---

Documentation should evolve alongside the code.

---

# 10. Testing Standards

Testing follows Test-Driven Development.

Every feature begins with a failing test.

Tests should:

* verify one behavior
* describe business outcomes
* avoid implementation details
* remain readable

Use the Given–When–Then structure.

Example:

Given

Business context.

When

The domain performs an action.

Then

The expected business behavior occurs.

---

# 11. Domain Modeling Standards

The domain should evolve toward expressive models.

## Value Objects

Introduce value objects whenever a business concept owns validation or behavior.

Examples:

Money

PlanId

Duration

Currency

Avoid primitive obsession.

---

## Entities

Represent concepts with identity.

---

## Aggregates

Protect consistency boundaries.

Only introduce aggregates when the business requires transactional consistency.

---

## Immutability

Prefer immutable models.

Operations should return new instances whenever appropriate.

---

## Behavior

Behavior belongs inside domain models.

Avoid anemic models.

---

# 12. Error Handling Standards

Errors represent business failures.

Domain errors should:

* expose an error code
* expose meaningful metadata
* remain framework independent

Avoid throwing generic exceptions.

Business logic should communicate business failures.

---

# 13. Architectural Decision Records

Architectural decisions should be documented whenever they change the long-term direction of the project.

An ADR should answer:

Why was this decision made?

What alternatives were considered?

What consequences does this decision have?

Do not create ADRs for trivial implementation details.

---

# 14. Git & Commit Standards

Commits should represent one logical change.

Every commit should leave the repository in a working state.

Use Conventional Commits.

Examples:

```
feat(domain): introduce Money value object

test(money): specify construction behavior

docs(adr): establish domain-first architecture

refactor(plan): replace primitive price with Money
```

Do not mix unrelated work in a single commit.

---

# 15. Definition of Done

A feature is complete only when:

✓ Business specification exists.

✓ Architecture decisions have been documented when necessary.

✓ Test plan exists.

✓ Tests pass.

✓ Domain invariants are enforced.

✓ Code follows project conventions.

✓ Documentation has been updated where appropriate.

✓ The feature can be understood independently.

---

# 16. Future Evolution Guidelines

MicroTick should evolve incrementally.

Introduce abstractions only when justified by the domain.

Examples of concepts that should not be introduced prematurely include:

* CQRS
* Event Sourcing
* Mediators
* Generic Repositories
* Domain Events
* Specification Pattern
* Dependency Injection Frameworks

Architectural complexity must always be earned.

As the domain grows, additional concepts may naturally emerge, including:

* Value Objects
* Aggregate Roots
* Domain Kernel
* Unique Entity Identifiers
* Rich Domain Services

These should appear only when supported by real business requirements.

---

# 17. Architecture Freeze v1.0

The following architectural decisions are now considered stable.

## Domain-First Architecture

Business concepts live inside the domain.

Infrastructure depends on the domain.

The domain never depends on infrastructure.

---

## Engineering Workflow

Every domain concept follows the documented development lifecycle.

No implementation begins before specification.

---

## Testing Philosophy

Tests describe business behavior.

They do not verify implementation.

---

## Documentation Philosophy

Architecture is documented.

Business concepts are specified.

Engineering decisions are recorded.

---

## Repository Philosophy

The repository should communicate intent before implementation.

Folders, files, and documentation should make the architecture understandable without reading source code.

---

## Simplicity

MicroTick intentionally favors a small number of well-understood concepts over a large collection of patterns.

Every abstraction must justify its existence.

No architectural decision should be introduced solely because it is fashionable or commonly used elsewhere.

---

# Closing Statement

This handbook is the engineering constitution of MicroTick.

It exists to preserve architectural integrity, guide future contributors, and ensure that every feature strengthens rather than weakens the domain model.

Whenever uncertainty arises, the domain should take precedence over infrastructure, business language should take precedence over technical convenience, and simplicity should take precedence over unnecessary abstraction.

The long-term success of MicroTick depends not on the number of features it contains, but on the clarity, consistency, and maintainability of the architecture that supports them.
