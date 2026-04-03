const { test, expect } = require("@playwright/test");

const EMPLOYEES_KEY = "yiding_employees_module_state_v3_airtable_import";
const SCHEDULE_KEY = "yiding_schedule_module_v1";

function createEmployee(overrides) {
  return Object.assign({
    id: "employee-default",
    basic: {
      engName: "ALICE",
      vieName: "NGUYEN THI A",
      ydiId: "YDI9001"
    },
    work: {
      department: { preset: "Operation", other: "" },
      position: "Staff",
      status: "在職"
    }
  }, overrides || {});
}

async function prepareSchedulePage(page, options = {}) {
  const employeesState = options.employeesState === undefined
    ? { employees: [createEmployee()] }
    : options.employeesState;
  const scheduleState = options.scheduleState === undefined ? null : options.scheduleState;

  await page.addInitScript(
    ({ employeesKey, scheduleKey, nextEmployeesState, nextScheduleState }) => {
      window.localStorage.removeItem(employeesKey);
      window.localStorage.removeItem(scheduleKey);
      if (nextEmployeesState) {
        window.localStorage.setItem(employeesKey, JSON.stringify(nextEmployeesState));
      }
      if (nextScheduleState) {
        window.localStorage.setItem(scheduleKey, JSON.stringify(nextScheduleState));
      }
    },
    {
      employeesKey: EMPLOYEES_KEY,
      scheduleKey: SCHEDULE_KEY,
      nextEmployeesState: employeesState,
      nextScheduleState: scheduleState
    }
  );

  await page.goto("/home/edit/index.html");
}

async function selectCell(page, rowIndex, day) {
  await page.locator(`[data-schedule-cell][data-row-index="${rowIndex}"][data-day="${day}"]`).click();
}

async function typeShiftCode(page, code) {
  await page.keyboard.type(code);
  await page.keyboard.press("Enter");
}

