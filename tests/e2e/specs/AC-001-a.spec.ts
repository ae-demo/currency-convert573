// spec: tests/validation/test-plan.md § AC-001-a
import { test, expect } from "@playwright/test";

test("AC-001-a: an unauthenticated visitor is directed to sign in before reaching the converter", async ({ page }) => {
  // 1. Navigate to / with no session/cookies (fresh browser context per test)
  await page.goto("/");
  // 2. The SPA's client-side session check redirects to the IdP sign-in page.
  // Observed live: the check (incl. a failed silent-renew attempt) regularly
  // takes ~14s before the redirect fires, so 15s is too tight a margin.
  await expect(page).toHaveURL(/default-idp/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Username" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Password" })).toBeVisible();
});
