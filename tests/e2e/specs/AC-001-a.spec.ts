// spec: tests/validation/test-plan.md § AC-001-a
import { test, expect } from "@playwright/test";

test("AC-001-a: an unauthenticated visitor is directed to sign in before reaching the converter", async ({ page }) => {
  // 1. Navigate to / with no session/cookies (fresh browser context per test)
  await page.goto("/");
  // 2. The SPA's client-side session check redirects to the IdP sign-in page
  await expect(page).toHaveURL(/default-idp/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Username" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Password" })).toBeVisible();
});