async function dragSelect(page, start, end) {
  const startBox = await page.locator(`[data-schedule-cell][data-row-index="${start.rowIndex}"][data-day="${start.day}"]`).boundingBox();
  const endBox = await page.locator(`[data-schedule-cell][data-row-index="${end.rowIndex}"][data-day="${end.day}"]`).boundingBox();

  if (!startBox || !endBox) {
    throw new Error("Unable to resolve schedule cell bounds.");
  }

  await page.mouse.move(startBox.x + startBox.width / 2, startBox.y + startBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(endBox.x + endBox.width / 2, endBox.y + endBox.height / 2, { steps: 12 });
  await page.mouse.up();
}

test.describe("Schedule module from Shift.xlsx", () => {
  test("dashboard 班表 button routes to the local schedule page", async ({ page }) => {
    await page.goto("/home/home.html");
    await page.locator("#dashboardMainButton-schedule").click();

    await expect(page).toHaveURL(/\/home\/edit\/index\.html$/);
    await expect(page.locator("#scheduleTable")).toBeVisible();
  });

  test("changing year and month updates the day columns correctly", async ({ page }) => {
    await prepareSchedulePage(page);

    await page.selectOption("#scheduleYear", "2028");
    await page.selectOption("#scheduleMonth", "2");
    await expect(page.locator(".schedule-table__day-head")).toHaveCount(29);

    await page.selectOption("#scheduleYear", "2027");
    await expect(page.locator(".schedule-table__day-head")).toHaveCount(28);
  });

  test("all active employees auto-populate and retired staff stay excluded", async ({ page }) => {
    await prepareSchedulePage(page, {
      employeesState: {
        employees: [
          createEmployee({ id: "emp-a", basic: { engName: "ACTIVE A", vieName: "VO A", ydiId: "YDI8001" } }),
          createEmployee({ id: "emp-b", basic: { engName: "ACTIVE B", vieName: "VO B", ydiId: "YDI8002" } }),
          createEmployee({
            id: "emp-retired",
            basic: { engName: "RETIRED", vieName: "VO C", ydiId: "YDI8003" },
            work: { department: { preset: "Hr", other: "" }, position: "Supervisor", status: "離職" }
          })
        ]
      }
    });

    await expect(page.locator(".schedule-table__body-row")).toHaveCount(2);
    await expect(page.locator(".schedule-table__body-row").first().locator(".schedule-table__sticky--eng")).toContainText("ACTIVE A");
    await expect(page.locator("#scheduleTable")).not.toContainText("RETIRED");
  });

  test("drag handle reorders employee rows", async ({ page }) => {
    await prepareSchedulePage(page, {
      employeesState: {
        employees: [
          createEmployee({ id: "emp-a", basic: { engName: "FIRST", vieName: "VO A", ydiId: "YDI8001" } }),
          createEmployee({ id: "emp-b", basic: { engName: "SECOND", vieName: "VO B", ydiId: "YDI8002" } })
        ]
      }
    });

    await page.locator("[data-row-handle]").nth(0).dragTo(page.locator("[data-row-handle]").nth(1));

    await expect(page.locator(".schedule-table__body-row").first().locator(".schedule-table__sticky--eng")).toContainText("SECOND");
    await expect(page.locator(".schedule-table__body-row").nth(1).locator(".schedule-table__sticky--eng")).toContainText("FIRST");
  });

  test("valid shift code input fills the selected cell", async ({ page }) => {
    await prepareSchedulePage(page);

    await selectCell(page, 0, 1);
    await typeShiftCode(page, "A");

    await expect(page.locator("[data-schedule-cell][data-row-index='0'][data-day='1']")).toHaveText("A");
  });

  test("invalid shift code is rejected and not saved", async ({ page }) => {
    await prepareSchedulePage(page);

    await selectCell(page, 0, 1);
    await typeShiftCode(page, "ZZ");

    await expect(page.locator("#scheduleFeedback")).toContainText("Shift.xlsx");
    await expect(page.locator("[data-schedule-cell][data-row-index='0'][data-day='1']")).toContainText("·");
  });

  test("multi-cell selection plus keyboard fill writes one code to multiple cells", async ({ page }) => {
    await prepareSchedulePage(page, {
      employeesState: {
        employees: [
          createEmployee({ id: "emp-a", basic: { engName: "FIRST", vieName: "VO A", ydiId: "YDI8001" } }),
          createEmployee({ id: "emp-b", basic: { engName: "SECOND", vieName: "VO B", ydiId: "YDI8002" } })
        ]
      }
    });

    await dragSelect(page, { rowIndex: 0, day: 1 }, { rowIndex: 1, day: 2 });
    await typeShiftCode(page, "B2");

    await expect(page.locator("[data-schedule-cell][data-row-index='0'][data-day='1']")).toHaveText("B2");
    await expect(page.locator("[data-schedule-cell][data-row-index='0'][data-day='2']")).toHaveText("B2");
    await expect(page.locator("[data-schedule-cell][data-row-index='1'][data-day='1']")).toHaveText("B2");
    await expect(page.locator("[data-schedule-cell][data-row-index='1'][data-day='2']")).toHaveText("B2");
  });

  test("Ctrl+Z undoes the latest grid edit", async ({ page }) => {
    await prepareSchedulePage(page);

    await selectCell(page, 0, 1);
    await typeShiftCode(page, "C");
    await expect(page.locator("[data-schedule-cell][data-row-index='0'][data-day='1']")).toHaveText("C");

    await page.keyboard.press("Control+Z");
    await expect(page.locator("[data-schedule-cell][data-row-index='0'][data-day='1']")).toContainText("·");
  });

  test("Delete clears the selected range", async ({ page }) => {
    await prepareSchedulePage(page);

    await selectCell(page, 0, 1);
    await typeShiftCode(page, "A");
    await expect(page.locator("[data-schedule-cell][data-row-index='0'][data-day='1']")).toHaveText("A");

    await selectCell(page, 0, 1);
    await page.keyboard.press("Delete");

    await expect(page.locator("[data-schedule-cell][data-row-index='0'][data-day='1']")).toContainText("·");
  });

  test("daily summary stays hidden before any valid code exists", async ({ page }) => {
    await prepareSchedulePage(page);
    await expect(page.locator("#dailySummarySection")).toBeHidden();
  });

  test("daily summary appears after at least one valid code is assigned", async ({ page }) => {
    await prepareSchedulePage(page);

    await selectCell(page, 0, 1);
    await typeShiftCode(page, "A");

    await expect(page.locator("#dailySummarySection")).toBeVisible();
    await expect(page.locator("[data-daily-code='A'][data-daily-day='1']")).toHaveText("1");
  });

  test("right legend panel opens and closes from the header button", async ({ page }) => {
    await prepareSchedulePage(page);

    await expect(page.locator("#scheduleLegendToggle")).toHaveAttribute("aria-expanded", "false");
    await page.locator("#scheduleLegendToggle").click();
    await expect(page.locator("#scheduleLegendToggle")).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#scheduleLegendTable")).toContainText("班碼");

    await page.locator("#scheduleLegendToggle").click();
    await expect(page.locator("#scheduleLegendToggle")).toHaveAttribute("aria-expanded", "false");
  });

  test("summary logic follows workbook hours and daily counts", async ({ page }) => {
    await prepareSchedulePage(page, {
      employeesState: {
        employees: [
          createEmployee({
            id: "emp-summary",
            basic: { engName: "NINA", vieName: "NINA TRAN", ydiId: "YDI8333" },
            work: { department: { preset: "Operation", other: "" }, position: "Staff", status: "在職" }
          })
        ]
      }
    });

    await selectCell(page, 0, 1);
    await typeShiftCode(page, "A");
    await selectCell(page, 0, 2);
    await typeShiftCode(page, "B7");
    await selectCell(page, 0, 3);
    await typeShiftCode(page, "C");

    await expect(page.locator("[data-summary-row-index='0'][data-summary-field='overtimeCount']")).toHaveText("0");
    await expect(page.locator("[data-summary-row-index='0'][data-summary-field='requiredHours']")).toHaveText("216");
    await expect(page.locator("[data-summary-row-index='0'][data-summary-field='actualHours']")).toHaveText("24");
    await expect(page.locator("[data-summary-row-index='0'][data-summary-field='nightHours']")).toHaveText("15");
    await expect(page.locator("[data-daily-code='A'][data-daily-day='1']")).toHaveText("1");
    await expect(page.locator("[data-daily-code='B7'][data-daily-day='2']")).toHaveText("1");
    await expect(page.locator("[data-daily-code='C'][data-daily-day='3']")).toHaveText("1");
  });

  test("Ctrl plus and reset update sheet zoom without touching the header", async ({ page }) => {
    await prepareSchedulePage(page);

    await page.keyboard.press("Control+=");
    await expect.poll(async () => page.locator("#scheduleSheetZoom").evaluate((node) => node.style.zoom)).toBe("1.05");

    await page.keyboard.press("Control+0");
    await expect.poll(async () => page.locator("#scheduleSheetZoom").evaluate((node) => node.style.zoom)).toBe("1");
  });

  test("schedule page can scroll vertically with mouse wheel over the sheet", async ({ page }) => {
    const employees = Array.from({ length: 26 }, (_, index) => createEmployee({
      id: "emp-" + index,
      basic: {
        engName: "EMP " + index,
        vieName: "VO " + index,
        ydiId: "YDI" + String(9000 + index)
      }
    }));

    await prepareSchedulePage(page, {
      employeesState: { employees }
    });

    await page.locator("#scheduleSheetScroll").hover();
    await page.mouse.wheel(0, 1200);
    await expect.poll(async () => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  });
});
