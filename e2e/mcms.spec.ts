import { test, expect } from "@playwright/test";

test("admin login and dashboard visibility", async ({ page }) => {
  // 1. Navigate to the login page
  await page.goto("/login");

  // Verify login page title/branding
  await expect(page.locator("h1")).toContainText("Metal Cost Management System");

  // 2. Perform Admin Login
  await page.fill("#login-email", "admin@jsw-mcms.local");
  await page.fill("#login-password", "MCMS@2026");
  await page.click("#login-submit");

  // 3. Verify redirection to Dashboard
  await page.waitForURL("**/dashboard");
  
  // 4. Verify Dashboard displays correctly
  await expect(page.locator("body")).toContainText("Dashboard");
  await expect(page.locator("body")).toContainText("System Control Dashboard");
});
