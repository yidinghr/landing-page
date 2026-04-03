const { test, expect } = require("@playwright/test");

const LOCALE_KEY = "yiding_ui_locale_v1";

function seedLocale(page, locale) {
  return page.addInitScript(
    ({ storageKey, nextLocale }) => {
      window.localStorage.setItem(storageKey, nextLocale);
    },
    { storageKey: LOCALE_KEY, nextLocale: locale }
  );
}

test.describe("Shared locale switching", () => {
  test("login gear switches static labels to Vietnamese", async ({ page }) => {
    await page.goto("/");

    await page.locator("#loginPageTools [data-locale-toggle]").click();
    await page.locator("#loginPageTools [data-locale-value='vi']").click();

    await expect(page.locator('label[for="account"]')).toHaveText("Tài khoản");
    await expect(page.locator('label[for="password"]')).toHaveText("Mật khẩu");
    await expect(page.getByRole("button", { name: "Đăng nhập" })).toBeVisible();
  });

  test("dashboard gear persists English locale into schedule page", async ({ page }) => {
    await page.goto("/home/home.html");

    await page.locator("#dashboardTopAction-settings").click();
    await page.locator("[data-locale-value='en']").click();

    await expect(page.locator("#dashboardMainButton-schedule")).toHaveText("Schedule");
    await page.locator("#dashboardMainButton-schedule").click();

    await expect(page).toHaveURL(/\/home\/edit\/index\.html$/);
    await expect(page).toHaveTitle("Edit Work Schedule");
    await expect(page.locator("#scheduleHeaderTitle")).toHaveText("Schedule");
    await expect(page.locator("#scheduleYearLabel")).toHaveText("Year");
    await expect(page.locator("#scheduleMonthLabel")).toHaveText("Month");
  });

  test("schedule page gear switches toolbar labels to Vietnamese", async ({ page }) => {
    await page.goto("/home/edit/index.html");

    await page.locator("#scheduleLocaleMount [data-locale-toggle]").click();
    await page.locator("#scheduleLocaleMount [data-locale-value='vi']").click();

    await expect(page.locator("#scheduleHeaderTitle")).toHaveText("Ca làm");
    await expect(page.locator("#scheduleYearLabel")).toHaveText("Năm");
    await expect(page.locator("#scheduleMonthLabel")).toHaveText("Tháng");
    await page.locator("#scheduleLegendToggle").click();
    await expect(page.locator(".schedule-legend__title")).toHaveText("Mã ca");
  });

  test("employees page translates chrome but keeps employee data unchanged", async ({ page }) => {
    await seedLocale(page, "zh-Hant");
    await page.goto("/home/employees.html");

    const initialCardTitle = await page.locator(".employees-card__title").first().textContent();

    await page.locator("#employeesPageTools [data-locale-toggle]").click();
    await page.locator("#employeesPageTools [data-locale-value='en']").click();

    await expect(page.locator(".employees-sidebar__title")).toHaveText("YiDing Employees");
    await expect(page.locator(".employees-sidebar__section-title")).toHaveText("Departments");
    await expect(page.locator(".employees-card__title").first()).toHaveText(initialCardTitle || "");

    await page.locator(".employees-card").first().click();
    await expect(page.locator(".employee-form__section-title").first()).toHaveText("Basic Information");
  });
});
