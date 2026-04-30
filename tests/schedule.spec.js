const { test, expect } = require("@playwright/test");

const ACCOUNTS_KEY = "yiding_accounts_v1";
const SESSION_KEY = "yiding_auth_session_v1";
const EMPLOYEES_KEY = "yiding_employees_module_state_v3_airtable_import";
const SCHEDULE_KEY = "yiding_schedule_module_v3";

async function freezeTime(page, isoString) {
  await page.addInitScript(
    ({ iso }) => {
      const RealDate = Date;
      const fixedNow = new RealDate(iso).getTime();

      class MockDate extends RealDate {
        constructor(...args) {
          if (!args.length) {
            super(fixedNow);
            return;
          }
          super(...args);
        }

        static now() {
          return fixedNow;
        }
      }

      MockDate.parse = RealDate.parse.bind(RealDate);
      MockDate.UTC = RealDate.UTC.bind(RealDate);
      window.Date = MockDate;
    },
    { iso: isoString }
  );
}

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

function createScheduleRow(id, snapshot, shifts) {
  return {
    id: "schedule-row-" + id,
    sourceType: "manual",
    employeeId: "",
    employeeSnapshot: Object.assign({
      employeeId: "",
      ydiId: "",
      department: "",
      vieName: "",
      engName: "",
      position: ""
    }, snapshot || {}),
    shifts: shifts || {}
  };
}

function createScheduleState(rows, year = 2026, month = 7) {
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  return {
    selectedYear: year,
    selectedMonth: month,
    legendOpen: false,
    zoomLevel: 1,
    months: {
      [monthKey]: {
        rows: rows || []
      }
    }
  };
}

