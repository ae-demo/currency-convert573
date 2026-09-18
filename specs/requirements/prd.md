# currency-convert573 — PRD

## Problem Statement

People who need to convert money between currencies — travelers, online
shoppers, and anyone reading a price quoted in a foreign currency — today
resort to searching the web for "X to Y exchange rate" and doing the math by
hand, or trusting a stale rate remembered from days ago. There is no quick,
trustworthy, single-purpose tool that gives them a current conversion in a few
taps.

## Solution

A simple, signed-in web app that lets a user pick a source and target
currency, enter an amount, and immediately see the converted value using a
current exchange rate.

## Actors

- **User** — a signed-in individual who converts amounts between two
currencies. There is a single actor type; every signed-in user has the same
capabilities.

## User Stories

1. As a User, I want to sign in with single sign-on, so that I can securely
 access the converter.
2. As a User, I want to choose a source currency and a target currency from a
 list of supported currencies, so that I can specify which conversion I
 need.
3. As a User, I want to enter an amount in the source currency, so that I can
 see its equivalent value in the target currency.
4. As a User, I want to see the current exchange rate used for the
 conversion, so that I can trust the result.

## Product Decisions

- **Sign-in**: every user signs in via SSO through Thunder, the platform
identity provider — an organization default.
- **Exchange rate data**: the app depends on an external exchange-rate data
capability to source current rates. No specific provider is held by the
business today, so the capability is named here only; the concrete
provider is chosen at design time.
- **Notifications**: none. The product does not send emails, push
notifications, or alerts of any kind.
- **Supported currencies**: the app offers the full standard set of ISO 4217
currency codes that the chosen exchange-rate provider makes available
(e.g., USD, EUR, GBP, JPY, and the rest of the major and minor currencies
it publishes rates for), rather than a hand-picked shortlist. *assumed*

## Out of Scope

- Saving favorite currency pairs for quick reuse.
- Historical rate charts or trend views.
- Rate alerts or threshold notifications.
- Any admin role or per-team permissions — every signed-in user has identical
capabilities.
- Multi-currency conversion (converting one amount into several currencies
at once) — conversion is always one source to one target.

## Open Questions

None at this time.