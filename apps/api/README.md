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

## RouterOS Usage Accounting

The access lifecycle records active HotSpot session usage and reconciles
completed sessions from RouterOS HotSpot login/logout log entries. The CHR is
configured with a UTC offset (`+00:00`), so RouterOS log timestamps are
interpreted as UTC.

The CHR stores these logs in memory. If RouterOS restarts or evicts old log
entries, the API cannot recover completed-session history that is no longer
available. Usage accounting is therefore exact while the relevant log entries
remain available and best-effort across log loss.

## Principles

- Business logic is framework-independent.
- External services are accessed through interfaces.
- Every feature follows Test-Driven Development (TDD).
- Production-quality code from the first implementation.