async function seedAdminAuth(page) {
  await page.addInitScript(
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

async function prepareSchedulePage(page, options = {}) {
  const employeesState = options.employeesState === undefined
    ? { employees: [createEmployee()] }
    : options.employeesState;
  const scheduleState = options.scheduleState === undefined ? null : options.scheduleState;

  await seedAdminAuth(page);
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

async function addRows(page, count) {
  await page.fill("#scheduleAddRowsCount", String(count));
  await page.locator("#scheduleAddRowsButton").click();
}

async function deleteRows(page, count) {
  await page.fill("#scheduleAddRowsCount", String(count));
  await page.locator("#scheduleDeleteRowsButton").click();
}

async function selectCell(page, rowIndex, day) {
  await page.locator(`[data-schedule-cell][data-row-index="${rowIndex}"][data-day="${day}"]`).click();
}

async function selectMetaCell(page, rowIndex, colIndex) {
  await page.locator(`[data-grid-cell][data-row-index="${rowIndex}"][data-col-index="${colIndex}"]`).click();
}

async function typeShiftCode(page, code) {
  await page.keyboard.type(code);
  await page.keyboard.press("Enter");
}

async function writeClipboard(page, text) {
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.evaluate(async (value) => {
    await navigator.clipboard.writeText(value);
  }, text);
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

async function scrollSheet(page, top, left = null) {
  await page.locator("#scheduleSheetScroll").evaluate((node, next) => {
    if (typeof next.left === "number") {
      node.scrollLeft = next.left;
    }
    node.scrollTop = next.top;
    node.dispatchEvent(new Event("scroll"));
  }, { top, left });
}

test.describe("Schedule module", () => {
  test("dashboard 班表 flow opens the local schedule page from the summary panel", async ({ page }) => {
    test.setTimeout(45000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await seedAdminAuth(page);
    await page.goto("/home/home.html", { waitUntil: "domcontentloaded" });
    await page.locator("#dashboardMainButton-schedule").click();
    await expect(page.locator("#dashboardDetailTitle")).toHaveText("班表總覽");
    await page.locator("[data-open-module='edit/index.html']").click();

    await expect(page).toHaveURL(/\/home\/edit\/index\.html$/);
    await expect(page.locator(".schedule-header")).toBeVisible();
    await expect(page.locator("#scheduleYear")).toBeVisible();
    await expect(page.locator("#scheduleMonth")).toBeVisible();
  });

  test("dashboard 班表 live panel resolves who is currently on shift", async ({ page }) => {
    test.setTimeout(45000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await freezeTime(page, "2026-07-10T16:30:00+07:00");
    await seedAdminAuth(page);
    await page.addInitScript(
      ({ employeesKey, scheduleKey }) => {
        const employeesState = {
          employees: [
            {
              id: "emp-a",
              basic: { engName: "JUDY", vieName: "NGUYEN JUDY", ydiId: "YDI0028" },
              work: { department: { preset: "Booking", other: "" }, position: "HOST", status: "在職" }
            },
            {
              id: "emp-b",
              basic: { engName: "LIN", vieName: "TONG LIN", ydiId: "YDI0039" },
              work: { department: { preset: "Booking", other: "" }, position: "HOST", status: "在職" }
            },
            {
              id: "emp-c",
              basic: { engName: "ALICE", vieName: "TRAN ALICE", ydiId: "YDI0025" },
              work: { department: { preset: "Service", other: "" }, position: "SERVICE", status: "在職" }
            }
          ]
        };

        const scheduleState = {
          selectedYear: 2026,
          selectedMonth: 7,
          legendOpen: false,
          zoomLevel: 1,
          months: {
            "2026-07": {
              rows: [
                {
                  id: "schedule-row-a",
                  sourceType: "employee",
                  employeeId: "emp-a",
                  employeeSnapshot: {
                    employeeId: "emp-a",
                    ydiId: "YDI0028",
                    department: "Booking",
                    vieName: "NGUYEN JUDY",
                    engName: "JUDY",
                    position: "HOST"
                  },
                  shifts: { "10": "B1" }
                },
                {
                  id: "schedule-row-b",
                  sourceType: "employee",
                  employeeId: "emp-b",
                  employeeSnapshot: {
                    employeeId: "emp-b",
                    ydiId: "YDI0039",
                    department: "Booking",
                    vieName: "TONG LIN",
                    engName: "LIN",
                    position: "HOST"
                  },
                  shifts: { "10": "A4" }
                },
                {
                  id: "schedule-row-c",
                  sourceType: "employee",
                  employeeId: "emp-c",
                  employeeSnapshot: {
                    employeeId: "emp-c",
                    ydiId: "YDI0025",
                    department: "Service",
                    vieName: "TRAN ALICE",
                    engName: "ALICE",
                    position: "SERVICE"
                  },
                  shifts: { "10": "OFF" }
                }
              ]
            }
          }
        };

        window.localStorage.setItem(employeesKey, JSON.stringify(employeesState));
        window.localStorage.setItem(scheduleKey, JSON.stringify(scheduleState));
      },
      { employeesKey: EMPLOYEES_KEY, scheduleKey: SCHEDULE_KEY }
    );

    await page.goto("/home/home.html", { waitUntil: "domcontentloaded" });
    await page.locator("#dashboardMainButton-schedule").click();

    await expect(page.locator("#dashboardChatTitle")).toHaveText("當前在崗");
    await expect(page.locator("#dashboardChatBody")).toContainText("Booking");
    await expect(page.locator("#dashboardChatBody")).toContainText("JUDY");
    await expect(page.locator("#dashboardChatBody")).toContainText("LIN");
    await expect(page.locator("#dashboardChatBody")).not.toContainText("ALICE");
  });

  test("fresh month starts with no rows by default", async ({ page }) => {
    await prepareSchedulePage(page, {
      employeesState: {
        employees: [
          createEmployee({ id: "emp-a", basic: { engName: "ACTIVE A", vieName: "VO A", ydiId: "YDI8001" } }),
          createEmployee({ id: "emp-b", basic: { engName: "ACTIVE B", vieName: "VO B", ydiId: "YDI8002" } })
        ]
      }
    });

    await expect(page.locator(".schedule-table__body-row")).toHaveCount(0);
  });

  test("changing year and month updates the day columns correctly", async ({ page }) => {
    await prepareSchedulePage(page);

    await page.selectOption("#scheduleYear", "2028");
    await page.selectOption("#scheduleMonth", "2");
    await expect(page.locator("#scheduleFrozenTableHead .schedule-table__day-head")).toHaveCount(29);

    await page.selectOption("#scheduleYear", "2027");
    await expect(page.locator("#scheduleFrozenTableHead .schedule-table__day-head")).toHaveCount(28);
  });

  test("switching between months keeps each month's edited schedule data", async ({ page }) => {
    await prepareSchedulePage(page);

    await page.selectOption("#scheduleYear", "2026");
    await page.selectOption("#scheduleMonth", "7");
    await addRows(page, 1);
    await selectCell(page, 0, 1);
    await typeShiftCode(page, "A");

    await page.selectOption("#scheduleMonth", "8");
    await addRows(page, 1);
    await selectCell(page, 0, 1);
    await typeShiftCode(page, "B");

    await page.selectOption("#scheduleMonth", "7");
    await expect(page.locator(".schedule-table__body-row")).toHaveCount(1);
    await expect(page.locator("[data-schedule-cell][data-row-index='0'][data-day='1']")).toContainText("A");

    await page.selectOption("#scheduleMonth", "8");
    await expect(page.locator(".schedule-table__body-row")).toHaveCount(1);
    await expect(page.locator("[data-schedule-cell][data-row-index='0'][data-day='1']")).toContainText("B");
  });

  test("add rows works from an empty month", async ({ page }) => {
    await prepareSchedulePage(page);

    await addRows(page, 3);
    await expect(page.locator(".schedule-table__body-row")).toHaveCount(3);
    await expect(page.locator("#scheduleFeedback")).toContainText("3");
  });

  test("delete rows removes the requested number from the end", async ({ page }) => {
    await prepareSchedulePage(page);

    await addRows(page, 4);
    await deleteRows(page, 2);

    await expect(page.locator(".schedule-table__body-row")).toHaveCount(2);
    await expect(page.locator("#scheduleFeedback")).toContainText("2");
  });

  test("drag handle stays hidden until hover and overlays the YDI column", async ({ page }) => {
    await prepareSchedulePage(page);
    await addRows(page, 1);

    const handle = page.locator("[data-row-handle]").first();
    const ydiCell = page.locator("[data-grid-cell][data-row-index='0'][data-col-index='0']").first();

    await expect.poll(async () => handle.evaluate((node) => window.getComputedStyle(node).opacity)).toBe("0");
    await ydiCell.hover();
    await expect.poll(async () => handle.evaluate((node) => window.getComputedStyle(node).opacity)).toBe("1");

    const handleBox = await handle.boundingBox();
    const ydiBox = await ydiCell.boundingBox();
    expect(handleBox).not.toBeNull();
    expect(ydiBox).not.toBeNull();
    expect(handleBox.x).toBeGreaterThanOrEqual(ydiBox.x);
    expect(handleBox.x + handleBox.width).toBeLessThanOrEqual(ydiBox.x + ydiBox.width);
  });

  test("drag handle reorders rows", async ({ page }) => {
    await prepareSchedulePage(page, {
      scheduleState: createScheduleState([
        createScheduleRow("a", { ydiId: "YDI8001", department: "Operation", vieName: "VO A", engName: "FIRST", position: "Staff" }),
        createScheduleRow("b", { ydiId: "YDI8002", department: "Finance", vieName: "VO B", engName: "SECOND", position: "Supervisor" })
      ])
    });

    await page.locator("[data-row-handle]").nth(0).dragTo(page.locator("[data-row-handle]").nth(1));

    await expect(page.locator(".schedule-table__body-row").first().locator(".schedule-table__sticky--eng")).toContainText("SECOND");
    await expect(page.locator(".schedule-table__body-row").nth(1).locator(".schedule-table__sticky--eng")).toContainText("FIRST");
  });

  test("typed shift code is visible in the code box before Enter", async ({ page }) => {
    await prepareSchedulePage(page);
    await addRows(page, 1);

    await selectCell(page, 0, 1);
    await page.keyboard.type("B1");

    await expect(page.locator("#scheduleSelectionInput")).toHaveValue("B1");
    await page.keyboard.press("Enter");
    await expect(page.locator("[data-schedule-cell][data-row-index='0'][data-day='1']")).toHaveText("B1");
  });

  test("invalid shift code stays visible and shows an error", async ({ page }) => {
    await prepareSchedulePage(page);
    await addRows(page, 1);

    await selectCell(page, 0, 1);
    await page.keyboard.type("ZZ");

    await expect(page.locator("#scheduleSelectionInput")).toHaveValue("ZZ");
    await page.keyboard.press("Enter");

    await expect(page.locator("#scheduleFeedback")).toContainText("Shift.xlsx");
    await expect(page.locator("#scheduleSelectionInput")).toHaveValue("ZZ");
    await expect(page.locator("[data-schedule-cell][data-row-index='0'][data-day='1']")).toContainText("·");
  });

  test("Delete clears the selected shift cell", async ({ page }) => {
    await prepareSchedulePage(page, {
      scheduleState: createScheduleState([
        createScheduleRow("a", {}, { "1": "A" })
      ])
    });

    await selectCell(page, 0, 1);
    await page.keyboard.press("Delete");

    await expect(page.locator("[data-schedule-cell][data-row-index='0'][data-day='1']")).toContainText("·");
  });

  test("Delete clears selected employee info cells too", async ({ page }) => {
    await prepareSchedulePage(page, {
      scheduleState: createScheduleState([
        createScheduleRow("a", {
          ydiId: "YDI9001",
          department: "Operation",
          vieName: "VO A",
          engName: "ALICE",
          position: "Staff"
        })
      ])
    });

    await selectMetaCell(page, 0, 3);
    await page.keyboard.press("Delete");

    await expect(page.locator("[data-grid-cell][data-row-index='0'][data-col-index='3']")).toHaveText("");
  });

  test("employee info columns stay transparent and selected cells are highlighted", async ({ page }) => {
    await prepareSchedulePage(page, {
      scheduleState: createScheduleState([
        createScheduleRow("visual", {
          ydiId: "YDI8111",
          department: "Operation",
          vieName: "LE THI A",
          engName: "ANNA",
          position: "Staff"
        }, { "1": "A" })
      ])
    });

    const leftColumnStyle = await page.locator("#scheduleSheetZoom > .schedule-sheet-stage > .schedule-sheet-main").evaluate((node) => {
      const before = getComputedStyle(node, "::before");
      const metaCell = document.querySelector(".schedule-table__meta.schedule-table__sticky");
      const beforeBackdropFilter = before.backdropFilter || before.webkitBackdropFilter || "";
      return {
        beforeBackground: before.backgroundColor,
        beforeBackdropFilter,
        metaBackground: metaCell ? getComputedStyle(metaCell).backgroundColor : ""
      };
    });

    expect(leftColumnStyle.beforeBackground).toBe("rgba(0, 0, 0, 0)");
    expect(leftColumnStyle.beforeBackdropFilter).toBe("none");
    expect(leftColumnStyle.metaBackground).toBe("rgba(0, 0, 0, 0)");

    await selectCell(page, 0, 1);

    const selectedStyle = await page.locator("[data-schedule-cell][data-row-index='0'][data-day='1']").evaluate((node) => {
      const style = getComputedStyle(node);
      return {
        isSelected: node.classList.contains("is-selected"),
        background: style.backgroundColor,
        boxShadow: style.boxShadow
      };
    });

    expect(selectedStyle.isSelected).toBe(true);
    expect(selectedStyle.background).not.toBe("rgba(0, 0, 0, 0)");
    expect(selectedStyle.boxShadow).not.toBe("none");
  });

  test("copy and paste shift codes across the schedule grid", async ({ page }) => {
    await prepareSchedulePage(page, {
      scheduleState: createScheduleState([
        createScheduleRow("a"),
        createScheduleRow("b")
      ])
    });

    await selectCell(page, 0, 1);
    await typeShiftCode(page, "A");
    await selectCell(page, 0, 2);
    await typeShiftCode(page, "B1");

    await dragSelect(page, { rowIndex: 0, day: 1 }, { rowIndex: 0, day: 2 });
    await page.keyboard.press("Control+C");

    await selectCell(page, 1, 1);
    await page.keyboard.press("Control+V");

    await expect(page.locator("[data-schedule-cell][data-row-index='1'][data-day='1']")).toHaveText("A");
    await expect(page.locator("[data-schedule-cell][data-row-index='1'][data-day='2']")).toHaveText("B1");
  });

  test("pasting invalid shift codes is rejected for the whole pasted block", async ({ page }) => {
    await prepareSchedulePage(page, {
      scheduleState: createScheduleState([
        createScheduleRow("a"),
        createScheduleRow("b")
      ])
    });

    await selectCell(page, 0, 1);
    await writeClipboard(page, "A\tZZ\nB\tC");
    await page.keyboard.press("Control+V");

    await expect(page.locator("#scheduleFeedback")).toContainText("ZZ");
    await expect(page.locator("[data-schedule-cell][data-row-index='0'][data-day='1']")).toContainText("·");
    await expect(page.locator("[data-schedule-cell][data-row-index='1'][data-day='2']")).toContainText("·");
  });

  test("bulk add rows and paste employee info into manual rows", async ({ page }) => {
    await prepareSchedulePage(page);

    await addRows(page, 3);
    await expect(page.locator(".schedule-table__body-row")).toHaveCount(3);

    await selectMetaCell(page, 1, 0);
    await writeClipboard(page, "YDI9901\tCustom Dept\tVO NEW\tCUSTOM\tSupervisor");
    await page.keyboard.press("Control+V");

    await expect(page.locator("[data-grid-cell][data-row-index='1'][data-col-index='0']")).toHaveText("YDI9901");
    await expect(page.locator("[data-grid-cell][data-row-index='1'][data-col-index='1']")).toHaveText("Custom Dept");
    await expect(page.locator("[data-grid-cell][data-row-index='1'][data-col-index='2']")).toHaveText("VO NEW");
    await expect(page.locator("[data-grid-cell][data-row-index='1'][data-col-index='3']")).toHaveText("CUSTOM");
    await expect(page.locator("[data-grid-cell][data-row-index='1'][data-col-index='4']")).toHaveText("Supervisor");
  });

  test("Ctrl+Z undoes the latest grid edit", async ({ page }) => {
    await prepareSchedulePage(page, {
      scheduleState: createScheduleState([
        createScheduleRow("a")
      ])
    });

    await selectCell(page, 0, 1);
    await typeShiftCode(page, "C");
    await expect(page.locator("[data-schedule-cell][data-row-index='0'][data-day='1']")).toHaveText("C");

    await page.keyboard.press("Control+Z");
    await expect(page.locator("[data-schedule-cell][data-row-index='0'][data-day='1']")).toContainText("·");
  });

  test("daily summary stays hidden before any valid code exists", async ({ page }) => {
    await prepareSchedulePage(page);
    await expect(page.locator("#dailySummarySection")).toBeHidden();
  });

  test("daily summary appears after at least one valid code is assigned", async ({ page }) => {
    await prepareSchedulePage(page, {
      scheduleState: createScheduleState([
        createScheduleRow("a")
      ])
    });

    await selectCell(page, 0, 1);
    await typeShiftCode(page, "A");

    await expect(page.locator("#dailySummarySection")).toBeVisible();
    await expect(page.locator("[data-daily-code='A'][data-daily-day='1']")).toHaveText("1");
  });

  test("daily summary code column stays fixed while horizontally scrolling", async ({ page }) => {
    await prepareSchedulePage(page, {
      scheduleState: createScheduleState([
        createScheduleRow("a", {}, { "1": "A", "2": "B1", "3": "C" }),
        createScheduleRow("b", {}, { "1": "A", "2": "A7", "3": "B" })
      ], 2026, 7)
    });

    await page.locator("#dailySummarySection").scrollIntoViewIfNeeded();
    await page.waitForTimeout(120);

    const before = await page.evaluate(() => {
      const dailyHead = document.querySelector("[data-daily-day-head='1']");
      const dailyCode = document.querySelector(".schedule-daily-table tbody .schedule-daily-table__sticky--position");
      if (!dailyHead || !dailyCode) {
        return null;
      }
      return {
        headY: Math.round(dailyHead.getBoundingClientRect().y),
        codeX: Math.round(dailyCode.getBoundingClientRect().x)
      };
    });

    await page.locator("#scheduleSheetScroll").evaluate((node) => {
      node.scrollLeft = 1200;
      node.dispatchEvent(new Event("scroll"));
    });

    const after = await page.evaluate(() => {
      const dailyCode = document.querySelector(".schedule-daily-table tbody .schedule-daily-table__sticky--position");
      return dailyCode ? Math.round(dailyCode.getBoundingClientRect().x) : null;
    });

    expect(before).not.toBeNull();
    expect(before.headY).toBeGreaterThan(0);
    expect(after).not.toBeNull();
    expect(Math.abs(after - before.codeX)).toBeLessThanOrEqual(1);
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

  test("opening the legend panel does not shift the fixed header title", async ({ page }) => {
    await prepareSchedulePage(page);

    const before = await page.locator("#scheduleHeaderTitle").boundingBox();
    expect(before).not.toBeNull();

    await page.locator("#scheduleLegendToggle").click();
    await expect(page.locator("#scheduleLegendToggle")).toHaveAttribute("aria-expanded", "true");

    const after = await page.locator("#scheduleHeaderTitle").boundingBox();
    expect(after).not.toBeNull();
    expect(Math.abs(after.x - before.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(after.width - before.width)).toBeLessThanOrEqual(1);
  });

  test("opening the legend panel does not shift the period action controls", async ({ page }) => {
    await prepareSchedulePage(page);

    const actionBar = page.locator(".schedule-period-actions");
    const before = await actionBar.boundingBox();
    expect(before).not.toBeNull();

    await page.locator("#scheduleLegendToggle").click();
    await expect(page.locator("#scheduleLegendToggle")).toHaveAttribute("aria-expanded", "true");

    const after = await actionBar.boundingBox();
    expect(after).not.toBeNull();
    expect(Math.abs(after.x - before.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(after.y - before.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(after.width - before.width)).toBeLessThanOrEqual(1);
  });

  test("legend panel opens as an overlay aligned to the schedule frame and period grid", async ({ page }) => {
    await prepareSchedulePage(page);

    await page.locator("#scheduleLegendToggle").click();
    await expect(page.locator("#scheduleLegendToggle")).toHaveAttribute("aria-expanded", "true");

    await expect.poll(async () => {
      return page.evaluate(() => {
        const periodGrid = document.querySelector(".schedule-period-grid");
        const legend = document.querySelector("#scheduleLegendPanel");
        if (!periodGrid || !legend) {
          return Number.POSITIVE_INFINITY;
        }
        const periodGridRect = periodGrid.getBoundingClientRect();
        const legendRect = legend.getBoundingClientRect();
        return Math.abs(legendRect.x - (periodGridRect.right + 12));
      });
    }, {
      timeout: 2000
    }).toBeLessThanOrEqual(2);

    await expect.poll(async () => {
      return page.evaluate(() => {
        const scheduleTable = document.querySelector("#scheduleTable");
        const legend = document.querySelector("#scheduleLegendPanel");
        if (!scheduleTable || !legend) {
          return Number.POSITIVE_INFINITY;
        }
        const scheduleTableRect = scheduleTable.getBoundingClientRect();
        const legendRect = legend.getBoundingClientRect();
        return Math.abs(legendRect.y - scheduleTableRect.y);
      });
    }, {
      timeout: 2000
    }).toBeLessThanOrEqual(5);
  });

  test("fixed top chrome stays vertically locked while the legend is open and the page scrolls", async ({ page }) => {
    await prepareSchedulePage(page);
    await addRows(page, 40);

    const actionBar = page.locator(".schedule-period-actions");
    const before = await actionBar.boundingBox();
    expect(before).not.toBeNull();

    await page.locator("#scheduleLegendToggle").click();
    await expect(page.locator("#scheduleLegendToggle")).toHaveAttribute("aria-expanded", "true");
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));

    const after = await actionBar.boundingBox();
    expect(after).not.toBeNull();
    expect(Math.abs(after.x - before.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(after.y - before.y)).toBeLessThanOrEqual(1);
  });

  test("opening the legend panel locks background page scrolling", async ({ page }) => {
    await prepareSchedulePage(page);
    await addRows(page, 40);

    await page.evaluate(() => window.scrollTo(0, 1200));
    await page.waitForTimeout(120);
    await page.locator("#scheduleLegendToggle").click();
    await expect(page.locator("#scheduleLegendToggle")).toHaveAttribute("aria-expanded", "true");

    const before = await page.evaluate(() => Math.round(window.scrollY));
    await page.mouse.move(220, 420);
    await page.mouse.wheel(0, 1600);
    await page.waitForTimeout(120);
    const after = await page.evaluate(() => Math.round(window.scrollY));

    expect(after).toBe(before);
  });

  test("wheel over the fixed top chrome does not scroll the page behind it", async ({ page }) => {
    await prepareSchedulePage(page);
    await addRows(page, 40);

    await page.evaluate(() => window.scrollTo(0, 1200));
    await page.waitForTimeout(120);

    const header = page.locator(".schedule-header");
    const before = await page.evaluate(() => Math.round(window.scrollY));
    const box = await header.boundingBox();
    expect(box).not.toBeNull();

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, 1200);
    await page.waitForTimeout(120);

    const after = await page.evaluate(() => Math.round(window.scrollY));
    expect(after).toBe(before);
  });

  test("wheel over the frozen schedule header does not scroll the page behind it", async ({ page }) => {
    await prepareSchedulePage(page);
    await addRows(page, 40);

    await page.evaluate(() => window.scrollTo(0, 1200));
    await page.waitForTimeout(120);

    const frozenHeaderCell = page.locator("#scheduleFrozenTableHead [data-day-head='1']").first();
    const before = await page.evaluate(() => Math.round(window.scrollY));
    const box = await frozenHeaderCell.boundingBox();
    expect(box).not.toBeNull();

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, 1200);
    await page.waitForTimeout(120);

    const after = await page.evaluate(() => Math.round(window.scrollY));
    expect(after).toBe(before);
  });

  test("legend panel keeps rows single-line without zoom controls", async ({ page }) => {
    await prepareSchedulePage(page);

    await page.locator("#scheduleLegendToggle").click();
    await expect(page.locator("#scheduleLegendBody td").last()).toHaveCSS("white-space", "nowrap");
    await expect(page.locator("#scheduleLegendZoomOut")).toHaveCount(0);
    await expect(page.locator("#scheduleLegendZoomIn")).toHaveCount(0);
    await expect(page.locator("#scheduleLegendContent")).toHaveCSS("overflow-y", "auto");

    const metrics = await page.evaluate(() => {
      const panel = document.querySelector("#scheduleLegendPanel");
      const content = document.querySelector("#scheduleLegendContent");
      const title = document.querySelector("#scheduleLegendPanel .schedule-legend__title");
      const headers = Array.from(document.querySelectorAll("#scheduleLegendTable .schedule-legend-table__label-row th")).map((node) => node.textContent.trim());
      const headerWidths = Array.from(document.querySelectorAll("#scheduleLegendTable .schedule-legend-table__label-row th")).map((node) => Math.round(node.getBoundingClientRect().width));
      if (!panel || !content || !title) {
        return null;
      }
      return {
        panelWidth: Math.round(panel.getBoundingClientRect().width),
        scrollable: content.scrollHeight > content.clientHeight,
        titleText: title.textContent.trim(),
        headers,
        headerWidths
      };
    });

    expect(metrics).not.toBeNull();
    expect(metrics.scrollable).toBeTruthy();
    expect(metrics.titleText).toBe("班碼參照");
    expect(metrics.headers).toEqual(["班碼", "上班", "下班", "計薪", "夜班", "備註"]);
    expect(metrics.headerWidths[5]).toBeGreaterThan(metrics.headerWidths[0] * 3);
  });

  test("wheel over the legend panel scrolls only the panel content", async ({ page }) => {
    await prepareSchedulePage(page);
    await addRows(page, 40);
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(120);

    await page.locator("#scheduleLegendToggle").click();
    await expect(page.locator("#scheduleLegendToggle")).toHaveAttribute("aria-expanded", "true");

    const content = page.locator("#scheduleLegendContent");
    const box = await content.boundingBox();
    expect(box).not.toBeNull();

    const before = await page.evaluate(() => {
      const panelContent = document.querySelector("#scheduleLegendContent");
      return {
        windowY: Math.round(window.scrollY),
        panelTop: Math.round(panelContent.scrollTop)
      };
    });

    await page.mouse.move(box.x + Math.min(box.width * 0.5, 80), box.y + Math.min(box.height * 0.5, 200));
    await page.mouse.wheel(0, 1200);
    await page.waitForTimeout(150);

    const after = await page.evaluate(() => {
      const panelContent = document.querySelector("#scheduleLegendContent");
      return {
        windowY: Math.round(window.scrollY),
        panelTop: Math.round(panelContent.scrollTop)
      };
    });

    expect(after.windowY).toBe(before.windowY);
    expect(after.panelTop).toBeGreaterThan(before.panelTop);
  });

  test("legend remark input persists after reload", async ({ page }) => {
    await prepareSchedulePage(page);

    await page.locator("#scheduleLegendToggle").click();
    await page.locator("[data-legend-remark='A']").fill("Ghi chú test");
    await page.reload();
    await page.locator("#scheduleLegendToggle").click();

    await expect(page.locator("[data-legend-remark='A']")).toHaveValue("Ghi chú test");
  });

  test("shift code dropdown uses compact dark styling", async ({ page }) => {
    await prepareSchedulePage(page);

    await page.locator("#scheduleSelectionInput").click();
    await expect(page.locator("#scheduleCodeDropdown")).toBeVisible();

    const dropdownStyles = await page.evaluate(() => {
      const dropdown = document.querySelector("#scheduleCodeDropdown");
      const option = dropdown ? dropdown.querySelector(".schedule-code-dropdown__option") : null;
      const title = document.querySelector(".schedule-header__title");
      if (!dropdown || !option || !title) {
        return null;
      }
      const dropdownRect = dropdown.getBoundingClientRect();
      const dropdownStyle = getComputedStyle(dropdown);
      const optionStyle = getComputedStyle(option);
      const titleStyle = getComputedStyle(title);
      return {
        width: Math.round(dropdownRect.width),
        background: dropdownStyle.backgroundColor,
        color: optionStyle.color,
        titleSize: Math.round(parseFloat(titleStyle.fontSize))
      };
    });

    expect(dropdownStyles).not.toBeNull();
    expect(dropdownStyles.width).toBeLessThanOrEqual(90);
    expect(dropdownStyles.background).not.toBe("rgb(255, 255, 255)");
    expect(dropdownStyles.color).toBe("rgb(244, 213, 31)");
    expect(dropdownStyles.titleSize).toBeGreaterThanOrEqual(60);
  });

  test("summary logic follows workbook hours and daily counts", async ({ page }) => {
    await prepareSchedulePage(page, {
      scheduleState: createScheduleState([
        createScheduleRow("summary", {
          ydiId: "YDI8333",
          department: "Operation",
          vieName: "NINA TRAN",
          engName: "NINA",
          position: "Staff"
        })
      ])
    });

    await selectCell(page, 0, 1);
    await typeShiftCode(page, "A");
    await selectCell(page, 0, 2);
    await typeShiftCode(page, "B7");
    await selectCell(page, 0, 3);
    await typeShiftCode(page, "C");

    await expect(page.locator("[data-summary-row-index='0'][data-summary-field='overtimeCount']")).toHaveText("0");
    await expect(page.locator("[data-summary-row-index='0'][data-summary-field='requiredHours']")).toHaveCount(0);
    await expect(page.locator("[data-summary-row-index='0'][data-summary-field='actualHours']")).toHaveCount(0);
    await expect(page.locator("[data-summary-row-index='0'][data-summary-field='nightHours']")).toHaveText("15");
    await expect(page.locator("[data-daily-code='A'][data-daily-day='1']")).toHaveText("1");
    await expect(page.locator("[data-daily-code='B7'][data-daily-day='2']")).toHaveText("1");
    await expect(page.locator("[data-daily-code='C'][data-daily-day='3']")).toHaveText("1");
  });

  test("column resize drag and double-click auto-fit update the grid width", async ({ page }) => {
    await prepareSchedulePage(page, {
      scheduleState: createScheduleState([
        createScheduleRow("wide", {
          ydiId: "YDI8999",
          department: "Operation",
          vieName: "VO LONG",
          engName: "THIS IS A VERY LONG ENGLISH NAME",
          position: "Senior Supervisor"
        })
      ])
    });

    const engHandle = page.locator("#scheduleFrozenTableHead .schedule-table__meta-head .schedule-column-resizer[data-resize-key='eng']").first();
    const before = await page.locator(".schedule-workspace").evaluate((node) =>
      getComputedStyle(node).getPropertyValue("--col-eng").trim()
    );

    const box = await engHandle.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 36, box.y + box.height / 2, { steps: 8 });
    await page.mouse.up();

    const afterDrag = await page.locator(".schedule-workspace").evaluate((node) =>
      getComputedStyle(node).getPropertyValue("--col-eng").trim()
    );
    expect(Number.parseInt(afterDrag, 10)).toBeGreaterThan(Number.parseInt(before, 10));

    await engHandle.dblclick();
    const afterAutoFit = await page.locator(".schedule-workspace").evaluate((node) =>
      getComputedStyle(node).getPropertyValue("--col-eng").trim()
    );
    expect(Number.parseInt(afterAutoFit, 10)).toBeGreaterThanOrEqual(Number.parseInt(afterDrag, 10));
  });

  test("resizing a day column keeps the daily summary day column in sync", async ({ page }) => {
    await prepareSchedulePage(page, {
      scheduleState: createScheduleState([
        createScheduleRow("a", {}, { "1": "A" })
      ])
    });

    const dayHandle = page.locator("#scheduleFrozenTableHead .schedule-table__day-head .schedule-column-resizer[data-resize-key='day']").first();
    const box = await dayHandle.boundingBox();
    expect(box).not.toBeNull();

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 18, box.y + box.height / 2, { steps: 6 });
    await page.mouse.up();

    const widths = await page.evaluate(() => {
      const mainDay = document.querySelector("#scheduleFrozenTableHead [data-day-head='1']");
      const dailyDay = document.querySelector("[data-daily-day-head='1']");
      return {
        mainWidth: Math.round(mainDay.getBoundingClientRect().width),
        dailyWidth: Math.round(dailyDay.getBoundingClientRect().width)
      };
    });

    expect(Math.abs(widths.mainWidth - widths.dailyWidth)).toBeLessThanOrEqual(1);
  });

  test("main header and right summary header freeze directly under the control bar while scrolling", async ({ page }) => {
    await prepareSchedulePage(page, {
      scheduleState: createScheduleState(Array.from({ length: 30 }, (_, index) => createScheduleRow("row-" + index)))
    });

    const measurePositions = () => page.evaluate(() => {
      const mainHead = document.querySelector("#scheduleFrozenTableHead [data-day-head='1']");
      const mainWeek = document.querySelector("#scheduleFrozenTableHead tr:nth-child(2) th");
      const summarySpacer = document.querySelector("#scheduleFrozenSummaryHead .schedule-summary-table__spacer th");
      const summaryHead = document.querySelector("#scheduleFrozenSummaryHead .schedule-summary-table__labels th");
      if (!mainHead || !mainWeek || !summarySpacer || !summaryHead) {
        return null;
      }
      const mainRect = mainHead.getBoundingClientRect();
      const mainWeekRect = mainWeek.getBoundingClientRect();
      const summarySpacerRect = summarySpacer.getBoundingClientRect();
      const summaryRect = summaryHead.getBoundingClientRect();
      return {
        mainY: Math.round(mainRect.y),
        mainWeekY: Math.round(mainWeekRect.y),
        summarySpacerY: Math.round(summarySpacerRect.y),
        summaryY: Math.round(summaryRect.y)
      };
    });

    await scrollSheet(page, 180);
    await page.waitForTimeout(100);
    const baseline = await measurePositions();

    await scrollSheet(page, 1200);
    await page.waitForTimeout(100);
    const positions = await measurePositions();

    expect(baseline).not.toBeNull();
    expect(positions).not.toBeNull();
    expect(Math.abs(positions.mainY - baseline.mainY)).toBeLessThanOrEqual(2);
    expect(Math.abs(positions.summarySpacerY - baseline.summarySpacerY)).toBeLessThanOrEqual(2);
    expect(Math.abs(positions.summaryY - positions.mainWeekY)).toBeLessThanOrEqual(2);
  });

  test("employee info columns stay fixed while horizontally scrolling", async ({ page }) => {
    await prepareSchedulePage(page, {
      scheduleState: createScheduleState(Array.from({ length: 8 }, (_, index) =>
        createScheduleRow("row-" + index, {
          ydiId: "YDI8" + index,
          department: "Operation",
          vieName: "VO " + index,
          engName: "EMP " + index,
          position: "Staff"
        }, { "1": "A", "2": "B" })
      ), 2026, 7)
    });

    const before = await page.evaluate(() => {
      const stickyCell = document.querySelector(".schedule-table__body-row [data-col-index='0']");
      return stickyCell ? Math.round(stickyCell.getBoundingClientRect().x) : null;
    });

    await page.locator("#scheduleSheetScroll").evaluate((node) => {
      node.scrollLeft = 1400;
      node.dispatchEvent(new Event("scroll"));
    });

    const after = await page.evaluate(() => {
      const stickyCell = document.querySelector(".schedule-table__body-row [data-col-index='0']");
      return stickyCell ? Math.round(stickyCell.getBoundingClientRect().x) : null;
    });

    expect(before).not.toBeNull();
    expect(after).not.toBeNull();
    expect(Math.abs(after - before)).toBeLessThanOrEqual(1);
  });

  test("summary rows and daily day columns line up with the main grid", async ({ page }) => {
    await prepareSchedulePage(page, {
      scheduleState: createScheduleState([
        createScheduleRow("a")
      ])
    });

    await selectCell(page, 0, 1);
    await typeShiftCode(page, "A");

    const positions = await page.evaluate(() => {
      const dayHead = document.querySelector("#scheduleFrozenTableHead [data-day-head='1']");
      const dailyHead = document.querySelector("[data-daily-day-head='1']");
      const summaryRow = document.querySelector("[data-summary-row-index='0']");
      const scheduleRow = document.querySelector(".schedule-table__body-row");
      const summaryHead = document.querySelector("#scheduleFrozenSummaryHead .schedule-summary-table__labels th");
      const mainHead = document.querySelector("#scheduleFrozenTableHead tr:nth-child(2) th");
      if (!dayHead || !dailyHead || !summaryRow || !scheduleRow || !summaryHead || !mainHead) {
        return null;
      }
      const dayRect = dayHead.getBoundingClientRect();
      const dailyRect = dailyHead.getBoundingClientRect();
      const scheduleRect = scheduleRow.getBoundingClientRect();
      const summaryRect = summaryRow.getBoundingClientRect();
      const mainHeadRect = mainHead.getBoundingClientRect();
      const summaryHeadRect = summaryHead.getBoundingClientRect();
      return {
        dayX: Math.round(dayRect.x),
        dailyX: Math.round(dailyRect.x),
        scheduleY: Math.round(scheduleRect.y),
        summaryY: Math.round(summaryRect.y),
        scheduleH: Math.round(scheduleRect.height),
        summaryH: Math.round(summaryRect.height),
        headY: Math.round(mainHeadRect.y),
        summaryHeadY: Math.round(summaryHeadRect.y)
      };
    });

    expect(positions).not.toBeNull();
    expect(Math.abs(positions.dayX - positions.dailyX)).toBeLessThanOrEqual(1);
    expect(Math.abs(positions.scheduleY - positions.summaryY)).toBeLessThanOrEqual(1);
    expect(Math.abs(positions.scheduleH - positions.summaryH)).toBeLessThanOrEqual(2);
    expect(Math.abs(positions.headY - positions.summaryHeadY)).toBeLessThanOrEqual(1);
  });

  test("main header stays frozen when scrolling into the daily summary block", async ({ page }) => {
    const codes = ["A", "A1", "A2", "A3", "A4", "A5", "A6", "A7", "B", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "C", "C1", "C2", "C3", "C4", "C5", "C6", "C7"];
    await prepareSchedulePage(page, {
      scheduleState: createScheduleState(codes.map((code, index) => createScheduleRow("daily-" + index, {
        ydiId: "YDI" + index,
        department: "Cage",
        vieName: "VO " + index,
        engName: "EMP " + index,
        position: "Staff"
      }, { "1": code })), 2025, 3)
    });

    const baseline = await page.evaluate(() => {
      const mainHead = document.querySelector("#scheduleFrozenTableHead [data-day-head='1']");
      const mainWeek = document.querySelector("#scheduleFrozenTableHead tr:nth-child(2) th");
      if (!mainHead || !mainWeek) {
        return null;
      }
      return {
        mainY: Math.round(mainHead.getBoundingClientRect().y),
        mainWeekY: Math.round(mainWeek.getBoundingClientRect().y)
      };
    });

    await page.locator("#scheduleSheetScroll").evaluate((node) => {
      node.scrollTop = node.scrollHeight;
      node.dispatchEvent(new Event("scroll"));
    });
    await page.waitForTimeout(150);

    const positions = await page.evaluate(() => {
      const mainHead = document.querySelector("#scheduleFrozenTableHead [data-day-head='1']");
      const mainWeek = document.querySelector("#scheduleFrozenTableHead tr:nth-child(2) th");
      const dailySection = document.getElementById("dailySummarySection");
      if (!mainHead || !mainWeek || !dailySection) {
        return null;
      }
      return {
        dailyTop: Math.round(dailySection.getBoundingClientRect().top),
        viewportHeight: window.innerHeight,
        mainY: Math.round(mainHead.getBoundingClientRect().y),
        mainWeekY: Math.round(mainWeek.getBoundingClientRect().y)
      };
    });

    expect(baseline).not.toBeNull();
    expect(positions).not.toBeNull();
    expect(positions.dailyTop).toBeLessThanOrEqual(positions.viewportHeight);
    expect(Math.abs(positions.mainY - baseline.mainY)).toBeLessThanOrEqual(2);
    expect(Math.abs(positions.mainWeekY - baseline.mainWeekY)).toBeLessThanOrEqual(2);
  });

  test("main header stays attached to the period bar after zooming and scrolling", async ({ page }) => {
    const codes = ["A", "A1", "A2", "A3", "A4", "A5", "A6", "A7", "B", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "C", "C1", "C2", "C3", "C4", "C5", "C6", "C7"];
    await prepareSchedulePage(page, {
      scheduleState: createScheduleState(codes.map((code, index) => createScheduleRow("zoom-" + index, {
        ydiId: "YDI" + index,
        department: "Operation",
        vieName: "VO " + index,
        engName: "EMP " + index,
        position: "Staff"
      }, { "1": code, "2": code })), 2025, 3)
    });

    await page.keyboard.press("Control+=");
    await page.keyboard.press("Control+=");
    const baseline = await page.evaluate(() => {
      const mainHead = document.querySelector("#scheduleFrozenTableHead [data-day-head='1']");
      const mainWeek = document.querySelector("#scheduleFrozenTableHead tr:nth-child(2) th");
      if (!mainHead || !mainWeek) {
        return null;
      }
      return {
        mainY: Math.round(mainHead.getBoundingClientRect().y),
        mainWeekY: Math.round(mainWeek.getBoundingClientRect().y)
      };
    });
    await page.locator("#scheduleSheetScroll").evaluate((node) => {
      node.scrollTop = node.scrollHeight;
      node.dispatchEvent(new Event("scroll"));
    });
    await page.waitForTimeout(150);

    const positions = await page.evaluate(() => {
      const mainHead = document.querySelector("#scheduleFrozenTableHead [data-day-head='1']");
      const mainWeek = document.querySelector("#scheduleFrozenTableHead tr:nth-child(2) th");
      if (!mainHead || !mainWeek) {
        return null;
      }
      return {
        zoom: document.getElementById("scheduleSheetZoom")?.style.zoom || "",
        mainY: Math.round(mainHead.getBoundingClientRect().y),
        mainWeekY: Math.round(mainWeek.getBoundingClientRect().y)
      };
    });

    expect(baseline).not.toBeNull();
    expect(positions).not.toBeNull();
    expect(positions.zoom).toBe("1.1");
    expect(Math.abs(positions.mainY - baseline.mainY)).toBeLessThanOrEqual(2);
    expect(Math.abs(positions.mainWeekY - baseline.mainWeekY)).toBeLessThanOrEqual(2);
  });

  test("daily summary block extends to the same right edge as the top sheet", async ({ page }) => {
    await prepareSchedulePage(page, {
      scheduleState: createScheduleState([
        createScheduleRow("a", {}, { "1": "A", "2": "B", "3": "C", "4": "A3" }),
        createScheduleRow("b", {}, { "1": "A7", "2": "B2", "3": "C1", "4": "B5" })
      ], 2025, 3)
    });

    const positions = await page.evaluate(() => {
      const summaryLast = document.querySelector("#scheduleSummaryTable tbody tr:first-child td:last-child");
      const dailyLastSpacer = document.querySelector("#dailySummarySpacerTable tbody tr:first-child td:last-child");
      const topDay = document.querySelector("#scheduleTable [data-day-head='31']") || document.querySelector("#scheduleTable [data-day-head='1']");
      const dailyDay = document.querySelector("[data-daily-day-head='31']") || document.querySelector("[data-daily-day-head='1']");
      if (!summaryLast || !dailyLastSpacer || !topDay || !dailyDay) {
        return null;
      }
      return {
        summaryRight: Math.round(summaryLast.getBoundingClientRect().right),
        dailyRight: Math.round(dailyLastSpacer.getBoundingClientRect().right),
        topDayX: Math.round(topDay.getBoundingClientRect().x),
        dailyDayX: Math.round(dailyDay.getBoundingClientRect().x)
      };
    });

    expect(positions).not.toBeNull();
    expect(Math.abs(positions.summaryRight - positions.dailyRight)).toBeLessThanOrEqual(1);
    expect(Math.abs(positions.topDayX - positions.dailyDayX)).toBeLessThanOrEqual(1);
  });

  test("Ctrl plus and reset update sheet zoom without touching the header", async ({ page }) => {
    await prepareSchedulePage(page);

    await page.keyboard.press("Control+=");
    await expect.poll(async () => page.locator("#scheduleSheetZoom").evaluate((node) => node.style.zoom)).toBe("1.05");

    await page.keyboard.press("Control+0");
    await expect.poll(async () => page.locator("#scheduleSheetZoom").evaluate((node) => node.style.zoom)).toBe("1");
  });

  test("horizontal scrollbar hides when the zoomed sheet fits the viewport", async ({ page }) => {
    await prepareSchedulePage(page, {
      scheduleState: createScheduleState([], 2026, 2)
    });

    for (let index = 0; index < 7; index += 1) {
      await page.keyboard.press("Control+-");
    }

    await expect(page.locator("#scheduleSheetScroll")).toHaveClass(/schedule-sheet-scroll--fit/);
  });

  test("schedule page can scroll vertically with mouse wheel over the sheet", async ({ page }) => {
    await prepareSchedulePage(page, {
      scheduleState: createScheduleState(Array.from({ length: 40 }, (_, index) => createScheduleRow("row-" + index)))
    });

    await page.locator("#scheduleSheetScroll").hover();
    await page.mouse.wheel(0, 1200);
    await expect.poll(async () =>
      page.locator("#scheduleSheetScroll").evaluate((node) => node.scrollTop)
    ).toBeGreaterThan(0);
  });
});
