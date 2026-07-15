# Domain-First Architecture

## Adopt Domain-Driven Design as the Core Domain Modeling Strategy
Business concepts live in src/domain.
Business logic is independent of Express, Prisma, RouterOS, and TinyPesa.
Infrastructure depends on the domain—not the other way around.