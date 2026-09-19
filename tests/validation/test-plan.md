# Validation test plan — issue #6

## Re-validation (2026-09-19)

Re-ran against current `main` (post `currency-api` exchange-rate fix, PR #8).
Re-checked the roles gate (issue #2, closed): still shows `test-user` refused
and no `<!-- aep:test-users -->` login table — `specs/design/security.json`
still declares only that one username. The blocking note below still applies
unchanged; scope of authored vs. not_run criteria is the same as the prior
cycle.

Healed AC-001-a (see `tests/e2e/heal-log.json`): live-timed the SSO redirect
at ~14s (session check + a failed silent-renew attempt before the client
falls back to a full redirect); the previous 15s assertion timeout left no
margin and failed once under load. Raised to 30s — no assertion changed.

## Blocking note: no usable test user

The milestone's roles gate ticket (issue #2) shows the single declared test
user (`test-user`, role `User`, from `specs/design/security.json`) was
**refused** by the platform: the username already belongs to an account the
platform does not own, so no account was created and no login table (the
`<!-- aep:test-users -->` marker) was published on the gate ticket.

Confirmed live: the deployed webapp
(`currency-webapp`) redirects an unauthenticated visitor to the Thunder Auth
sign-in page (`https://default-idp.94.72.97.95.sslip.io/gate/signin`) and the
`currency-api` `/currencies` endpoint returns `401 Unauthorized` with no
token. Every criterion beyond "reach the sign-in page" requires a successful
sign-in, which requires a login this run does not have.

Per the aep-validation workflow, a missing login is landed as `not_run`
rather than improvised — no spec is authored against a guessed or
default credential. This affects **AC-001-b, AC-002-a, AC-002-b, AC-003-a,
AC-003-b, AC-004-a** (6 of 7 e2e criteria). Only **AC-001-a** does not require
a signed-in session and is authored below.

## AC-001-a — An unauthenticated visitor is directed to sign in before reaching the converter

- Target: currency-webapp (primary)
- Steps:
  1. Navigate to `/` with no session/cookies.
  2. Wait for the client-side session check to redirect away from the app.
- Assert: the browser ends up on the Thunder Auth sign-in page (URL contains
  the IdP host `default-idp`, and a "Sign In" heading with Username/Password
  fields is visible) rather than the converter screen.
- Source of truth: playwright-cli exploration against the live app (see
  session log 2026-09-18) — the SPA briefly shows "Checking your session…"
  then performs a client-side redirect to `<idp>/gate/signin`.

## AC-001-b, AC-002-a, AC-002-b, AC-003-a, AC-003-b, AC-004-a — not_run (blocked)

No spec authored. Each requires a signed-in `User` session to reach the
converter screen; no test-user credentials are available (see blocking note
above). These report as `not_run` in `tests/validation/report.md` because no
spec file exists for them — this is intentional per the workflow's guidance
on a missing login, not an authoring gap.

## Manual / scenario criteria

- AC-003-c (manual), AC-005-a (manual) — rendered as an unchecked human
  checklist by the report generator; no automation in this run.
- No `scenario` criteria in this criteria file.
