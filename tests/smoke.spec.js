const { test, expect } = require("@playwright/test");

test.describe("Local smoke routes", () => {
  test("login page loads from local root", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle("弈鼎國際");
    await expect(page.locator("#loginForm")).toBeVisible();
    await expect(page.getByRole("button", { name: "登入" })).toBeVisible();
  });

  test("dashboard page loads from local static server", async ({ page }) => {
    await page.goto("/home/home.html");

    await expect(page).toHaveTitle("首頁");
    await expect(page.locator("#homeMenu")).toBeVisible();
    await expect(page.locator("#dashboardMainButton-employees")).toBeVisible();
    await expect(page.locator("#dashboardTopAction-help")).toBeVisible();
  });

  test("employees page loads from local static server", async ({ page }) => {
    await page.goto("/home/employees.html");

    await expect(page).toHaveTitle("弈鼎員工");
    await expect(page.locator(".employees-app")).toBeVisible();
    await expect(page.locator(".employees-sidebar__title")).toHaveText("弈鼎員工");
    await expect(page.locator(".employees-cards-panel")).toBeVisible();
  });

  test("edit schedule page loads from local static server", async ({ page }) => {
    await page.goto("/home/edit/index.html");

    await expect(page).toHaveTitle("修改工作排班");
    await expect(page.locator(".schedule-header")).toBeVisible();
    await expect(page.locator("#scheduleYear")).toBeVisible();
    await expect(page.locator("#scheduleMonth")).toBeVisible();
    await expect(page.locator("#scheduleTable")).toBeVisible();
    await expect(page.locator("#scheduleSummaryTable")).toBeVisible();
    await expect(page.locator("#scheduleLegendToggle")).toBeVisible();
  });
});
