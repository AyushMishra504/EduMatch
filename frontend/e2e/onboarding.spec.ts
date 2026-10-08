import { test, expect, type Page } from "@playwright/test";

/**
 * Minimal onboarding E2E. Auth = dev-only skip-login button (never renders
 * in production). Each test gets a fresh browser context (own session);
 * global-setup resets the dev profile to an empty draft once per run.
 */

async function devSignIn(page: Page) {
  await page.goto("/login");
  await page
    .getByRole("button", { name: "Skip login → Educator setup" })
    .click();
  // Landing depends on profile state: fresh → /start, otherwise /dashboard.
  await page.waitForURL(/\/(onboarding\/educator\/start|dashboard)/);
  await page.waitForLoadState("networkidle");
}

/**
 * Client-side comboboxes only work after React hydration, and the first
 * click can land before it finishes — retry the open until the listbox
 * actually appears.
 */
async function pickOption(page: Page, label: string) {
  const combo = page.getByRole("combobox");
  await expect(async () => {
    await combo.click();
    await expect(page.getByRole("listbox")).toBeVisible({ timeout: 1500 });
  }).toPass({ timeout: 20_000 });
  await combo.fill(label);
  await page.getByRole("option", { name: label }).click();
}

test("back navigation never empties the minimal form (sessionStorage draft)", async ({
  page,
}) => {
  await devSignIn(page);
  await expect(page).toHaveURL(/\/onboarding\/educator\/start/);

  await pickOption(page, "Computer Science");
  await page.getByRole("checkbox", { name: "Full-time" }).check({ force: true });

  // Leave without submitting, then come back — the form must be intact.
  await page.goto("/dashboard");
  await page.goBack();

  await expect(page).toHaveURL(/\/onboarding\/educator\/start/);
  await expect(page.getByRole("combobox")).toHaveValue("Computer Science");
  await expect(
    page.getByRole("checkbox", { name: "Full-time" }),
  ).toBeChecked();
});

test("skip enters the product with an honest empty draft", async ({ page }) => {
  await devSignIn(page);
  await expect(page).toHaveURL(/\/onboarding\/educator\/start/);

  await page.getByRole("button", { name: "Skip for now" }).click();
  await page.waitForURL("**/dashboard?welcome=1");
  await expect(
    page.getByRole("heading", { name: /You're all set/ }),
  ).toBeVisible();
  // Draft-aware checklist: must NOT claim the profile is published.
  await expect(page.getByText("Make your profile visible")).toBeVisible();

  await page.goto("/profile");
  await expect(page.getByText("Your profile is taking shape.")).toBeVisible();
  await expect(
    page.locator("section", { hasText: "Academic background" }),
  ).toContainText("Not added");
});

test("discipline + employment types land the user in the product", async ({
  page,
}) => {
  await devSignIn(page);
  await expect(page).toHaveURL(/\/onboarding\/educator\/start/);

  await pickOption(page, "Computer Science");
  await page.getByRole("checkbox", { name: "Full-time" }).check({ force: true });
  await page.getByRole("button", { name: /Enter EduMatch/ }).click();

  await page.waitForURL("**/dashboard?welcome=1");
  await page.goto("/profile");

  await expect(
    page.locator("section", { hasText: "Academic background" }),
  ).toContainText("Computer Science");
  await expect(
    page.locator("section", { hasText: "What you're looking for" }),
  ).toContainText("Full-time");
});

test("profile deep-links to locked steps fall back to the furthest unlocked step", async ({
  page,
}) => {
  await devSignIn(page);
  await page.goto("/profile");

  const deepLink = page.getByRole("link", {
    name: /\+ Choose desired faculty levels/,
  });
  await expect(deepLink).toBeVisible();
  await deepLink.click();

  // Guided progression: the freshly reset dev profile is an empty draft, so
  // step 5 is still locked and the wizard opens at the first step instead of
  // letting the user skip ahead.
  await expect(page).toHaveURL(/\/onboarding\/educator\/1/);
  await expect(
    page.getByRole("heading", { name: "About you" }),
  ).toBeVisible();
});

test("unknown steps 404", async ({ page }) => {
  await devSignIn(page);
  const response = await page.goto("/onboarding/educator/9");
  expect(response?.status()).toBe(404);
});

test("returning users skip /onboarding and land on the dashboard", async ({
  page,
}) => {
  await devSignIn(page);
  await page.goto("/onboarding");
  await expect(page).toHaveURL(/\/dashboard/);
});
