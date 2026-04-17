const { test, expect } = require("@playwright/test");

const LOCALE_KEY = "yiding_ui_locale_v2";
const LOCALE_SOURCE_KEY = "yiding_ui_locale_source_v3";
const ACCOUNTS_KEY = "yiding_accounts_v1";
const SESSION_KEY = "yiding_auth_session_v1";

function seedLocale(page, locale) {
  return page.addInitScript(
    ({ storageKey, sourceKey, nextLocale }) => {
      window.localStorage.setItem(storageKey, nextLocale);
      window.localStorage.setItem(sourceKey, "manual");
    },
    { storageKey: LOCALE_KEY, sourceKey: LOCALE_SOURCE_KEY, nextLocale: locale }
  );
}

function seedAdminAuth(page) {
  return page.addInitScript(
    ({ accountsKey, sessionKey }) => {
      const adminAccount = {
        username: "YiDing Admin",
        password: "YDI0006",
        role: "admin",
        displayName: "YiDing Admin",
        welcomeMessage: "燈哥",
        avatarSrc: "/image/logoweb.png",
        createdAt: "2026-04-13T00:00:00.000Z"
      };
      window.localStorage.setItem(accountsKey, JSON.stringify([adminAccount]));
      window.sessionStorage.setItem(sessionKey, JSON.stringify({
        username: adminAccount.username,
        role: adminAccount.role,
        displayName: adminAccount.displayName,
        welcomeMessage: adminAccount.welcomeMessage,
        avatarSrc: adminAccount.avatarSrc
      }));
    },
    { accountsKey: ACCOUNTS_KEY, sessionKey: SESSION_KEY }
  );
}

test.describe("Shared locale switching", () => {
  test.describe.configure({ mode: "serial" });

  test("login page respects Vietnamese locale from storage", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await seedLocale(page, "vi");
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.locator('label[for="account"]')).toHaveText("Tài khoản");
    await expect(page.locator('label[for="password"]')).toHaveText("Mật khẩu");
    await expect(page.getByRole("button", { name: "Đăng nhập" })).toBeVisible();
  });

  test("dashboard gear persists English locale into schedule page", async ({ page }) => {
    test.setTimeout(60000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await seedAdminAuth(page);
    await page.goto("/home/home.html", { waitUntil: "domcontentloaded" });

    await page.locator("#dashboardTopAction-settings").click();
    await page.locator("[data-locale-value='en']").click({ force: true });

    await expect(page.locator("#dashboardMainButton-schedule .dashboard-nav__label")).toHaveText("Schedule");
    await page.locator("#dashboardMainButton-schedule").click({ force: true });
    await expect(page.locator("#dashboardDetailTitle")).toHaveText("Schedule Overview");
    await expect(page.locator("#dashboardDetailBody select")).toHaveCount(1);
  });

  test("schedule page gear switches toolbar labels to Vietnamese", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await seedAdminAuth(page);
    await page.goto("/home/edit/index.html", { waitUntil: "domcontentloaded" });

    await page.locator("#scheduleLocaleMount [data-locale-toggle]").click({ force: true });
    await expect(page.locator("#scheduleLocaleMount [data-locale-value='vi']")).toBeVisible();
    await page.locator("#scheduleLocaleMount [data-locale-value='vi']").click({ force: true });

    await expect(page.locator("#scheduleHeaderTitle")).toHaveText("Ca làm");
    await expect(page.locator("#scheduleYearLabel")).toHaveText("Năm");
    await expect(page.locator("#scheduleMonthLabel")).toHaveText("Tháng");
    await page.locator("#scheduleLegendToggle").click();
    await expect(page.locator(".schedule-legend__title")).toHaveText("Mã ca");
  });

  test("employees page translates chrome but keeps employee data unchanged", async ({ page }) => {
    test.setTimeout(45000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await seedLocale(page, "zh-Hant");
    await seedAdminAuth(page);
    await page.goto("/home/employees.html", { waitUntil: "domcontentloaded" });

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
