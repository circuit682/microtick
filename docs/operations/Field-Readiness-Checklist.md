# MicroTick Field Readiness Checklist

This checklist is for deploying the API against production payment credentials,
production infrastructure, and a physical or production RouterOS device. It is
separate from the Network Access Lifecycle acceptance test, which currently
proves lifecycle behavior with deterministic adapters.

## Release Gate

Do not begin field testing until every required item is checked and evidence is
attached to the release record.

## Production Credentials

- [ ] Create production IntaSend credentials.
- [ ] Set `INTASEND_BASE_URL` to the production API base URL.
- [ ] Configure the production payment redirect URL.
- [ ] Configure the production webhook URL and verify delivery.
- [ ] Create production OTP provider credentials and sender configuration.
- [ ] Generate unique production values for `JWT_SECRET`, `OTP_HASH_SECRET`, and
      `NETWORK_IDENTITY_ENCRYPTION_KEY`.
- [ ] Store secrets outside the repository and restrict access to the runtime.
- [ ] Confirm no sandbox credentials are present in the production environment.

## Database and Migrations

- [ ] Provision a production PostgreSQL database with private network access.
- [ ] Use a strong database password and TLS-protected database connection where
      supported.
- [ ] Run `pnpm prisma migrate deploy` against the production database before
      starting the API.
- [ ] Confirm the usage cursor migration is applied, including
      `usageSessionId` and `usageRecordedThrough`.
- [ ] Verify application startup against the migrated schema.
- [ ] Confirm the database user has only the required permissions.

## RouterOS Hardware

- [ ] Confirm the hardware RouterOS version is compatible with the CHR-tested
      commands.
- [ ] Confirm RouterOS API access is enabled from the API host.
- [ ] Confirm HotSpot is configured with the intended server and profile.
- [ ] Confirm the API user can read active sessions and logs.
- [ ] Confirm the API user can create and remove HotSpot users.
- [ ] Confirm the API user can remove active HotSpot sessions.
- [ ] Repeat the controlled login/logout experiment on the target hardware.
- [ ] Confirm the hardware clock uses UTC or update the timestamp handling before
      release.

## RouterOS TLS

- [ ] Prefer RouterOS API-SSL on port `8729`.
- [ ] Set `ROUTEROS_TLS=true` in production.
- [ ] Validate certificate trust and hostname behavior in the deployment network.
- [ ] Confirm port `8728` is not exposed beyond the trusted management network.
- [ ] Verify the API connection, session reads, log reads, and cleanup commands
      over the selected transport.

## Webhooks and Payments

- [ ] Send a production test checkout using a controlled amount or provider test
      mechanism approved for field testing.
- [ ] Verify the webhook reaches the deployed API over HTTPS.
- [ ] Verify duplicate webhook delivery is idempotent.
- [ ] Verify invalid or unauthenticated webhook requests are rejected.
- [ ] Verify payment confirmation creates the purchase, network identity, and
      InternetAccess record.
- [ ] Verify payment failure does not grant access.
- [ ] Record provider request IDs and webhook IDs for support investigation.

## Observability

- [ ] Retain Fastify structured logs centrally.
- [ ] Monitor API startup, shutdown, and uncaught errors.
- [ ] Add or verify a health endpoint for process readiness.
- [ ] Add or verify a readiness check for PostgreSQL and RouterOS connectivity.
- [ ] Alert on repeated RouterOS poll failures.
- [ ] Alert when the lifecycle poller is running but making no successful cycles.
- [ ] Record lifecycle failures with purchase ID, username, and operation without
      logging credentials or tokens.
- [ ] Track webhook success, failure, and duplicate-delivery outcomes.

## Backups

- [ ] Configure scheduled PostgreSQL backups.
- [ ] Verify backup retention and encryption.
- [ ] Perform a restore to a non-production database.
- [ ] Verify InternetAccess, Purchase, NetworkIdentity, and usage cursor data after
      restore.
- [ ] Document the restore owner and recovery time objective.
- [ ] Decide whether RouterOS configuration exports are backed up separately.
- [ ] Treat RouterOS in-memory logs as non-durable; they are not a substitute for
      database backups.

## Recovery and Failure Drills

- [ ] Restart the API while an active HotSpot session exists.
- [ ] Confirm the persisted usage cursor prevents duplicate usage after restart.
- [ ] Stop PostgreSQL and verify the API failure is visible and recoverable.
- [ ] Stop RouterOS connectivity and verify poll failures do not corrupt access
      state.
- [ ] Restore RouterOS connectivity and verify polling resumes.
- [ ] Evict or lose RouterOS logs and record the accepted limitation: completed
      sessions whose log entries are gone cannot be reconstructed.
- [ ] Verify an expired access cannot be reactivated after recovery.
- [ ] Verify a revoked or failed access is not automatically expired.

## Current Repository Evidence

- The API uses environment variables for database, payment, OTP, security, and
  RouterOS configuration.
- Fastify structured logging is enabled.
- Docker Compose provides a local PostgreSQL healthcheck only.
- RouterOS TLS is configurable but not enforced by the application.
- No health or readiness endpoint is currently registered.
- No production backup or restore automation is present in the repository.
- The Network Access Lifecycle acceptance test passes with deterministic adapters.
- CHR validation confirmed UTC timestamps and HotSpot login/logout log events.
