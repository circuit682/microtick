# MicroTick API

The MicroTick API is the backend application responsible for implementing
the business rules that power the Wamacani WiFi platform.

## Responsibilities

- Manage hotspot plans
- Manage customer sessions
- Manage the Session Wallet engine
- Integrate with payment providers
- Communicate with supported routers
- Provide APIs for the Captive Portal
- Provide APIs for the Admin Dashboard

## Principles

- Business logic is framework-independent.
- External services are accessed through interfaces.
- Every feature follows Test-Driven Development (TDD).
- Production-quality code from the first implementation.