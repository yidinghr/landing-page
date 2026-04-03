(function () {
  const i18n = window.YiDingI18n || null;
  const employeesDataApi = window.YiDingEmployeesData || null;
  const STORAGE_KEY = "yiding_schedule_module_v1";
  const EMPLOYEES_KEY = employeesDataApi && employeesDataApi.STORAGE_KEY
    ? employeesDataApi.STORAGE_KEY
    : "yiding_employees_module_state_v3_airtable_import";
  const WORKBOOK_DEFAULT_YEAR = 2026;
  const WORKBOOK_DEFAULT_MONTH = 7;
  const ZOOM_MIN = 0.65;
  const ZOOM_MAX = 1.35;
  const ZOOM_STEP = 0.05;
  const WEEKDAY_LABELS = {
    "zh-Hant": ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
    vi: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
    en: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
  };
  const SUMMARY_FIELDS = [
    { id: "overtimeCount", labels: { "zh-Hant": "加班", vi: "Tăng ca", en: "Overtime" } },
    { id: "requiredHours", labels: { "zh-Hant": "应上时数", vi: "Giờ phải làm", en: "Required Hours" } },
    { id: "actualHours", labels: { "zh-Hant": "实际时数", vi: "Giờ thực tế", en: "Actual Hours" } },
    { id: "nightHours", labels: { "zh-Hant": "夜班补贴(时数)", vi: "Giờ ca đêm", en: "Night Hours" } }
  ];
  const META_HEADERS = {
    "zh-Hant": ["工號", "部門", "越名字", "英名字", "职位"],
    vi: ["Mã YDI", "Bộ phận", "Tên Việt", "Tên Anh", "Chức vụ"],
    en: ["YDI ID", "Department", "Vietnamese Name", "English Name", "Position"]
  };
  const SHIFT_CODE_DEFINITIONS = Object.freeze([
    { code: "A", checkIn: "7", checkOut: "15", hoursPay: 8, nightHours: 0, remark: "早班 (07:00-15:00)" },
    { code: "A1", checkIn: "8", checkOut: "16", hoursPay: 8, nightHours: 0, remark: "" },
    { code: "A2", checkIn: "9", checkOut: "17", hoursPay: 8, nightHours: 0, remark: "" },
    { code: "A3", checkIn: "10", checkOut: "18", hoursPay: 8, nightHours: 0, remark: "" },
    { code: "A4", checkIn: "11", checkOut: "19", hoursPay: 8, nightHours: 0, remark: "" },
    { code: "A5", checkIn: "12", checkOut: "20", hoursPay: 8, nightHours: 0, remark: "" },
    { code: "A6", checkIn: "13", checkOut: "21", hoursPay: 8, nightHours: 0, remark: "" },
    { code: "A7", checkIn: "14", checkOut: "22", hoursPay: 8, nightHours: 0, remark: "中班（15:00-23:00)" },
    { code: "B", checkIn: "15", checkOut: "23", hoursPay: 8, nightHours: 1, remark: "" },
    { code: "B1", checkIn: "16", checkOut: "0", hoursPay: 8, nightHours: 2, remark: "" },
    { code: "B2", checkIn: "17", checkOut: "1", hoursPay: 8, nightHours: 3, remark: "" },
    { code: "B3", checkIn: "18", checkOut: "2", hoursPay: 8, nightHours: 4, remark: "" },
    { code: "B4", checkIn: "19", checkOut: "3", hoursPay: 8, nightHours: 5, remark: "" },
    { code: "B5", checkIn: "20", checkOut: "4", hoursPay: 8, nightHours: 6, remark: "" },
    { code: "B6", checkIn: "21", checkOut: "5", hoursPay: 8, nightHours: 7, remark: "" },
    { code: "B7", checkIn: "22", checkOut: "6", hoursPay: 8, nightHours: 8, remark: "" },
    { code: "C", checkIn: "23", checkOut: "7", hoursPay: 8, nightHours: 7, remark: "夜班（23:00-07:00)" },
    { code: "C1", checkIn: "0", checkOut: "8", hoursPay: 8, nightHours: 6, remark: "" },
    { code: "C2", checkIn: "1", checkOut: "9", hoursPay: 8, nightHours: 5, remark: "" },
    { code: "C3", checkIn: "2", checkOut: "10", hoursPay: 8, nightHours: 4, remark: "" },
    { code: "C4", checkIn: "3", checkOut: "11", hoursPay: 8, nightHours: 3, remark: "" },
    { code: "C5", checkIn: "4", checkOut: "12", hoursPay: 8, nightHours: 2, remark: "" },
    { code: "C6", checkIn: "5", checkOut: "13", hoursPay: 8, nightHours: 1, remark: "" },
    { code: "C7", checkIn: "6", checkOut: "14", hoursPay: 8, nightHours: 0, remark: "" },
    { code: "NPL", checkIn: "NO PAY LEAVE", checkOut: "NO WORK", hoursPay: 0, nightHours: 0, remark: "" },
    { code: "OFF", checkIn: "1 OFF/WEEK", checkOut: "NO WORK", hoursPay: 0, nightHours: 0, remark: "" },
    { code: "SL", checkIn: "SICK LEAVE", checkOut: "NO WORK", hoursPay: 8, nightHours: 0, remark: "" },
    { code: "PH", checkIn: "PUBLIC HOLIDAY", checkOut: "NO WORK", hoursPay: 8, nightHours: 0, remark: "" },
    { code: "TL", checkIn: "TIME IN LIEU", checkOut: "NO WORK", hoursPay: 8, nightHours: 0, remark: "" },
    { code: "AL", checkIn: "ANNUAL LEAVE", checkOut: "NO WORK", hoursPay: 8, nightHours: 0, remark: "" },
    { code: "BL", checkIn: "BIRTHDATE LEAVE", checkOut: "NO WORK", hoursPay: 8, nightHours: 0, remark: "" }
  ]);
  const SHIFT_CODE_MAP = SHIFT_CODE_DEFINITIONS.reduce(function (result, item) {
    result[item.code] = item;
    return result;
  }, {});
  const VALID_SHIFT_CODES = SHIFT_CODE_DEFINITIONS.map(function (item) { return item.code; });
  const MAJOR_SHIFT_CODES = VALID_SHIFT_CODES.slice(0, 24);
  const dom = {
    app: document.getElementById("scheduleApp"),
    headerTitle: document.getElementById("scheduleHeaderTitle"),
    yearLabel: document.getElementById("scheduleYearLabel"),
    monthLabel: document.getElementById("scheduleMonthLabel"),
    yearSelect: document.getElementById("scheduleYear"),
    monthSelect: document.getElementById("scheduleMonth"),
    monthMeta: document.getElementById("scheduleMonthMeta"),
    sheetScroll: document.getElementById("scheduleSheetScroll"),
    sheetZoom: document.getElementById("scheduleSheetZoom"),
    selectionMeta: document.getElementById("scheduleSelectionMeta"),
    selectionInput: document.getElementById("scheduleSelectionInput"),
    feedback: document.getElementById("scheduleFeedback"),
    localeMount: document.getElementById("scheduleLocaleMount"),
    legendToggle: document.getElementById("scheduleLegendToggle"),
    legendPanel: document.getElementById("scheduleLegendPanel"),
    legendBody: document.getElementById("scheduleLegendBody"),
    legendTable: document.getElementById("scheduleLegendTable"),
    shiftCodeList: document.getElementById("scheduleShiftCodeList"),
    table: document.getElementById("scheduleTable"),
    tableHead: document.getElementById("scheduleTableHead"),
    tableBody: document.getElementById("scheduleTableBody"),
    summaryHead: document.getElementById("scheduleSummaryHead"),
    summaryBody: document.getElementById("scheduleSummaryBody"),
    dailySection: document.getElementById("dailySummarySection"),
    dailyHead: document.getElementById("dailySummaryHead"),
    dailyBody: document.getElementById("dailySummaryBody"),
    legendTitle: document.querySelector(".schedule-legend__title")
  };

  if (!i18n || !dom.app || !dom.yearSelect || !dom.monthSelect || !dom.tableHead || !dom.tableBody) {
    return;
  }

  const uiState = {
    selection: null,
    anchor: null,
    isSelecting: false,
    history: [],
    feedbackTimer: 0,
    localeMenuOpen: false,
    dragRowId: "",
    dragOverId: ""
  };
  const state = loadState();

  buildShiftCodeDatalist();
  populatePeriodOptions();
  bindEvents();
  ensureCurrentMonthState();
  renderStaticText();
  renderLocaleControl();
  buildLegendTable();
  renderAll();
  const unsubscribeI18n = i18n.subscribe(function () {
    renderStaticText();
    renderLocaleControl();
    buildLegendTable();
    renderAll();
  });

  window.addEventListener("beforeunload", function () {
    unsubscribeI18n();
  });

  function createInitialState() {
    return {
      selectedYear: WORKBOOK_DEFAULT_YEAR,
      selectedMonth: WORKBOOK_DEFAULT_MONTH,
      legendOpen: false,
      zoomLevel: 1,
      months: {}
    };
  }

  function createEmployeeSnapshot(employee) {
    const basic = employee && employee.basic ? employee.basic : {};
    const work = employee && employee.work ? employee.work : {};
    const department = work.department && typeof work.department === "object"
      ? (work.department.other || work.department.preset || "")
      : (work.department || "");

    return {
      employeeId: String(employee && employee.id ? employee.id : basic.ydiId || ""),
      ydiId: String(basic.ydiId || ""),
      department: String(department || ""),
      vieName: String(basic.vieName || ""),
      engName: String(basic.engName || ""),
      position: String(work.position || "")
    };
  }

  function createRowFromEmployee(employee) {
    const snapshot = createEmployeeSnapshot(employee);
    return {
      id: "schedule-row-" + snapshot.employeeId,
      employeeId: snapshot.employeeId,
      employeeSnapshot: snapshot,
      shifts: {}
    };
  }

  function normalizeCellValue(value) {
    return String(value || "").trim().toUpperCase();
  }

  function normalizeShifts(value) {
    const result = {};
    if (!value || typeof value !== "object") {
      return result;
    }
    Object.keys(value).forEach(function (key) {
      if (!/^\d+$/.test(key)) {
        return;
      }
      const nextValue = normalizeCellValue(value[key]);
      if (nextValue) {
        result[String(Number(key))] = nextValue;
      }
    });
    return result;
  }

  function normalizeRow(row) {
    const snapshot = row && row.employeeSnapshot ? row.employeeSnapshot : {};
    return {
      id: String(row && row.id ? row.id : "schedule-row-" + (row && row.employeeId ? row.employeeId : Date.now())),
      employeeId: String(row && row.employeeId ? row.employeeId : ""),
      employeeSnapshot: {
        employeeId: String(snapshot.employeeId || row && row.employeeId || ""),
        ydiId: String(snapshot.ydiId || ""),
        department: String(snapshot.department || ""),
        vieName: String(snapshot.vieName || ""),
        engName: String(snapshot.engName || ""),
        position: String(snapshot.position || "")
      },
      shifts: normalizeShifts(row && row.shifts)
    };
  }

  function sanitizeYear(value) {
    const year = Number(value);
    return Number.isFinite(year) && year >= 2020 && year <= 2100 ? Math.round(year) : WORKBOOK_DEFAULT_YEAR;
  }

  function sanitizeMonth(value) {
    const month = Number(value);
    return Number.isFinite(month) && month >= 1 && month <= 12 ? Math.round(month) : WORKBOOK_DEFAULT_MONTH;
  }

  function sanitizeZoom(value) {
    const zoom = Number(value);
    if (!Number.isFinite(zoom)) {
      return 1;
    }
    return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(zoom * 100) / 100));
  }

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!parsed || typeof parsed !== "object") {
        return createInitialState();
      }
      return {
        selectedYear: sanitizeYear(parsed.selectedYear),
        selectedMonth: sanitizeMonth(parsed.selectedMonth),
        legendOpen: Boolean(parsed.legendOpen),
        zoomLevel: sanitizeZoom(parsed.zoomLevel),
        months: parsed.months && typeof parsed.months === "object" ? parsed.months : {}
      };
    } catch (error) {
      return createInitialState();
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function getCurrentMonthKey() {
    return String(state.selectedYear) + "-" + String(state.selectedMonth).padStart(2, "0");
  }

  function getMonthState() {
    return state.months[getCurrentMonthKey()];
  }

  function getEmployeesState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(EMPLOYEES_KEY) || "null");
      if (parsed && Array.isArray(parsed.employees)) {
        return parsed;
      }
    } catch (error) {}
    return { employees: employeesDataApi && Array.isArray(employeesDataApi.SEED_EMPLOYEES) ? employeesDataApi.SEED_EMPLOYEES : [] };
  }

  function getActiveEmployees() {
    const employees = getEmployeesState().employees || [];
    return employees.filter(function (employee) {
      return employee && employee.work && employee.work.status === "在職";
    });
  }

  function ensureCurrentMonthState() {
    const key = getCurrentMonthKey();
    const monthState = state.months[key] && typeof state.months[key] === "object" ? state.months[key] : { rows: [] };
    monthState.rows = Array.isArray(monthState.rows) ? monthState.rows.map(normalizeRow) : [];
    syncMonthRows(monthState);
    state.months[key] = monthState;
    saveState();
    return monthState;
  }

  function syncMonthRows(monthState) {
    const activeEmployees = getActiveEmployees();
    const activeMap = new Map();
    const nextRows = [];
    const seen = new Set();

    activeEmployees.forEach(function (employee) {
      const snapshot = createEmployeeSnapshot(employee);
      activeMap.set(snapshot.employeeId, snapshot);
    });

    monthState.rows.forEach(function (row) {
      const snapshot = activeMap.get(row.employeeId);
      if (!snapshot || seen.has(row.employeeId)) {
        return;
      }
      seen.add(row.employeeId);
      nextRows.push({
        id: row.id || "schedule-row-" + row.employeeId,
        employeeId: row.employeeId,
        employeeSnapshot: snapshot,
        shifts: normalizeShifts(row.shifts)
      });
    });

    activeEmployees.forEach(function (employee) {
      const snapshot = createEmployeeSnapshot(employee);
      if (seen.has(snapshot.employeeId)) {
        return;
      }
      seen.add(snapshot.employeeId);
      nextRows.push(createRowFromEmployee(employee));
    });

    monthState.rows = nextRows;
  }

  function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  function getWeekdayLabel(year, month, day) {
    const locale = i18n.getLocale();
    return (WEEKDAY_LABELS[locale] || WEEKDAY_LABELS["zh-Hant"])[new Date(year, month - 1, day).getDay()];
  }

  function getFixedFieldLabel(field) {
    const locale = i18n.getLocale();
    return field.labels[locale] || field.labels["zh-Hant"];
  }

  function renderStaticText() {
    document.title = i18n.t("schedule.pageTitle");
    dom.app.classList.toggle("schedule-app--legend-open", Boolean(state.legendOpen));
    dom.headerTitle.textContent = i18n.t("home.menu.schedule");
    dom.yearLabel.textContent = i18n.getLocale() === "zh-Hant" ? "年" : i18n.t("schedule.year");
    dom.monthLabel.textContent = i18n.getLocale() === "zh-Hant" ? "月" : i18n.t("schedule.month");
    dom.yearSelect.setAttribute("aria-label", i18n.t("schedule.year"));
    dom.monthSelect.setAttribute("aria-label", i18n.t("schedule.month"));
    dom.legendToggle.setAttribute("aria-label", i18n.t("schedule.legend"));
    dom.legendToggle.setAttribute("aria-expanded", String(Boolean(state.legendOpen)));
    dom.legendToggle.textContent = state.legendOpen ? ">>" : "<<";
    dom.legendPanel.setAttribute("aria-label", i18n.t("schedule.legendPanelAria"));
    if (dom.legendTitle) {
      dom.legendTitle.textContent = i18n.t("schedule.legend");
    }
  }

  function renderLocaleControl() {
    if (!dom.localeMount) {
      return;
    }
    const options = i18n.getLocaleOptions().map(function (option) {
      const activeClass = option.value === i18n.getLocale() ? " is-active" : "";
      return [
        '<button type="button" class="yd-locale-option' + activeClass + '" data-locale-value="' + option.value + '">',
        "<span>" + escapeHtml(option.label) + "</span>",
        '<span class="yd-locale-option__check" aria-hidden="true">●</span>',
        "</button>"
      ].join("");
    }).join("");

    dom.localeMount.innerHTML = [
      '<div class="yd-locale-control">',
      '<button type="button" class="yd-locale-button" data-locale-toggle="true" aria-label="' + escapeHtml(i18n.t("common.settings")) + '" aria-expanded="' + String(uiState.localeMenuOpen) + '">',
      '<span class="yd-locale-button__icon" aria-hidden="true">⚙</span>',
      "</button>",
      '<div class="yd-locale-popover"' + (uiState.localeMenuOpen ? "" : " hidden") + ">",
      '<p class="yd-locale-popover__title">' + escapeHtml(i18n.t("common.language")) + "</p>",
      options,
      "</div>",
      "</div>"
    ].join("");
  }

  function populatePeriodOptions() {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = WORKBOOK_DEFAULT_YEAR - 2; year <= currentYear + 4; year += 1) {
      years.push('<option value="' + year + '">' + year + "</option>");
    }
    dom.yearSelect.innerHTML = years.join("");

    const months = [];
    for (let month = 1; month <= 12; month += 1) {
      months.push('<option value="' + month + '">' + String(month).padStart(2, "0") + "</option>");
    }
    dom.monthSelect.innerHTML = months.join("");
  }

  function buildShiftCodeDatalist() {
    if (!dom.shiftCodeList) {
      return;
    }
    dom.shiftCodeList.innerHTML = VALID_SHIFT_CODES.map(function (code) {
      return '<option value="' + escapeHtml(code) + '"></option>';
    }).join("");
  }

  function buildLegendTable() {
    if (!dom.legendTable || !dom.legendBody) {
      return;
    }
    const headLabels = [
      i18n.t("schedule.legend.shiftCode"),
      i18n.t("schedule.legend.checkIn"),
      i18n.t("schedule.legend.checkOut"),
      i18n.t("schedule.legend.hoursPay"),
      i18n.t("schedule.legend.nightHours"),
      i18n.t("schedule.legend.remark")
    ];
    const headCells = dom.legendTable.querySelectorAll("thead th");
    headLabels.forEach(function (label, index) {
      if (headCells[index]) {
        headCells[index].textContent = label;
      }
    });
    dom.legendBody.innerHTML = SHIFT_CODE_DEFINITIONS.map(function (item) {
      return [
        "<tr>",
        '<td data-code-group="' + getCodeGroup(item.code) + '">' + escapeHtml(item.code) + "</td>",
        "<td>" + escapeHtml(item.checkIn) + "</td>",
        "<td>" + escapeHtml(item.checkOut) + "</td>",
        "<td>" + escapeHtml(item.hoursPay) + "</td>",
        "<td>" + escapeHtml(item.nightHours) + "</td>",
        "<td>" + escapeHtml(item.remark) + "</td>",
        "</tr>"
      ].join("");
    }).join("");
  }

  function renderAll() {
    const monthState = ensureCurrentMonthState();
    dom.yearSelect.value = String(state.selectedYear);
    dom.monthSelect.value = String(state.selectedMonth);
    renderZoom();
    renderMonthMeta(monthState);
    renderTableHead();
    renderTableBody(monthState);
    renderSummary(monthState);
    renderDailySummary(monthState);
    renderSelectionState();
    renderSelectionMeta();
  }

  function renderMonthMeta(monthState) {
    const days = getDaysInMonth(state.selectedYear, state.selectedMonth);
    const validCount = monthState.rows.reduce(function (total, row) {
      return total + Object.keys(row.shifts).filter(function (day) {
        return Boolean(SHIFT_CODE_MAP[normalizeCellValue(row.shifts[day])]);
      }).length;
    }, 0);
    dom.monthMeta.textContent = i18n.t("schedule.monthMeta", {
      year: state.selectedYear,
      month: String(state.selectedMonth).padStart(2, "0"),
      days: days,
      count: validCount
    });
  }

  function renderTableHead() {
    const labels = META_HEADERS[i18n.getLocale()] || META_HEADERS["zh-Hant"];
    const days = getDaysInMonth(state.selectedYear, state.selectedMonth);
    let dayRow = '<tr><th class="schedule-table__handle-head schedule-table__sticky schedule-table__sticky--handle" rowspan="2"></th>';
    dayRow += '<th class="schedule-table__meta-head schedule-table__meta--id schedule-table__sticky schedule-table__sticky--id" rowspan="2">' + escapeHtml(labels[0]) + "</th>";
    dayRow += '<th class="schedule-table__meta-head schedule-table__meta--department schedule-table__sticky schedule-table__sticky--department" rowspan="2">' + escapeHtml(labels[1]) + "</th>";
    dayRow += '<th class="schedule-table__meta-head schedule-table__meta--vie schedule-table__sticky schedule-table__sticky--vie" rowspan="2">' + escapeHtml(labels[2]) + "</th>";
    dayRow += '<th class="schedule-table__meta-head schedule-table__meta--eng schedule-table__sticky schedule-table__sticky--eng" rowspan="2">' + escapeHtml(labels[3]) + "</th>";
    dayRow += '<th class="schedule-table__meta-head schedule-table__meta--position schedule-table__sticky schedule-table__sticky--position" rowspan="2">' + escapeHtml(labels[4]) + "</th>";

    let weekdayRow = "<tr>";
    for (let day = 1; day <= days; day += 1) {
      dayRow += '<th class="schedule-table__day-head">' + day + "</th>";
      weekdayRow += '<th class="schedule-table__weekday-head">' + escapeHtml(getWeekdayLabel(state.selectedYear, state.selectedMonth, day)) + "</th>";
    }
    dom.tableHead.innerHTML = dayRow + "</tr>" + weekdayRow + "</tr>";
  }

  function renderTableBody(monthState) {
    const days = getDaysInMonth(state.selectedYear, state.selectedMonth);
    dom.tableBody.innerHTML = monthState.rows.map(function (row, rowIndex) {
      const snapshot = row.employeeSnapshot;
      let html = '<tr class="schedule-table__body-row" data-row-id="' + escapeHtml(row.id) + '" data-row-index="' + rowIndex + '">';
      html += '<td class="schedule-table__handle schedule-table__sticky schedule-table__sticky--handle"><button type="button" class="schedule-row-handle" data-row-handle="' + escapeHtml(row.id) + '" draggable="true" aria-label="Reorder">•••</button></td>';
      html += '<td class="schedule-table__meta schedule-table__sticky schedule-table__sticky--id">' + escapeHtml(snapshot.ydiId) + "</td>";
      html += '<td class="schedule-table__meta schedule-table__sticky schedule-table__sticky--department">' + escapeHtml(snapshot.department) + "</td>";
      html += '<td class="schedule-table__meta schedule-table__sticky schedule-table__sticky--vie">' + escapeHtml(snapshot.vieName) + "</td>";
      html += '<td class="schedule-table__meta schedule-table__sticky schedule-table__sticky--eng">' + escapeHtml(snapshot.engName) + "</td>";
      html += '<td class="schedule-table__meta schedule-table__sticky schedule-table__sticky--position">' + escapeHtml(snapshot.position) + "</td>";
      for (let day = 1; day <= days; day += 1) {
        const code = normalizeCellValue(row.shifts[String(day)]);
        html += '<td class="schedule-table__cell"><button type="button" class="schedule-cell" data-schedule-cell="true" data-row-index="' + rowIndex + '" data-day="' + day + '" data-code-group="' + escapeHtml(getCodeGroup(code)) + '">' + renderCellValue(code) + "</button></td>";
      }
      return html + "</tr>";
    }).join("");
  }

  function renderSummary(monthState) {
    dom.summaryHead.innerHTML = [
      '<tr class="schedule-summary-table__spacer"><th colspan="' + SUMMARY_FIELDS.length + '"></th></tr>',
      '<tr class="schedule-summary-table__labels">',
      SUMMARY_FIELDS.map(function (field) {
        return "<th>" + escapeHtml(getFixedFieldLabel(field)) + "</th>";
      }).join(""),
      "</tr>"
    ].join("");

    dom.summaryBody.innerHTML = monthState.rows.map(function (row, rowIndex) {
      const summary = getRowSummary(row);
      return [
        '<tr data-summary-row-index="' + rowIndex + '">',
        SUMMARY_FIELDS.map(function (field) {
          return '<td data-summary-row-index="' + rowIndex + '" data-summary-field="' + field.id + '">' + escapeHtml(summary[field.id]) + "</td>";
        }).join(""),
        "</tr>"
      ].join("");
    }).join("");
  }

  function renderDailySummary(monthState) {
    const days = getDaysInMonth(state.selectedYear, state.selectedMonth);
    const activeCodes = MAJOR_SHIFT_CODES.filter(function (code) {
      return monthState.rows.some(function (row) {
        return Object.keys(row.shifts).some(function (day) {
          return normalizeCellValue(row.shifts[day]) === code;
        });
      });
    });

    if (!activeCodes.length) {
      dom.dailySection.hidden = true;
      dom.dailyHead.innerHTML = "";
      dom.dailyBody.innerHTML = "";
      return;
    }

    dom.dailySection.hidden = false;
    let head = "<tr><th>" + escapeHtml(i18n.t("schedule.dailyCode")) + "</th>";
    for (let day = 1; day <= days; day += 1) {
      head += '<th data-daily-day-head="' + day + '">' + day + "</th>";
    }
    dom.dailyHead.innerHTML = head + "</tr>";

    dom.dailyBody.innerHTML = activeCodes.map(function (code) {
      let row = '<tr data-daily-code-row="' + escapeHtml(code) + '"><td>' + escapeHtml(code) + "</td>";
      for (let day = 1; day <= days; day += 1) {
        row += '<td data-daily-code="' + escapeHtml(code) + '" data-daily-day="' + day + '">' + getDailyCount(monthState.rows, code, day) + "</td>";
      }
      return row + "</tr>";
    }).join("");
  }

  function getDailyCount(rows, code, day) {
    const dayKey = String(day);
    return rows.reduce(function (total, row) {
      return total + (normalizeCellValue(row.shifts[dayKey]) === code ? 1 : 0);
    }, 0);
  }

  function getRowSummary(row) {
    const dayCount = getDaysInMonth(state.selectedYear, state.selectedMonth);
    return Object.keys(row.shifts).reduce(function (summary, day) {
      const code = normalizeCellValue(row.shifts[day]);
      const definition = SHIFT_CODE_MAP[code];
      if (code === "加") {
        summary.overtimeCount += 1;
      }
      if (definition) {
        summary.actualHours += Number(definition.hoursPay || 0);
        summary.nightHours += Number(definition.nightHours || 0);
      }
      return summary;
    }, {
      overtimeCount: 0,
      requiredHours: Math.max(0, (dayCount - 4) * 8),
      actualHours: 0,
      nightHours: 0
    });
  }

  function bindEvents() {
    dom.yearSelect.addEventListener("change", function () {
      handlePeriodChange(sanitizeYear(dom.yearSelect.value), sanitizeMonth(dom.monthSelect.value));
    });
    dom.monthSelect.addEventListener("change", function () {
      handlePeriodChange(sanitizeYear(dom.yearSelect.value), sanitizeMonth(dom.monthSelect.value));
    });
    dom.legendToggle.addEventListener("click", function () {
      state.legendOpen = !state.legendOpen;
      saveState();
      renderStaticText();
    });
    dom.localeMount.addEventListener("click", function (event) {
      const toggle = event.target.closest("[data-locale-toggle]");
      const option = event.target.closest("[data-locale-value]");
      if (toggle) {
        event.stopPropagation();
        uiState.localeMenuOpen = !uiState.localeMenuOpen;
        renderLocaleControl();
        return;
      }
      if (!option) {
        return;
      }
      event.stopPropagation();
      uiState.localeMenuOpen = false;
      i18n.setLocale(option.getAttribute("data-locale-value"));
    });
    document.addEventListener("click", function (event) {
      if (uiState.localeMenuOpen && dom.localeMount && !dom.localeMount.contains(event.target)) {
        uiState.localeMenuOpen = false;
        renderLocaleControl();
      }
    });
    dom.selectionInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        applySelectionInput();
      }
    });
    dom.sheetScroll.addEventListener("wheel", function (event) {
      if (!event.ctrlKey) {
        return;
      }
      event.preventDefault();
      adjustZoom(event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP);
    }, { passive: false });
    dom.tableBody.addEventListener("mousedown", handleCellPointerStart);
    dom.tableBody.addEventListener("mouseover", handleCellPointerMove);
    document.addEventListener("mouseup", function () {
      uiState.isSelecting = false;
    });
    dom.tableBody.addEventListener("dragstart", handleDragStart);
    dom.tableBody.addEventListener("dragover", handleDragOver);
    dom.tableBody.addEventListener("drop", handleDrop);
    dom.tableBody.addEventListener("dragend", clearDragState);
    window.addEventListener("keydown", handleGlobalKeydown);
  }

  function handlePeriodChange(year, month) {
    const previousKey = getCurrentMonthKey();
    state.selectedYear = year;
    state.selectedMonth = month;
    ensureCurrentMonthState();
    saveState();
    if (uiState.history.length && previousKey !== getCurrentMonthKey()) {
      uiState.history = [];
      showFeedback(i18n.t("schedule.feedback.undoMonthChanged"), "success");
    }
    clearSelection(false);
    renderAll();
  }

  function handleCellPointerStart(event) {
    const cell = event.target.closest("[data-schedule-cell]");
    if (!cell || event.button !== 0) {
      return;
    }
    const point = getCellPoint(cell);
    if (event.shiftKey && uiState.anchor) {
      setSelection(uiState.anchor, point, true);
      return;
    }
    uiState.isSelecting = true;
    uiState.anchor = point;
    setSelection(point, point, true);
  }

  function handleCellPointerMove(event) {
    if (!uiState.isSelecting || !uiState.anchor) {
      return;
    }
    const cell = event.target.closest("[data-schedule-cell]");
    if (!cell) {
      return;
    }
    setSelection(uiState.anchor, getCellPoint(cell), false);
  }

  function handleGlobalKeydown(event) {
    const key = event.key;
    if ((event.ctrlKey || event.metaKey) && key.toLowerCase() === "z") {
      event.preventDefault();
      undoLatest();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && (key === "+" || key === "=")) {
      event.preventDefault();
      adjustZoom(ZOOM_STEP);
      return;
    }
    if ((event.ctrlKey || event.metaKey) && key === "-") {
      event.preventDefault();
      adjustZoom(-ZOOM_STEP);
      return;
    }
    if ((event.ctrlKey || event.metaKey) && key === "0") {
      event.preventDefault();
      state.zoomLevel = 1;
      saveState();
      renderZoom();
      return;
    }
    if (!uiState.selection) {
      return;
    }
    if (key === "Delete" || key === "Backspace") {
      event.preventDefault();
      clearSelectedCells();
      return;
    }
    if (key === "Escape") {
      event.preventDefault();
      clearSelection(true);
      return;
    }
    if (!event.ctrlKey && !event.metaKey && !event.altKey && key.length === 1 && document.activeElement !== dom.selectionInput) {
      event.preventDefault();
      dom.selectionInput.value = normalizeCellValue(dom.selectionInput.value + key);
      return;
    }
    if (key === "Enter" && document.activeElement !== dom.selectionInput) {
      event.preventDefault();
      applySelectionInput();
    }
  }

  function handleDragStart(event) {
    const handle = event.target.closest("[data-row-handle]");
    if (!handle) {
      return;
    }
    uiState.dragRowId = handle.getAttribute("data-row-handle") || "";
    const row = handle.closest(".schedule-table__body-row");
    if (row) {
      row.classList.add("is-dragging");
    }
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", uiState.dragRowId);
    }
  }

  function handleDragOver(event) {
    const row = event.target.closest(".schedule-table__body-row");
    if (!row || !uiState.dragRowId) {
      return;
    }
    event.preventDefault();
    clearDropTargets();
    uiState.dragOverId = row.getAttribute("data-row-id") || "";
    row.classList.add("is-drop-target");
  }

  function handleDrop(event) {
    const row = event.target.closest(".schedule-table__body-row");
    if (!row || !uiState.dragRowId) {
      return;
    }
    event.preventDefault();
    reorderRows(uiState.dragRowId, row.getAttribute("data-row-id") || "");
    clearDragState();
  }

  function clearDragState() {
    uiState.dragRowId = "";
    uiState.dragOverId = "";
    Array.prototype.forEach.call(dom.tableBody.querySelectorAll(".is-dragging, .is-drop-target"), function (node) {
      node.classList.remove("is-dragging", "is-drop-target");
    });
  }

  function clearDropTargets() {
    Array.prototype.forEach.call(dom.tableBody.querySelectorAll(".is-drop-target"), function (node) {
      node.classList.remove("is-drop-target");
    });
  }

  function reorderRows(sourceId, targetId) {
    if (!sourceId || !targetId || sourceId === targetId) {
      return;
    }
    const monthState = ensureCurrentMonthState();
    const sourceIndex = monthState.rows.findIndex(function (row) { return row.id === sourceId; });
    const targetIndex = monthState.rows.findIndex(function (row) { return row.id === targetId; });
    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
      return;
    }
    const moved = monthState.rows.splice(sourceIndex, 1)[0];
    monthState.rows.splice(targetIndex, 0, moved);
    saveState();
    clearSelection(false);
    renderAll();
  }

  function setSelection(start, end, focusInput) {
    uiState.selection = {
      startRow: Math.min(start.rowIndex, end.rowIndex),
      endRow: Math.max(start.rowIndex, end.rowIndex),
      startDay: Math.min(start.day, end.day),
      endDay: Math.max(start.day, end.day)
    };
    renderSelectionState();
    renderSelectionMeta();
    if (focusInput) {
      focusSelectionInput();
    }
  }

  function clearSelection(clearInput) {
    uiState.selection = null;
    uiState.anchor = null;
    if (clearInput) {
      dom.selectionInput.value = "";
    }
    renderSelectionState();
    renderSelectionMeta();
  }

  function renderSelectionState() {
    Array.prototype.forEach.call(dom.tableBody.querySelectorAll("[data-schedule-cell]"), function (cell) {
      const point = getCellPoint(cell);
      cell.classList.toggle("is-selected", isCellSelected(point.rowIndex, point.day));
    });
  }

  function renderSelectionMeta() {
    dom.selectionMeta.textContent = uiState.selection
      ? i18n.t("schedule.selection.summary", getSelectionStats())
      : i18n.t("schedule.selection.none");
  }

  function isCellSelected(rowIndex, day) {
    return Boolean(uiState.selection) &&
      rowIndex >= uiState.selection.startRow &&
      rowIndex <= uiState.selection.endRow &&
      day >= uiState.selection.startDay &&
      day <= uiState.selection.endDay;
  }

  function getSelectionStats() {
    const rows = uiState.selection.endRow - uiState.selection.startRow + 1;
    const days = uiState.selection.endDay - uiState.selection.startDay + 1;
    return { rows: rows, days: days, cells: rows * days };
  }

  function getSelectedPoints() {
    const cells = [];
    if (!uiState.selection) {
      return cells;
    }
    for (let rowIndex = uiState.selection.startRow; rowIndex <= uiState.selection.endRow; rowIndex += 1) {
      for (let day = uiState.selection.startDay; day <= uiState.selection.endDay; day += 1) {
        cells.push({ rowIndex: rowIndex, day: day });
      }
    }
    return cells;
  }

  function applySelectionInput() {
    applyCodeToSelection(normalizeCellValue(dom.selectionInput.value));
  }

  function clearSelectedCells() {
    applyCodeToSelection("", true);
  }

  function applyCodeToSelection(code, clearing) {
    if (!uiState.selection) {
      showFeedback(i18n.t(clearing ? "schedule.feedback.selectClear" : "schedule.feedback.selectCell"), "error");
      return;
    }
    if (!clearing && !code) {
      showFeedback(i18n.t("schedule.feedback.enterCode"), "error");
      return;
    }
    if (code && !SHIFT_CODE_MAP[code]) {
      showFeedback(i18n.t("schedule.feedback.invalidCode", { code: code }), "error");
      return;
    }
    const monthState = ensureCurrentMonthState();
    const changes = [];
    getSelectedPoints().forEach(function (point) {
      const row = monthState.rows[point.rowIndex];
      if (!row) {
        return;
      }
      const dayKey = String(point.day);
      const previous = normalizeCellValue(row.shifts[dayKey]);
      if (previous === code) {
        return;
      }
      changes.push({ rowId: row.id, day: dayKey, previous: previous });
      if (code) {
        row.shifts[dayKey] = code;
      } else {
        delete row.shifts[dayKey];
      }
    });
    if (!changes.length) {
      showFeedback(i18n.t("schedule.feedback.noChanges"), "error");
      return;
    }
    uiState.history.push({ monthKey: getCurrentMonthKey(), changes: changes });
    if (uiState.history.length > 120) {
      uiState.history.shift();
    }
    saveState();
    dom.selectionInput.value = "";
    renderAll();
    focusSelectionInput();
    showFeedback(i18n.t(clearing ? "schedule.feedback.cleared" : "schedule.feedback.applied", { code: code }), "success");
  }

  function undoLatest() {
    const entry = uiState.history.pop();
    if (!entry) {
      showFeedback(i18n.t("schedule.feedback.undoEmpty"), "error");
      return;
    }
    if (entry.monthKey !== getCurrentMonthKey()) {
      uiState.history = [];
      showFeedback(i18n.t("schedule.feedback.undoMonthChanged"), "error");
      return;
    }
    const monthState = ensureCurrentMonthState();
    entry.changes.forEach(function (change) {
      const row = monthState.rows.find(function (item) { return item.id === change.rowId; });
      if (!row) {
        return;
      }
      if (change.previous) {
        row.shifts[change.day] = change.previous;
      } else {
        delete row.shifts[change.day];
      }
    });
    saveState();
    renderAll();
    showFeedback(i18n.t("schedule.feedback.undoDone"), "success");
  }

  function adjustZoom(delta) {
    state.zoomLevel = sanitizeZoom(state.zoomLevel + delta);
    saveState();
    renderZoom();
  }

  function renderZoom() {
    dom.sheetZoom.style.zoom = String(state.zoomLevel);
  }

  function focusSelectionInput() {
    try {
      dom.selectionInput.focus({ preventScroll: true });
    } catch (error) {
      dom.selectionInput.focus();
    }
  }

  function getCellPoint(cell) {
    return {
      rowIndex: Number(cell.getAttribute("data-row-index") || 0),
      day: Number(cell.getAttribute("data-day") || 1)
    };
  }

  function renderCellValue(code) {
    return code ? escapeHtml(code) : '<span class="schedule-cell__placeholder">·</span>';
  }

  function getCodeGroup(code) {
    if (!code) {
      return "empty";
    }
    if (/^A/.test(code)) {
      return "A";
    }
    if (/^B/.test(code)) {
      return "B";
    }
    if (/^C/.test(code)) {
      return "C";
    }
    if (code === "OFF") {
      return "off";
    }
    if (["NPL", "SL", "PH", "TL", "AL", "BL"].indexOf(code) >= 0) {
      return "leave";
    }
    return "other";
  }

  function showFeedback(message, tone) {
    clearTimeout(uiState.feedbackTimer);
    dom.feedback.dataset.tone = tone || "";
    dom.feedback.textContent = message || "";
    if (!message) {
      return;
    }
    uiState.feedbackTimer = window.setTimeout(function () {
      dom.feedback.textContent = "";
      dom.feedback.dataset.tone = "";
    }, 1800);
  }

  function escapeHtml(value) {
    return String(value === undefined || value === null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();
