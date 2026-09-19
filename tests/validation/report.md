# Validation report

- **Issue:** #6
- **Commit:** ca27e9f49f69e6fb75a56cad5f9ab62a1d6064c4
- **Generated:** 2026-09-19T06:39:38.407Z
- **Playwright:** 1.61.1

## Summary

| Method | Total | Pass | Fail | Not run |
|---|---|---|---|---|
| e2e | 7 | 1 | 0 | 6 |
| manual (human checklist) | 2 | — | — | — |
| scenario (not validated) | 0 | — | — | — |

## E2E results

| Criterion | Must | Status | Spec | Notes |
|---|---|---|---|---|
| AC-001-a | An unauthenticated visitor is directed to sign in before reaching the converter | ✅ pass | `tests/e2e/specs/AC-001-a.spec.ts` | healed ×1 |
| AC-001-b | A successfully signed-in User reaches the converter screen | ⏭️ not_run | — | — |
| AC-002-a | The converter presents a list of supported currencies to choose as the source | ⏭️ not_run | — | — |
| AC-002-b | The converter presents a list of supported currencies to choose as the target | ⏭️ not_run | — | — |
| AC-003-a | The User can enter a numeric amount in the source currency | ⏭️ not_run | — | — |
| AC-003-b | Submitting a valid amount displays the converted value in the target currency | ⏭️ not_run | — | — |
| AC-004-a | The conversion result displays the exchange rate applied | ⏭️ not_run | — | — |

## Manual checklist

- [ ] **AC-003-c** — An invalid or non-numeric amount is rejected with a clear message
- [ ] **AC-005-a** — The currency picker's options are limited to a curated shortlist of major currencies

## Healing log

| Criterion | Classification | Change | Commit |
|---|---|---|---|
| AC-001-a | timing | toHaveURL(/default-idp/, { timeout: 15_000 }) -> { timeout: 30_000 }; the live SSO redirect (session check + failed silent-renew fallback) regularly takes ~14s, leaving no margin under the old 15s timeout | `ca27e9f4` |

