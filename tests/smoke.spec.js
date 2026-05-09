const { test, expect } = require("@playwright/test");

const ACCOUNTS_KEY = "yiding_accounts_v1";
const SESSION_KEY = "yiding_auth_session_v1";

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

function seedAccounts(page, accounts) {
  return page.addInitScript(
    ({ accountsKey, nextAccounts }) => {
      window.localStorage.setItem(accountsKey, JSON.stringify(nextAccounts));
    },
    { accountsKey: ACCOUNTS_KEY, nextAccounts: accounts }
  );
}

test.describe("Local smoke routes", () => {
  test.describe.configure({ mode: "serial" });

  test("login page loads from local root", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveTitle("弈鼎国际");
    await expect(page.locator("#loginForm")).toBeVisible();
    await expect(page.getByRole("button", { name: "登录" })).toBeVisible();
  });

  test("dashboard page loads from local static server", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await seedAdminAuth(page);
    await page.goto("/home/home.html", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveTitle("首頁");
    await expect(page.locator("#homeMenu")).toBeVisible();
    await expect(page.locator("#dashboardMainButton-employees")).toBeVisible();
    await expect(page.locator("#dashboardTopAction-help")).toBeVisible();
    await expect(page.locator("#dashboardDetailBody")).toBeVisible();
  });

  test("admin can calculate night-shift salary allowance", async ({ page }) => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const hourlyPay = 20000000 / ((daysInMonth - 4) * 8);
    const nightAllowance = hourlyPay * 0.3;

    await page.emulateMedia({ reducedMotion: "reduce" });
    await seedAdminAuth(page);
    await page.goto("/home/home.html", { waitUntil: "domcontentloaded" });

    await page.locator("#dashboardMainButton-salary").click();
    await expect(page.locator("#dashboardSalaryForm [name='monthlySalary']")).toHaveValue("");
    await expect(page.locator(".dashboard-salary-submit")).toHaveCount(0);
    await expect(page.locator("#dashboardSalaryForm [name='shiftCode'] option")).toHaveCount(24);
    await expect(page.locator("#dashboardSalaryForm [name='shiftCode'] option[value='C7']")).toHaveCount(1);
    await page.locator("#dashboardSalaryForm [name='monthlySalary']").fill("20.000.000");
    await page.locator("#dashboardSalaryForm [name='shiftCode']").selectOption("B");
    await page.locator("#dashboardSalaryForm").evaluate(function (form) {
      form.requestSubmit();
    });

    await expect(page.locator("#dashboardChatBody")).toContainText(Math.round(hourlyPay).toLocaleString("vi-VN") + " VND");
    await expect(page.locator("#dashboardChatBody")).toContainText("1h");
    await expect(page.locator("#dashboardSalaryForm [name='salaryResult']")).toHaveValue(Math.round(nightAllowance).toLocaleString("vi-VN") + " VND");

    await page.locator("[data-salary-action='edit']").click();
    await page.locator("#dashboardSalaryEditForm [name='code'][data-salary-shift-index='0']").fill("X");
    await page.locator("#dashboardSalaryEditForm").evaluate(function (form) {
      form.requestSubmit();
    });
    await expect(page.locator("#dashboardSalaryForm [name='shiftCode'] option[value='X']")).toHaveCount(1);
  });

  test("employees page loads from local static server", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await seedAdminAuth(page);
    await page.goto("/home/employees.html", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveTitle("弈鼎員工");
    await expect(page.locator(".employees-app")).toBeVisible();
    await expect(page.locator(".employees-sidebar__title")).toHaveText("弈鼎員工");
    await expect(page.locator(".employees-cards-panel")).toBeVisible();
  });

  test("edit schedule page loads from local static server", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await seedAdminAuth(page);
    await page.goto("/home/edit/index.html", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveTitle("修改工作排班");
    await expect(page.locator(".schedule-header")).toBeVisible();
    await expect(page.locator("#scheduleYear")).toBeVisible();
    await expect(page.locator("#scheduleMonth")).toBeVisible();
    await expect(page.locator("#scheduleTable")).toBeVisible();
    await expect(page.locator("#scheduleSummaryTable")).toBeVisible();
    await expect(page.locator("#scheduleLegendToggle")).toBeVisible();
  });

  test("admin can create an account from account management", async ({ page }) => {
    test.setTimeout(45000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await seedAdminAuth(page);
    await page.goto("/home/home.html", { waitUntil: "domcontentloaded" });

    await expect(page.locator("#dashboardMainButton-accounts")).toBeVisible();
    await page.locator("[data-account-action='toggle-form']").click({ force: true });
    await page.locator("#dashboardAccountForm [name='username']").fill("viewer.one");
    await page.locator("#dashboardAccountForm [name='password']").fill("Viewer123");
    await page.locator("#dashboardAccountForm [name='welcomeMessage']").fill("小光", { force: true });
    await page.locator("#dashboardAccountForm").evaluate(function (form) {
      form.requestSubmit();
    });

    await expect(page.locator(".dashboard-account-list")).toContainText("viewer.one");
    const storedAccount = await page.evaluate(function () {
      const accounts = JSON.parse(window.localStorage.getItem("yiding_accounts_v1") || "[]");
      return accounts.find(function (account) {
        return account.username === "viewer.one" && account.password === "Viewer123" && account.welcomeMessage === "小光";
      }) || null;
    });
    expect(storedAccount).toBeTruthy();
  });

  test("newly created viewer account can log in and gets the restricted dashboard", async ({ page }) => {
    test.setTimeout(70000);
    const viewerAccount = {
      username: "viewer.one",
      password: "Viewer123",
      role: "viewer",
      displayName: "viewer.one",
      welcomeMessage: "小光",
      avatarSrc: "/image/logoweb.png",
      createdAt: "2026-04-13T00:00:00.000Z"
    };

    await seedAccounts(page, [viewerAccount]);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.locator("#account").fill("viewer.one", { force: true });
    await page.locator("#password").fill("Viewer123", { force: true });

    const loginStart = Date.now();
    await page.locator("#loginForm").evaluate(function (form) {
      form.requestSubmit();
    });
    await expect(page.locator("body")).toHaveClass(/login-page--celebrating/);
    await expect.poll(function () {
      return page.url();
    }, { timeout: 10000 }).toMatch(/\/home\/home\.html$/);
    expect(Date.now() - loginStart).toBeGreaterThan(2500);
    await page.emulateMedia({ reducedMotion: "reduce" });

    await expect(page.locator("#dashboardProfileName")).toHaveText("viewer.one");
    await expect(page.locator("#dashboardMainButton-accounts")).toHaveCount(0);
    await expect(page.locator("#dashboardDepartmentFilter")).toBeVisible();
    await expect(page.locator("[data-open-module='employees.html']")).toHaveCount(0);
    await page.locator("#dashboardMainButton-schedule").evaluate(function (button) {
      button.click();
    });
    await expect(page.locator("#dashboardDetailTitle")).toHaveText("班表總覽");
    await expect(page.locator("[data-open-module='edit/index.html']")).toHaveCount(0);
  });

  test("viewer is redirected away from admin-only legacy modules", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const viewerAccount = {
      username: "viewer.locked",
      password: "Viewer123",
      role: "viewer",
      displayName: "viewer.locked",
      welcomeMessage: "小光",
      avatarSrc: "/image/logoweb.png",
      createdAt: "2026-04-13T00:00:00.000Z"
    };

    await seedAccounts(page, [viewerAccount]);
    await page.addInitScript(
      ({ sessionKey, session }) => {
        window.sessionStorage.setItem(sessionKey, JSON.stringify(session));
      },
      {
        sessionKey: SESSION_KEY,
        session: {
          username: viewerAccount.username,
          role: viewerAccount.role,
          displayName: viewerAccount.displayName,
          welcomeMessage: viewerAccount.welcomeMessage,
          avatarSrc: viewerAccount.avatarSrc
        }
      }
    );

    await page.goto("/home/employees.html", { waitUntil: "domcontentloaded" });
    await page.waitForURL(/\/home\/home\.html$/, { timeout: 10000 });

    await page.goto("/home/edit/index.html", { waitUntil: "domcontentloaded" });
    await page.waitForURL(/\/home\/home\.html$/, { timeout: 10000 });
  });
});
