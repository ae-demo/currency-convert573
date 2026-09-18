// currency-api's mock, standing in for the sibling service — the second layer
// of mock/browser.ts's chain. mock/authz/gateway.ts (read from
// currency-api's openapi.yaml) already answered "may this caller call this
// operation at all"; everything here is the app's own data and validation,
// same as the real Ballerina service would apply. No scope check: a caller
// who lacked conversions:create was refused by the gateway layer and never
// reaches this file.
import { http, HttpResponse } from "msw";
import type { components } from "../src/generated/currency-api";

type Currency = components["schemas"]["Currency"];
type Conversion = components["schemas"]["Conversion"];
type ConversionRequest = components["schemas"]["ConversionRequest"];
type ApiError = components["schemas"]["Error"];

// The curated list currency-api serves — module-scope seed data, reset on
// every full page load (setupWorker resolves requests in the page's own JS
// context).
const CURRENCIES: Currency[] = [
  { code: "USD", name: "United States Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs" },
  { code: "AUD", name: "Australian Dollar", symbol: "$" },
];

// Fixed cross-rates against USD, purely for a believable mock conversion —
// the real service calls exchange-rate-service for a live rate.
const RATE_TO_USD: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  LKR: 302.1,
  AUD: 1.52,
};

function currencyKnown(code: string): boolean {
  return CURRENCIES.some((c) => c.code === code);
}

function errorBody(code: number, message: string): ApiError {
  return { code, message };
}

export const handlers = [
  http.get("/api/currencies", () =>
    HttpResponse.json({ count: CURRENCIES.length, next: null, previous: null, data: CURRENCIES }),
  ),

  http.post("/api/conversions", async ({ request }) => {
    const body = (await request.json()) as Partial<ConversionRequest>;
    const { sourceCurrency, targetCurrency, amount } = body;

    if (!sourceCurrency || !currencyKnown(sourceCurrency)) {
      return HttpResponse.json(errorBody(400, "Unknown source currency."), { status: 400 });
    }
    if (!targetCurrency || !currencyKnown(targetCurrency)) {
      return HttpResponse.json(errorBody(400, "Unknown target currency."), { status: 400 });
    }
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
      return HttpResponse.json(errorBody(400, "Amount must be a positive number."), {
        status: 400,
      });
    }

    const rate = RATE_TO_USD[targetCurrency] / RATE_TO_USD[sourceCurrency];
    const conversion: Conversion = {
      sourceCurrency,
      targetCurrency,
      amount,
      rate: Math.round(rate * 1_000_000) / 1_000_000,
      convertedAmount: Math.round(amount * rate * 100) / 100,
      convertedAt: new Date().toISOString(),
    };
    return HttpResponse.json(conversion);
  }),
];
