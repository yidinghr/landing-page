(function () {
  const i18n = window.YiDingI18n || null;
  const employeesDataApi = window.YiDingEmployeesData || null;
  const STORAGE_KEY = "yiding_schedule_module_v3";
  const LEGEND_REMARKS_KEY = "yiding_schedule_legend_remarks_v1";
  const LEGEND_CODE_LABELS_KEY = "yiding_schedule_legend_code_labels_v1";
  const EMPLOYEES_KEY = employeesDataApi && employeesDataApi.STORAGE_KEY
    ? employeesDataApi.STORAGE_KEY
    : "yiding_employees_module_state_v3_airtable_import";
  const WORKBOOK_DEFAULT_YEAR = 2026;
  const WORKBOOK_DEFAULT_MONTH = 7;
  const ZOOM_MIN = 0.65;
  const ZOOM_MAX = 1.35;
  const ZOOM_STEP = 0.05;
  const LEGACY_DEFAULT_COLUMN_WIDTHS = Object.freeze({
    id: 96,
    dept: 96,
    vie: 146,
    eng: 132,
    position: 104,
    day: 42
  });
  const META_COLUMNS = [
    { key: "ydiId", widthKey: "id" },
    { key: "department", widthKey: "dept" },
    { key: "vieName", widthKey: "vie" },
    { key: "engName", widthKey: "eng" },
    { key: "position", widthKey: "position" }
  ];
  const DEFAULT_COLUMN_WIDTHS = Object.freeze({
    id: 86,
    dept: 88,
    vie: 128,
    eng: 118,
    position: 92,
    day: 38,
    summary: 58
  });
  const WEEKDAY_LABELS = {
    "zh-Hant": ["日", "一", "二", "三", "四", "五", "六"],
    vi: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
    en: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
  };
  const SUMMARY_FIELDS = [
    { id: "overtimeCount", labels: { "zh-Hant": "加班", vi: "Tăng ca", en: "Overtime" } },
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
    workspace: document.querySelector(".schedule-workspace"),
    header: document.querySelector(".schedule-header"),
    periodBar: document.querySelector(".schedule-period-bar"),
    periodGrid: document.querySelector(".schedule-period-grid"),
    frozenLayer: document.getElementById("scheduleFrozenLayer"),
    frozenScroll: document.getElementById("scheduleFrozenScroll"),
    frozenZoom: document.getElementById("scheduleFrozenZoom"),
    headerTitle: document.getElementById("scheduleHeaderTitle"),
    yearLabel: document.getElementById("scheduleYearLabel"),
    monthLabel: document.getElementById("scheduleMonthLabel"),
    codeLabel: document.getElementById("scheduleCodeLabel"),
    addRowsLabel: document.getElementById("scheduleAddRowsLabel"),
    addRowsCount: document.getElementById("scheduleAddRowsCount"),
    addRowsButton: document.getElementById("scheduleAddRowsButton"),
    deleteRowsButton: document.getElementById("scheduleDeleteRowsButton"),
    yearSelect: document.getElementById("scheduleYear"),
    monthSelect: document.getElementById("scheduleMonth"),
    sheetScroll: document.getElementById("scheduleSheetScroll"),
    sheetZoom: document.getElementById("scheduleSheetZoom"),
    selectionMeta: document.getElementById("scheduleSelectionMeta"),
    selectionInput: document.getElementById("scheduleSelectionInput"),
    codeDropdown: document.getElementById("scheduleCodeDropdown"),
    feedback: document.getElementById("scheduleFeedback"),
    localeMount: document.getElementById("scheduleLocaleMount"),
    legendToggle: document.getElementById("scheduleLegendToggle"),
    legendPanel: document.getElementById("scheduleLegendPanel"),
    legendContent: document.getElementById("scheduleLegendContent"),
    legendBody: document.getElementById("scheduleLegendBody"),
    legendTable: document.getElementById("scheduleLegendTable"),
    sheetFrame: document.querySelector(".schedule-sheet-frame"),
    shiftCodeList: document.getElementById("scheduleShiftCodeList"),
    table: document.getElementById("scheduleTable"),
    tableHead: document.getElementById("scheduleTableHead"),
    frozenTableHead: document.getElementById("scheduleFrozenTableHead"),
    tableBody: document.getElementById("scheduleTableBody"),
    summaryTable: document.getElementById("scheduleSummaryTable"),
    summaryHead: document.getElementById("scheduleSummaryHead"),
    frozenSummaryHead: document.getElementById("scheduleFrozenSummaryHead"),
    summaryBody: document.getElementById("scheduleSummaryBody"),
    dailyTable: document.getElementById("dailySummaryTable"),
    dailySection: document.getElementById("dailySummarySection"),
    dailyHead: document.getElementById("dailySummaryHead"),
    dailyBody: document.getElementById("dailySummaryBody"),
    dailySpacerTable: document.getElementById("dailySummarySpacerTable"),
    dailySpacerHead: document.getElementById("dailySummarySpacerHead"),
    dailySpacerBody: document.getElementById("dailySummarySpacerBody"),
    lockButton: document.getElementById("scheduleLockButton"),
    saveButton: document.getElementById("scheduleSaveButton"),
    exportButton: document.getElementById("scheduleExportButton"),
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
    dragOverId: "",
    columnResize: null,
    copiedText: "",
    frozenSyncFrame: 0,
    codeDropdownOpen: false,
    codeDropdownIndex: -1,
    legendCodesEditable: false,
    scheduleLocked: false,
    exportReady: false,
    lockedScrollY: null,
    stickyMetricsObserver: null
  };
  const state = loadState();
  let legendRemarks = loadLegendRemarks();
  let legendCodeLabels = loadLegendCodeLabels();

  buildShiftCodeDatalist();
  populatePeriodOptions();
  bindEvents();
  observeStickyMetrics();
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
      columnWidths: Object.assign({}, DEFAULT_COLUMN_WIDTHS),
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
      sourceType: "employee",
      employeeId: snapshot.employeeId,
      employeeSnapshot: snapshot,
      shifts: {}
    };
  }

  function createManualRow() {
    return {
      id: "schedule-row-manual-" + Date.now() + "-" + Math.random().toString(16).slice(2, 8),
      sourceType: "manual",
      employeeId: "",
      employeeSnapshot: {
        employeeId: "",
        ydiId: "",
        department: "",
        vieName: "",
        engName: "",
        position: ""
      },
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
      sourceType: row && row.sourceType === "manual" ? "manual" : "employee",
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

  function sanitizeColumnWidths(value) {
    const nextWidths = Object.assign({}, DEFAULT_COLUMN_WIDTHS);
    if (!value || typeof value !== "object") {
      return nextWidths;
    }
    const matchesLegacyDefaults = Object.keys(LEGACY_DEFAULT_COLUMN_WIDTHS).every(function (key) {
      return Number(value[key]) === LEGACY_DEFAULT_COLUMN_WIDTHS[key];
    });
    if (matchesLegacyDefaults) {
      return nextWidths;
    }
    Object.keys(nextWidths).forEach(function (key) {
      const width = Number(value[key]);
      if (Number.isFinite(width)) {
        if (key === "summary") {
          nextWidths[key] = Math.max(54, Math.round(width));
          return;
        }
        nextWidths[key] = Math.max(key === "day" ? 36 : 64, Math.round(width));
      }
    });
    return nextWidths;
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
        columnWidths: sanitizeColumnWidths(parsed.columnWidths),
        months: parsed.months && typeof parsed.months === "object" ? parsed.months : {}
      };
    } catch (error) {
      return createInitialState();
    }
  }

  function loadLegendRemarks() {
    try {
      const parsed = JSON.parse(localStorage.getItem(LEGEND_REMARKS_KEY) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  function saveLegendRemarks() {
    localStorage.setItem(LEGEND_REMARKS_KEY, JSON.stringify(legendRemarks));
  }

  function loadLegendCodeLabels() {
    try {
      const parsed = JSON.parse(localStorage.getItem(LEGEND_CODE_LABELS_KEY) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  function saveLegendCodeLabels() {
    localStorage.setItem(LEGEND_CODE_LABELS_KEY, JSON.stringify(legendCodeLabels));
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
        return employeesDataApi && employeesDataApi.mergeStateWithSeedData
          ? employeesDataApi.mergeStateWithSeedData(parsed)
          : parsed;
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
    state.months[key] = monthState;
    saveState();
    return monthState;
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

  function renderColumnResizer(key) {
    return '<button type="button" class="schedule-column-resizer" data-resize-key="' + key + '" aria-label="Resize column"></button>';
  }

  function applyColumnWidths() {
    const target = dom.workspace || dom.app;
    Object.keys(DEFAULT_COLUMN_WIDTHS).forEach(function (key) {
      target.style.setProperty("--col-" + key, String(state.columnWidths[key]) + "px");
    });
    target.style.setProperty("--summary-col", String(state.columnWidths.summary) + "px");
  }

  function getVisibleColumnCount() {
    return META_COLUMNS.length + getDaysInMonth(state.selectedYear, state.selectedMonth);
  }

  function getColumnInfo(colIndex) {
    if (colIndex < META_COLUMNS.length) {
      return {
        type: "meta",
        meta: META_COLUMNS[colIndex]
      };
    }

    return {
      type: "schedule",
      day: colIndex - META_COLUMNS.length + 1
    };
  }

  function getGridValue(row, colIndex) {
    const column = getColumnInfo(colIndex);
    if (column.type === "meta") {
      return String(row.employeeSnapshot[column.meta.key] || "");
    }
    return normalizeCellValue(row.shifts[String(column.day)]);
  }

  function setGridValue(row, colIndex, rawValue) {
    const column = getColumnInfo(colIndex);
    if (column.type === "meta") {
      row.sourceType = "manual";
      row.employeeId = "";
      row.employeeSnapshot[column.meta.key] = String(rawValue || "");
      return { previous: null, next: String(rawValue || ""), metaKey: column.meta.key };
    }

    const dayKey = String(column.day);
    const nextValue = normalizeCellValue(rawValue);
    const previous = normalizeCellValue(row.shifts[dayKey]);
    if (nextValue) {
      row.shifts[dayKey] = nextValue;
    } else {
      delete row.shifts[dayKey];
    }
    return { previous: previous, next: nextValue, day: dayKey };
  }

  function renderStaticText() {
    document.title = i18n.t("schedule.pageTitle");
    dom.app.classList.toggle("schedule-app--legend-open", Boolean(state.legendOpen));
    applyLegendScrollLock();
    dom.headerTitle.textContent = i18n.t("home.menu.schedule");
    dom.yearLabel.textContent = i18n.getLocale() === "zh-Hant" ? "年" : i18n.t("schedule.year");
    dom.monthLabel.textContent = i18n.getLocale() === "zh-Hant" ? "月" : i18n.t("schedule.month");
    if (dom.codeLabel) {
      dom.codeLabel.textContent = i18n.getLocale() === "zh-Hant" ? "班碼" : (i18n.getLocale() === "vi" ? "Mã ca" : "Code");
    }
    if (dom.selectionInput) {
      dom.selectionInput.setAttribute("aria-label", i18n.getLocale() === "zh-Hant" ? "輸入班碼" : (i18n.getLocale() === "vi" ? "Nhập mã ca" : "Enter shift code"));
      dom.selectionInput.setAttribute("placeholder", i18n.getLocale() === "zh-Hant" ? "班碼" : (i18n.getLocale() === "vi" ? "Mã ca" : "Code"));
    }
    if (dom.addRowsLabel) {
      dom.addRowsLabel.textContent = i18n.getLocale() === "zh-Hant" ? "新增行" : (i18n.getLocale() === "vi" ? "Thêm hàng" : "Add Rows");
    }
    if (dom.addRowsCount) {
      dom.addRowsCount.setAttribute("aria-label", i18n.getLocale() === "zh-Hant" ? "新增行數" : (i18n.getLocale() === "vi" ? "Số hàng thêm" : "Rows to Add"));
    }
    if (dom.addRowsButton) {
      dom.addRowsButton.setAttribute("aria-label", i18n.getLocale() === "zh-Hant" ? "新增員工列" : (i18n.getLocale() === "vi" ? "Thêm hàng nhân viên" : "Add Employee Rows"));
    }
    if (dom.deleteRowsButton) {
      dom.deleteRowsButton.setAttribute("aria-label", i18n.getLocale() === "zh-Hant" ? "刪除員工列" : (i18n.getLocale() === "vi" ? "Xóa bớt hàng nhân viên" : "Delete Employee Rows"));
    }
    dom.yearSelect.setAttribute("aria-label", i18n.t("schedule.year"));
    dom.monthSelect.setAttribute("aria-label", i18n.t("schedule.month"));
    dom.legendToggle.setAttribute("aria-label", i18n.t("schedule.legend"));
    dom.legendToggle.setAttribute("aria-expanded", String(Boolean(state.legendOpen)));
    dom.legendToggle.textContent = state.legendOpen ? ">>" : "<<";
    dom.legendPanel.setAttribute("aria-label", i18n.t("schedule.legendPanelAria"));
    if (dom.legendTitle) {
      dom.legendTitle.textContent = i18n.t("schedule.legend");
    }
    renderLegendCodeEditToggle();
    renderCornerActions();
    renderCodeDropdown();
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

  function getLegendRemark(code) {
    if (Object.prototype.hasOwnProperty.call(legendRemarks, code)) {
      return String(legendRemarks[code] || "");
    }
    const definition = SHIFT_CODE_MAP[code];
    return definition ? String(definition.remark || "") : "";
  }

  function getLegendCodeLabel(code) {
    if (Object.prototype.hasOwnProperty.call(legendCodeLabels, code)) {
      return String(legendCodeLabels[code] || code);
    }
    return code;
  }

  function refreshScheduleCodeLabels() {
    const monthState = ensureCurrentMonthState();
    renderTableBody(monthState);
    renderDailySummary(monthState);
    renderSelectionState();
    requestFrozenHeaderSync();
  }

  function getLegendCodeEditLabel() {
    if (i18n.getLocale() === "zh-Hant") {
      return uiState.legendCodesEditable ? "鎖定班碼" : "編輯班碼";
    }
    if (i18n.getLocale() === "vi") {
      return uiState.legendCodesEditable ? "Khóa mã" : "Sửa mã";
    }
    return uiState.legendCodesEditable ? "Lock codes" : "Edit codes";
  }

  function renderLegendCodeEditToggle() {
    if (!dom.legendPanel || !dom.legendTitle || !dom.legendTitle.parentElement) {
      return;
    }
    let button = dom.legendPanel.querySelector("[data-legend-code-edit-toggle]");
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "schedule-legend__code-edit-toggle";
      button.setAttribute("data-legend-code-edit-toggle", "true");
      dom.legendTitle.parentElement.appendChild(button);
    }
    const label = getLegendCodeEditLabel();
    button.textContent = label;
    button.setAttribute("aria-label", label);
    button.setAttribute("aria-pressed", String(Boolean(uiState.legendCodesEditable)));
    dom.legendPanel.classList.toggle("is-code-editing", Boolean(uiState.legendCodesEditable));
  }

  function renderCornerActions() {
    dom.app.classList.toggle("schedule-app--schedule-locked", Boolean(uiState.scheduleLocked));
    if (dom.lockButton) {
      const label = uiState.scheduleLocked ? "UNLOCK" : "LOCK";
      dom.lockButton.textContent = label;
      dom.lockButton.setAttribute("aria-label", label);
      dom.lockButton.setAttribute("aria-pressed", String(Boolean(uiState.scheduleLocked)));
      dom.lockButton.classList.toggle("is-active", Boolean(uiState.scheduleLocked));
    }
    if (dom.saveButton) {
      dom.saveButton.textContent = "SAVE";
      dom.saveButton.setAttribute("aria-label", "SAVE");
    }
    if (dom.exportButton) {
      dom.exportButton.textContent = "EXCEL";
      dom.exportButton.setAttribute("aria-label", "Export Excel");
      dom.exportButton.hidden = !uiState.exportReady;
    }
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
    const headCells = dom.legendTable.querySelectorAll(".schedule-legend-table__label-row th");
    headLabels.forEach(function (label, index) {
      if (headCells[index]) {
        headCells[index].textContent = label;
      }
    });
    dom.legendBody.innerHTML = SHIFT_CODE_DEFINITIONS.map(function (item) {
      const label = getLegendCodeLabel(item.code);
      const codeMarkup = uiState.legendCodesEditable
        ? '<input class="schedule-legend-table__code-input" data-legend-code-label="' + escapeHtml(item.code) + '" type="text" value="' + escapeHtml(label) + '" aria-label="' + escapeHtml(i18n.t("schedule.legend.shiftCode") + " " + item.code) + '">'
        : escapeHtml(label);
      return [
        "<tr>",
        '<td class="schedule-legend-table__cell schedule-legend-table__cell--code" data-code-group="' + getCodeGroup(item.code) + '" title="' + escapeHtml(item.code) + '">' + codeMarkup + "</td>",
        '<td class="schedule-legend-table__cell schedule-legend-table__cell--in" title="' + escapeHtml(item.checkIn) + '">' + escapeHtml(item.checkIn) + "</td>",
        '<td class="schedule-legend-table__cell schedule-legend-table__cell--out" title="' + escapeHtml(item.checkOut) + '">' + escapeHtml(item.checkOut) + "</td>",
        '<td class="schedule-legend-table__cell schedule-legend-table__cell--pay" title="' + escapeHtml(item.hoursPay) + '">' + escapeHtml(item.hoursPay) + "</td>",
        '<td class="schedule-legend-table__cell schedule-legend-table__cell--night" title="' + escapeHtml(item.nightHours) + '">' + escapeHtml(item.nightHours) + "</td>",
        '<td class="schedule-legend-table__remark-cell"><input class="schedule-legend-table__remark-input" data-legend-remark="' + escapeHtml(item.code) + '" type="text" value="' + escapeHtml(getLegendRemark(item.code)) + '" placeholder="" aria-label="' + escapeHtml(i18n.t("schedule.legend.remark") + " " + item.code) + '"></td>',
        "</tr>"
      ].join("");
    }).join("");
  }

  function renderAll() {
    const monthState = ensureCurrentMonthState();
    applyColumnWidths();
    dom.yearSelect.value = String(state.selectedYear);
    dom.monthSelect.value = String(state.selectedMonth);
    renderZoom();
    renderTableHead();
    renderTableBody(monthState);
    renderSummary(monthState);
    renderDailySummary(monthState);
    syncSummarySpacerWidth();
    updateStickyMetrics();
    updateSheetOverflowState();
    requestFrozenHeaderSync();
    renderSelectionState();
    renderSelectionMeta();
  }

  function renderTableHead() {
    const labels = META_HEADERS[i18n.getLocale()] || META_HEADERS["zh-Hant"];
    const days = getDaysInMonth(state.selectedYear, state.selectedMonth);
    let dayRow = "<tr>";
    dayRow += '<th class="schedule-table__meta-head schedule-table__meta--id schedule-table__sticky schedule-table__sticky--id">' + escapeHtml(labels[0]) + renderColumnResizer("id") + "</th>";
    dayRow += '<th class="schedule-table__meta-head schedule-table__meta--department schedule-table__sticky schedule-table__sticky--department">' + escapeHtml(labels[1]) + renderColumnResizer("dept") + "</th>";
    dayRow += '<th class="schedule-table__meta-head schedule-table__meta--vie schedule-table__sticky schedule-table__sticky--vie">' + escapeHtml(labels[2]) + renderColumnResizer("vie") + "</th>";
    dayRow += '<th class="schedule-table__meta-head schedule-table__meta--eng schedule-table__sticky schedule-table__sticky--eng">' + escapeHtml(labels[3]) + renderColumnResizer("eng") + "</th>";
    dayRow += '<th class="schedule-table__meta-head schedule-table__meta--position schedule-table__sticky schedule-table__sticky--position">' + escapeHtml(labels[4]) + renderColumnResizer("position") + "</th>";

    let weekdayRow = "<tr>";
    weekdayRow += '<th class="schedule-table__meta-subhead schedule-table__meta--id schedule-table__sticky schedule-table__sticky--id"></th>';
    weekdayRow += '<th class="schedule-table__meta-subhead schedule-table__meta--department schedule-table__sticky schedule-table__sticky--department"></th>';
    weekdayRow += '<th class="schedule-table__meta-subhead schedule-table__meta--vie schedule-table__sticky schedule-table__sticky--vie"></th>';
    weekdayRow += '<th class="schedule-table__meta-subhead schedule-table__meta--eng schedule-table__sticky schedule-table__sticky--eng"></th>';
    weekdayRow += '<th class="schedule-table__meta-subhead schedule-table__meta--position schedule-table__sticky schedule-table__sticky--position"></th>';
    for (let day = 1; day <= days; day += 1) {
      dayRow += '<th class="schedule-table__day-head" data-day-head="' + day + '">' + day + renderColumnResizer("day") + "</th>";
      weekdayRow += '<th class="schedule-table__weekday-head">' + escapeHtml(getWeekdayLabel(state.selectedYear, state.selectedMonth, day)) + "</th>";
    }
    const headMarkup = dayRow + "</tr>" + weekdayRow + "</tr>";
    dom.tableHead.innerHTML = headMarkup;
    if (dom.frozenTableHead) {
      dom.frozenTableHead.innerHTML = headMarkup;
    }
  }

  function renderTableBody(monthState) {
    const days = getDaysInMonth(state.selectedYear, state.selectedMonth);
    const bodyRows = monthState.rows.map(function (row, rowIndex) {
      const snapshot = row.employeeSnapshot;
      let html = '<tr class="schedule-table__body-row" data-row-id="' + escapeHtml(row.id) + '" data-row-index="' + rowIndex + '">';
      html += '<td class="schedule-table__meta schedule-table__sticky schedule-table__sticky--id"><div class="schedule-meta-wrap schedule-meta-wrap--id"><button type="button" class="schedule-row-handle" data-row-handle="' + escapeHtml(row.id) + '" draggable="true" aria-label="Reorder">•••</button><button type="button" class="schedule-meta-cell" data-grid-cell="true" data-row-index="' + rowIndex + '" data-col-index="0">' + escapeHtml(snapshot.ydiId) + '</button></div></td>';
      html += '<td class="schedule-table__meta schedule-table__sticky schedule-table__sticky--department"><div class="schedule-meta-wrap"><button type="button" class="schedule-meta-cell" data-grid-cell="true" data-row-index="' + rowIndex + '" data-col-index="1">' + escapeHtml(snapshot.department) + '</button></div></td>';
      html += '<td class="schedule-table__meta schedule-table__sticky schedule-table__sticky--vie"><div class="schedule-meta-wrap"><button type="button" class="schedule-meta-cell" data-grid-cell="true" data-row-index="' + rowIndex + '" data-col-index="2">' + escapeHtml(snapshot.vieName) + '</button></div></td>';
      html += '<td class="schedule-table__meta schedule-table__sticky schedule-table__sticky--eng"><div class="schedule-meta-wrap"><button type="button" class="schedule-meta-cell" data-grid-cell="true" data-row-index="' + rowIndex + '" data-col-index="3">' + escapeHtml(snapshot.engName) + '</button></div></td>';
      html += '<td class="schedule-table__meta schedule-table__sticky schedule-table__sticky--position"><div class="schedule-meta-wrap"><button type="button" class="schedule-meta-cell" data-grid-cell="true" data-row-index="' + rowIndex + '" data-col-index="4">' + escapeHtml(snapshot.position) + '</button></div></td>';
      for (let day = 1; day <= days; day += 1) {
        const code = normalizeCellValue(row.shifts[String(day)]);
        html += '<td class="schedule-table__cell"><button type="button" class="schedule-cell" data-grid-cell="true" data-schedule-cell="true" data-row-index="' + rowIndex + '" data-col-index="' + (META_COLUMNS.length + day - 1) + '" data-day="' + day + '" data-code-group="' + escapeHtml(getCodeGroup(code)) + '">' + renderCellValue(code) + '</button></td>';
      }
      return html + '</tr>';
    }).join("");

    dom.tableBody.innerHTML = bodyRows;
  }

  function renderSummary(monthState) {
    const headMarkup = [
      '<tr class="schedule-summary-table__spacer"><th class="schedule-summary-table__blank" colspan="' + SUMMARY_FIELDS.length + '"></th></tr>',
      '<tr class="schedule-summary-table__labels">',
      SUMMARY_FIELDS.map(function (field) {
        return "<th>" + escapeHtml(getFixedFieldLabel(field)) + "</th>";
      }).join(""),
      "</tr>"
    ].join("");

    dom.summaryHead.innerHTML = headMarkup;
    if (dom.frozenSummaryHead) {
      dom.frozenSummaryHead.innerHTML = headMarkup;
    }

    const summaryRows = monthState.rows.map(function (row, rowIndex) {
      const summary = getRowSummary(row);
      return [
        '<tr data-summary-row-index="' + rowIndex + '">',
        SUMMARY_FIELDS.map(function (field) {
          return '<td data-summary-row-index="' + rowIndex + '" data-summary-field="' + field.id + '">' + escapeHtml(summary[field.id]) + "</td>";
        }).join(""),
        "</tr>"
      ].join("");
    }).join("");

    dom.summaryBody.innerHTML = summaryRows;
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
      if (dom.dailySpacerHead) {
        dom.dailySpacerHead.innerHTML = "";
      }
      if (dom.dailySpacerBody) {
        dom.dailySpacerBody.innerHTML = "";
      }
      return;
    }

    dom.dailySection.hidden = false;
    let head = "<tr>";
    head += '<th class="schedule-daily-table__blank schedule-daily-table__spacer--id schedule-daily-table__sticky schedule-daily-table__sticky--id"></th>';
    head += '<th class="schedule-daily-table__blank schedule-daily-table__spacer--department schedule-daily-table__sticky schedule-daily-table__sticky--department"></th>';
    head += '<th class="schedule-daily-table__blank schedule-daily-table__spacer--vie schedule-daily-table__sticky schedule-daily-table__sticky--vie"></th>';
    head += '<th class="schedule-daily-table__blank schedule-daily-table__spacer--eng schedule-daily-table__sticky schedule-daily-table__sticky--eng"></th>';
    head += '<th class="schedule-daily-table__spacer--position schedule-daily-table__sticky schedule-daily-table__sticky--position">' + escapeHtml(i18n.t("schedule.dailyCode")) + "</th>";
    for (let day = 1; day <= days; day += 1) {
      head += '<th data-daily-day-head="' + day + '">' + day + "</th>";
    }
    dom.dailyHead.innerHTML = head + "</tr>";
    if (dom.dailySpacerHead) {
      dom.dailySpacerHead.innerHTML = "<tr>" + SUMMARY_FIELDS.map(function () {
        return '<th class="schedule-daily-spacer-table__blank"></th>';
      }).join("") + "</tr>";
    }

    dom.dailyBody.innerHTML = activeCodes.map(function (code) {
      let row = '<tr data-daily-code-row="' + escapeHtml(code) + '">';
      row += '<td class="schedule-daily-table__blank schedule-daily-table__spacer--id schedule-daily-table__sticky schedule-daily-table__sticky--id"></td>';
      row += '<td class="schedule-daily-table__blank schedule-daily-table__spacer--department schedule-daily-table__sticky schedule-daily-table__sticky--department"></td>';
      row += '<td class="schedule-daily-table__blank schedule-daily-table__spacer--vie schedule-daily-table__sticky schedule-daily-table__sticky--vie"></td>';
      row += '<td class="schedule-daily-table__blank schedule-daily-table__spacer--eng schedule-daily-table__sticky schedule-daily-table__sticky--eng"></td>';
      row += '<td class="schedule-daily-table__spacer--position schedule-daily-table__sticky schedule-daily-table__sticky--position">' + escapeHtml(getLegendCodeLabel(code)) + "</td>";
      for (let day = 1; day <= days; day += 1) {
        row += '<td data-daily-code="' + escapeHtml(code) + '" data-daily-day="' + day + '">' + getDailyCount(monthState.rows, code, day) + "</td>";
      }
      return row + "</tr>";
    }).join("");
    if (dom.dailySpacerBody) {
      dom.dailySpacerBody.innerHTML = activeCodes.map(function () {
        return "<tr>" + SUMMARY_FIELDS.map(function () {
          return '<td class="schedule-daily-spacer-table__blank"></td>';
        }).join("") + "</tr>";
      }).join("");
    }
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
    if (dom.addRowsButton) {
      dom.addRowsButton.addEventListener("click", handleAddRows);
    }
    if (dom.deleteRowsButton) {
      dom.deleteRowsButton.addEventListener("click", handleDeleteRows);
    }
    if (dom.lockButton) {
      dom.lockButton.addEventListener("click", toggleScheduleLock);
    }
    if (dom.saveButton) {
      dom.saveButton.addEventListener("click", handleManualSave);
    }
    if (dom.exportButton) {
      dom.exportButton.addEventListener("click", exportCurrentMonthExcel);
    }
    if (dom.addRowsCount) {
      dom.addRowsCount.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          handleAddRows();
        }
      });
    }
    dom.legendToggle.addEventListener("click", function () {
      state.legendOpen = !state.legendOpen;
      saveState();
      renderStaticText();
      window.requestAnimationFrame(function () {
        updateStickyMetrics();
        updateSheetOverflowState();
      });
      window.setTimeout(function () {
        updateStickyMetrics();
        updateSheetOverflowState();
      }, 220);
    });
    if (dom.legendBody) {
      dom.legendBody.addEventListener("input", function (event) {
        const codeInput = event.target.closest("[data-legend-code-label]");
        if (codeInput) {
          const code = codeInput.getAttribute("data-legend-code-label");
          const value = String(codeInput.value || "").trim();
          if (value && value !== code) {
            legendCodeLabels[code] = value;
          } else {
            delete legendCodeLabels[code];
          }
          saveLegendCodeLabels();
          refreshScheduleCodeLabels();
          return;
        }
        const input = event.target.closest("[data-legend-remark]");
        if (!input) {
          return;
        }
        legendRemarks[input.getAttribute("data-legend-remark")] = input.value;
        saveLegendRemarks();
      });
    }
    if (dom.legendPanel) {
      dom.legendPanel.addEventListener("click", function (event) {
        const toggle = event.target.closest("[data-legend-code-edit-toggle]");
        if (!toggle) {
          return;
        }
        event.preventDefault();
        uiState.legendCodesEditable = !uiState.legendCodesEditable;
        renderLegendCodeEditToggle();
        buildLegendTable();
      });
    }
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
      renderStaticText();
      renderLocaleControl();
      buildLegendTable();
      renderAll();
    });
    document.addEventListener("click", function (event) {
      if (uiState.localeMenuOpen && dom.localeMount && !dom.localeMount.contains(event.target)) {
        uiState.localeMenuOpen = false;
        renderLocaleControl();
      }
      if (uiState.codeDropdownOpen && dom.codeDropdown && !dom.codeDropdown.contains(event.target) && event.target !== dom.selectionInput) {
        hideCodeDropdown();
      }
    });
    dom.selectionInput.addEventListener("input", function () {
      dom.selectionInput.value = normalizeCellValue(dom.selectionInput.value);
      uiState.codeDropdownOpen = true;
      uiState.codeDropdownIndex = -1;
      renderCodeDropdown();
    });
    dom.selectionInput.addEventListener("keydown", function (event) {
      if (handleCodeDropdownKeydown(event)) {
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        hideCodeDropdown();
        applySelectionInput();
      }
    });
    dom.selectionInput.addEventListener("click", function () {
      uiState.codeDropdownOpen = true;
      uiState.codeDropdownIndex = -1;
      renderCodeDropdown();
    });
    dom.selectionInput.addEventListener("blur", function () {
      window.setTimeout(hideCodeDropdown, 120);
    });
    if (dom.codeDropdown) {
      dom.codeDropdown.addEventListener("mousedown", function (event) {
        event.preventDefault();
      });
      dom.codeDropdown.addEventListener("click", function (event) {
        const option = event.target.closest("[data-shift-suggestion]");
        if (!option) {
          return;
        }
        dom.selectionInput.value = option.getAttribute("data-shift-suggestion") || "";
        uiState.codeDropdownIndex = -1;
        hideCodeDropdown();
        focusSelectionInput();
      });
    }
    if (dom.legendPanel && dom.legendContent) {
      dom.legendPanel.addEventListener("wheel", function (event) {
        if (!state.legendOpen) {
          return;
        }

        if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        dom.legendContent.scrollTop += event.deltaY;
      }, { passive: false });
    }
    dom.sheetScroll.addEventListener("wheel", function (event) {
      if (!event.ctrlKey) {
        if (state.legendOpen) {
          event.preventDefault();
          return;
        }
        return;
      }
      event.preventDefault();
      adjustZoom(event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP);
    }, { passive: false });
    [dom.header, dom.periodBar, dom.frozenLayer].forEach(function (surface) {
      if (!surface) {
        return;
      }
      surface.addEventListener("wheel", handleLockedSurfaceWheel, { passive: false });
    });
    dom.tableBody.addEventListener("mousedown", handleCellPointerStart);
    dom.tableBody.addEventListener("mouseover", handleCellPointerMove);
    dom.tableHead.addEventListener("mousedown", handleResizePointerStart);
    dom.tableHead.addEventListener("dblclick", handleResizeAutoFit);
    if (dom.frozenTableHead) {
      dom.frozenTableHead.addEventListener("mousedown", handleResizePointerStart);
      dom.frozenTableHead.addEventListener("dblclick", handleResizeAutoFit);
    }
    document.addEventListener("mousemove", handleResizePointerMove);
    document.addEventListener("mouseup", function () {
      uiState.isSelecting = false;
      if (uiState.columnResize) {
        saveState();
        updateSheetOverflowState();
      }
      uiState.columnResize = null;
    });
    dom.tableBody.addEventListener("dragstart", handleDragStart);
    dom.tableBody.addEventListener("dragover", handleDragOver);
    dom.tableBody.addEventListener("drop", handleDrop);
    dom.tableBody.addEventListener("dragend", clearDragState);
    dom.sheetScroll.addEventListener("scroll", requestFrozenHeaderSync, { passive: true });
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    window.addEventListener("keydown", handleGlobalKeydown);
    window.addEventListener("resize", updateStickyMetrics, { passive: true });
    window.addEventListener("resize", updateSheetOverflowState, { passive: true });
  }

  function observeStickyMetrics() {
    if (typeof ResizeObserver === "function" && !uiState.stickyMetricsObserver) {
      uiState.stickyMetricsObserver = new ResizeObserver(function () {
        updateStickyMetrics();
        updateSheetOverflowState();
      });
      [
        dom.header,
        dom.periodBar,
        dom.sheetFrame,
        dom.tableHead,
        dom.summaryHead
      ].forEach(function (target) {
        if (target) {
          uiState.stickyMetricsObserver.observe(target);
        }
      });
    }

    if (document.fonts && typeof document.fonts.ready?.then === "function") {
      document.fonts.ready.then(function () {
        window.requestAnimationFrame(function () {
          updateStickyMetrics();
          updateSheetOverflowState();
        });
      }).catch(function () {
        updateStickyMetrics();
      });
    }

    if (document.fonts && typeof document.fonts.addEventListener === "function") {
      const refreshStickyMetrics = function () {
        window.requestAnimationFrame(function () {
          updateStickyMetrics();
          updateSheetOverflowState();
        });
      };
      document.fonts.addEventListener("loadingdone", refreshStickyMetrics);
      document.fonts.addEventListener("loadingerror", refreshStickyMetrics);
    }
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

  function getLockedFeedback() {
    if (i18n.getLocale() === "vi") {
      return "Bang lich dang khoa.";
    }
    if (i18n.getLocale() === "zh-Hant") {
      return "Schedule locked.";
    }
    return "Schedule locked.";
  }

  function toggleScheduleLock() {
    uiState.scheduleLocked = !uiState.scheduleLocked;
    if (uiState.scheduleLocked) {
      clearSelection(true);
    }
    renderCornerActions();
    showFeedback(uiState.scheduleLocked ? getLockedFeedback() : "Schedule unlocked.", uiState.scheduleLocked ? "error" : "success");
  }

  function handleManualSave() {
    saveState();
    saveLegendRemarks();
    saveLegendCodeLabels();
    uiState.exportReady = true;
    renderCornerActions();
    showFeedback("Saved. Excel export is ready.", "success");
  }

  function exportCurrentMonthExcel() {
    if (!uiState.exportReady) {
      return;
    }
    const html = buildCurrentMonthExcelHtml();
    const blob = new Blob(["\ufeff", html], { type: "application/vnd.ms-excel;charset=utf-8" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = "schedule_" + state.selectedYear + "_" + String(state.selectedMonth).padStart(2, "0") + ".xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
    showFeedback("Excel file exported.", "success");
  }

  function buildCurrentMonthExcelHtml() {
    const monthState = ensureCurrentMonthState();
    const metaLabels = META_HEADERS[i18n.getLocale()] || META_HEADERS["zh-Hant"];
    const days = getDaysInMonth(state.selectedYear, state.selectedMonth);
    const headers = metaLabels.concat(Array.from({ length: days }, function (_, index) {
      const day = index + 1;
      return String(day) + " " + getWeekdayLabel(state.selectedYear, state.selectedMonth, day);
    })).concat(SUMMARY_FIELDS.map(getFixedFieldLabel));
    const rows = monthState.rows.map(function (row) {
      const summary = getRowSummary(row, days);
      return META_COLUMNS.map(function (column) {
        return row.employeeSnapshot[column.key] || "";
      }).concat(Array.from({ length: days }, function (_, index) {
        return getLegendCodeLabel(normalizeCellValue(row.shifts[String(index + 1)]));
      })).concat(SUMMARY_FIELDS.map(function (field) {
        return summary[field.id];
      }));
    });

    return [
      '<html><head><meta charset="UTF-8"></head><body>',
      '<table border="1">',
      '<thead><tr>' + headers.map(function (header) { return "<th>" + escapeHtml(header) + "</th>"; }).join("") + '</tr></thead>',
      '<tbody>' + rows.map(function (row) {
        return "<tr>" + row.map(function (cell) { return "<td>" + escapeHtml(cell) + "</td>"; }).join("") + "</tr>";
      }).join("") + '</tbody>',
      '</table>',
      '</body></html>'
    ].join("");
  }

  function handleCellPointerStart(event) {
    if (uiState.scheduleLocked) {
      event.preventDefault();
      showFeedback(getLockedFeedback(), "error");
      return;
    }
    if (event.target.closest("[data-row-handle]")) {
      return;
    }
    const cell = event.target.closest("[data-grid-cell]");
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
    if (uiState.scheduleLocked) {
      return;
    }
    if (!uiState.isSelecting || !uiState.anchor) {
      return;
    }
    const cell = event.target.closest("[data-grid-cell]");
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
      updateStickyMetrics();
      updateSheetOverflowState();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && key.toLowerCase() === "c") {
      event.preventDefault();
      copySelectionToClipboard();
      return;
    }
    if (document.activeElement === dom.selectionInput && !event.ctrlKey && !event.metaKey) {
      if (key === "Escape") {
        event.preventDefault();
        clearSelection(true);
        return;
      }
      if (key === "Delete") {
        event.preventDefault();
        clearSelectedCells();
        return;
      }
      if (key === "Backspace" && !dom.selectionInput.value) {
        event.preventDefault();
        clearSelectedCells();
      }
      return;
    }
    if (!uiState.selection) {
      return;
    }
    if (!event.ctrlKey && !event.metaKey && !event.altKey && key === "Backspace" && document.activeElement !== dom.selectionInput && dom.selectionInput.value) {
      event.preventDefault();
      dom.selectionInput.value = dom.selectionInput.value.slice(0, -1);
      uiState.codeDropdownOpen = true;
      uiState.codeDropdownIndex = -1;
      renderCodeDropdown();
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
      uiState.codeDropdownOpen = true;
      uiState.codeDropdownIndex = -1;
      renderCodeDropdown();
      return;
    }
    if (key === "Enter" && document.activeElement !== dom.selectionInput) {
      event.preventDefault();
      hideCodeDropdown();
      applySelectionInput();
    }
  }

  function handleDragStart(event) {
    if (uiState.scheduleLocked) {
      event.preventDefault();
      showFeedback(getLockedFeedback(), "error");
      return;
    }
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
      startCol: Math.min(start.colIndex, end.colIndex),
      endCol: Math.max(start.colIndex, end.colIndex)
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
      hideCodeDropdown();
    }
    renderSelectionState();
    renderSelectionMeta();
  }

  function renderSelectionState() {
    Array.prototype.forEach.call(dom.tableBody.querySelectorAll("[data-grid-cell]"), function (cell) {
      const point = getCellPoint(cell);
      cell.classList.toggle("is-selected", isCellSelected(point.rowIndex, point.colIndex));
    });
  }

  function renderSelectionMeta() {
    dom.selectionMeta.textContent = uiState.selection
      ? i18n.t("schedule.selection.summary", getSelectionStats())
      : i18n.t("schedule.selection.none");
    if (dom.selectionInput) {
      dom.selectionInput.classList.toggle("is-active", Boolean(uiState.selection));
    }
  }

  function isCellSelected(rowIndex, day) {
    return Boolean(uiState.selection) &&
      rowIndex >= uiState.selection.startRow &&
      rowIndex <= uiState.selection.endRow &&
      day >= uiState.selection.startCol &&
      day <= uiState.selection.endCol;
  }

  function getSelectionStats() {
    const rows = uiState.selection.endRow - uiState.selection.startRow + 1;
    const cols = uiState.selection.endCol - uiState.selection.startCol + 1;
    return { rows: rows, days: cols, cells: rows * cols };
  }

  function getSelectedPoints() {
    const cells = [];
    if (!uiState.selection) {
      return cells;
    }
    for (let rowIndex = uiState.selection.startRow; rowIndex <= uiState.selection.endRow; rowIndex += 1) {
      for (let colIndex = uiState.selection.startCol; colIndex <= uiState.selection.endCol; colIndex += 1) {
        cells.push({ rowIndex: rowIndex, colIndex: colIndex });
      }
    }
    return cells;
  }

  function getSelectedSchedulePoints() {
    return getSelectedPoints().filter(function (point) {
      return getColumnInfo(point.colIndex).type === "schedule";
    });
  }

  function applySelectionInput() {
    if (uiState.scheduleLocked) {
      showFeedback(getLockedFeedback(), "error");
      return;
    }
    applyCodeToSelection(normalizeCellValue(dom.selectionInput.value));
  }

  function clearSelectedCells() {
    if (uiState.scheduleLocked) {
      showFeedback(getLockedFeedback(), "error");
      return;
    }
    if (!uiState.selection) {
      showFeedback(i18n.t("schedule.feedback.selectClear"), "error");
      return;
    }
    applyPasteMatrix([[""]], true);
  }

  function applyCodeToSelection(code, clearing) {
    if (uiState.scheduleLocked) {
      showFeedback(getLockedFeedback(), "error");
      return;
    }
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
    if (!getSelectedSchedulePoints().length) {
      showFeedback(i18n.getLocale() === "zh-Hant" ? "目前選取的是員工資訊欄，請改用貼上或選取排班欄。" : (i18n.getLocale() === "vi" ? "Đang chọn cột thông tin nhân viên, hãy dùng dán hoặc chọn ô ca làm." : "The current selection is employee info. Paste there or select schedule cells."), "error");
      return;
    }
    const monthState = ensureCurrentMonthState();
    const changes = [];
    getSelectedSchedulePoints().forEach(function (point) {
      const row = monthState.rows[point.rowIndex];
      if (!row) {
        return;
      }
      const dayKey = String(getColumnInfo(point.colIndex).day);
      const previous = normalizeCellValue(row.shifts[dayKey]);
      if (previous === code) {
        return;
      }
      changes.push({ rowId: row.id, kind: "schedule", day: dayKey, previous: previous });
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

  function buildSelectionMatrix() {
    const monthState = ensureCurrentMonthState();
    const rows = [];
    if (!uiState.selection) {
      return rows;
    }
    for (let rowIndex = uiState.selection.startRow; rowIndex <= uiState.selection.endRow; rowIndex += 1) {
      const row = monthState.rows[rowIndex];
      const line = [];
      for (let colIndex = uiState.selection.startCol; colIndex <= uiState.selection.endCol; colIndex += 1) {
        line.push(row ? getGridValue(row, colIndex) : "");
      }
      rows.push(line);
    }
    return rows;
  }

  function copySelectionToClipboard() {
    if (!uiState.selection) {
      return;
    }
    const text = buildSelectionMatrix().map(function (line) {
      return line.join("\t");
    }).join("\n");
    if (!text) {
      return;
    }
    uiState.copiedText = text;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showFeedback(i18n.getLocale() === "zh-Hant" ? "已複製選取內容。" : (i18n.getLocale() === "vi" ? "Đã sao chép vùng chọn." : "Selection copied."), "success");
      }).catch(function () {
        showFeedback(i18n.getLocale() === "zh-Hant" ? "已複製選取內容。" : (i18n.getLocale() === "vi" ? "Đã sao chép vùng chọn." : "Selection copied."), "success");
      });
      return;
    }
    showFeedback(i18n.getLocale() === "zh-Hant" ? "已複製選取內容。" : (i18n.getLocale() === "vi" ? "Đã sao chép vùng chọn." : "Selection copied."), "success");
  }

  function handleCopy(event) {
    if (!uiState.selection) {
      return;
    }
    const target = event.target;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
      return;
    }
    const text = buildSelectionMatrix().map(function (line) {
      return line.join("\t");
    }).join("\n");
    if (!text) {
      return;
    }
    uiState.copiedText = text;
    event.preventDefault();
    event.clipboardData.setData("text/plain", text);
  }

  function handlePaste(event) {
    if (uiState.scheduleLocked) {
      return;
    }
    if (!uiState.selection) {
      return;
    }
    const target = event.target;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
      return;
    }
    const text = event.clipboardData ? event.clipboardData.getData("text/plain") : "";
    const fallbackText = !text && uiState.copiedText ? uiState.copiedText : "";
    const nextText = text || fallbackText;
    if (!nextText) {
      return;
    }
    event.preventDefault();
    applyPasteMatrix(parseClipboardMatrix(nextText));
  }

  function parseClipboardMatrix(text) {
    return String(text || "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n")
      .filter(function (line, index, list) {
        return line.length || index < list.length - 1;
      })
      .map(function (line) {
        return line.split("\t");
      });
  }

  function ensureRowsForPaste(requiredRowCount) {
    const monthState = ensureCurrentMonthState();
    while (monthState.rows.length < requiredRowCount) {
      monthState.rows.push(createManualRow());
    }
    return monthState;
  }

  function applyPasteMatrix(matrix, clearingOnly) {
    if (uiState.scheduleLocked) {
      showFeedback(getLockedFeedback(), "error");
      return;
    }
    if (!uiState.selection || !matrix.length || !matrix[0].length) {
      return;
    }
    const fillSelection = matrix.length === 1 && matrix[0].length === 1;
    const requiredRowCount = fillSelection
      ? uiState.selection.endRow + 1
      : Math.max(uiState.selection.endRow + 1, uiState.selection.startRow + matrix.length);
    const monthState = ensureRowsForPaste(requiredRowCount);
    const changes = [];
    const invalidCodes = [];

    const rowLimit = fillSelection ? uiState.selection.endRow : Math.min(monthState.rows.length - 1, uiState.selection.startRow + matrix.length - 1);
    const colLimit = fillSelection ? uiState.selection.endCol : Math.min(getVisibleColumnCount() - 1, uiState.selection.startCol + matrix[0].length - 1);

    for (let rowIndex = uiState.selection.startRow; rowIndex <= rowLimit; rowIndex += 1) {
      for (let colIndex = uiState.selection.startCol; colIndex <= colLimit; colIndex += 1) {
        const row = monthState.rows[rowIndex];
        const incoming = fillSelection ? matrix[0][0] : (matrix[rowIndex - uiState.selection.startRow][colIndex - uiState.selection.startCol] || "");
        const column = getColumnInfo(colIndex);
        const nextValue = column.type === "schedule" ? normalizeCellValue(incoming) : String(incoming || "").trim();

        if (column.type === "schedule" && nextValue && !SHIFT_CODE_MAP[nextValue]) {
          invalidCodes.push(nextValue);
          continue;
        }

        const previous = getGridValue(row, colIndex);
        if (previous === nextValue) {
          continue;
        }

        const change = { rowId: row.id, colIndex: colIndex, kind: column.type, previous: previous, next: nextValue };
        if (column.type === "schedule") {
          change.day = String(column.day);
        } else {
          change.metaKey = column.meta.key;
        }
        changes.push(change);
      }
    }

    if (invalidCodes.length) {
      showFeedback((i18n.getLocale() === "zh-Hant"
        ? "貼上的班碼含有未定義值: "
        : (i18n.getLocale() === "vi" ? "Có mã ca không hợp lệ trong nội dung dán: " : "Pasted data contains invalid shift codes: "))
        + invalidCodes.filter(uniqueOnly).join(", "), "error");
      return;
    }

    if (!changes.length) {
      showFeedback(i18n.t("schedule.feedback.noChanges"), "error");
      return;
    }

    changes.forEach(function (change) {
      const row = monthState.rows.find(function (item) { return item.id === change.rowId; });
      setGridValue(row, change.colIndex, change.next);
    });

    uiState.history.push({ monthKey: getCurrentMonthKey(), changes: changes });
    saveState();
    renderAll();
    showFeedback(clearingOnly
      ? i18n.t("schedule.feedback.cleared")
      : (i18n.getLocale() === "zh-Hant" ? "已貼上選取內容。" : (i18n.getLocale() === "vi" ? "Đã dán vào vùng chọn." : "Pasted into selection.")), "success");
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
      if (change.kind === "meta") {
        row.employeeSnapshot[change.metaKey] = String(change.previous || "");
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
    updateStickyMetrics();
    updateSheetOverflowState();
  }

  function renderZoom() {
    dom.sheetZoom.style.zoom = String(state.zoomLevel);
    if (dom.frozenZoom) {
      dom.frozenZoom.style.zoom = String(state.zoomLevel);
    }
  }

  function updateSheetOverflowState() {
    if (!dom.sheetScroll) {
      return;
    }
    const hasHorizontalOverflow = dom.sheetScroll.scrollWidth > dom.sheetScroll.clientWidth + 1;
    const isShiftedHorizontally = dom.sheetScroll.scrollLeft > 1;
    dom.sheetScroll.classList.toggle("schedule-sheet-scroll--fit", !hasHorizontalOverflow);
    [dom.workspace, dom.app].forEach(function (target) {
      if (!target) {
        return;
      }
      target.classList.toggle("schedule-sheet--x-shifted", isShiftedHorizontally);
    });
  }

  function handleLockedSurfaceWheel(event) {
    if (event.ctrlKey) {
      return;
    }
    event.preventDefault();
    if (state.legendOpen) {
      return;
    }
    if (!dom.sheetScroll) {
      return;
    }
    if (Math.abs(event.deltaY) >= Math.abs(event.deltaX)) {
      dom.sheetScroll.scrollTop += event.deltaY;
      return;
    }
    dom.sheetScroll.scrollLeft += event.deltaX;
  }

  function applyLegendScrollLock() {
    const body = document.body;
    if (!body) {
      return;
    }

    if (state.legendOpen) {
      if (uiState.lockedScrollY === null) {
        uiState.lockedScrollY = Math.round(window.scrollY || window.pageYOffset || 0);
      }
      body.classList.add("edit-page--legend-lock");
      body.style.top = "-" + String(uiState.lockedScrollY) + "px";
      return;
    }

    const shouldRestore = body.classList.contains("edit-page--legend-lock");
    const restoreY = uiState.lockedScrollY === null ? 0 : uiState.lockedScrollY;
    body.classList.remove("edit-page--legend-lock");
    body.style.removeProperty("top");
    uiState.lockedScrollY = null;
    if (shouldRestore) {
      window.scrollTo(0, restoreY);
    }
  }

  function measureHeaderRowHeights(head) {
    if (!head) {
      return [];
    }
    return Array.from(head.querySelectorAll("tr"))
      .map(function (row) {
        const nextHeight = Math.ceil(row.getBoundingClientRect().height || 0);
        return Math.min(48, Math.max(0, nextHeight));
      })
      .filter(function (value) {
        return value > 0;
      });
  }

  function withDefaultHeaderVars(measure) {
    const targets = [dom.workspace, dom.app].filter(Boolean);
    const previous = targets.map(function (target) {
      return {
        target: target,
        row: target.style.getPropertyValue("--schedule-table-head-row"),
        band: target.style.getPropertyValue("--schedule-frozen-band-height")
      };
    });

    targets.forEach(function (target) {
      target.style.removeProperty("--schedule-table-head-row");
      target.style.removeProperty("--schedule-frozen-band-height");
    });

    try {
      return measure();
    } finally {
      previous.forEach(function (entry) {
        if (entry.row) {
          entry.target.style.setProperty("--schedule-table-head-row", entry.row);
        } else {
          entry.target.style.removeProperty("--schedule-table-head-row");
        }

        if (entry.band) {
          entry.target.style.setProperty("--schedule-frozen-band-height", entry.band);
        } else {
          entry.target.style.removeProperty("--schedule-frozen-band-height");
        }
      });
    }
  }

  function updateStickyMetrics() {
      const headerHeight = dom.header ? Math.round(dom.header.getBoundingClientRect().height) : 56;
      const periodHeight = dom.periodBar ? Math.round(dom.periodBar.getBoundingClientRect().height) : 52;
      const naturalMetrics = withDefaultHeaderVars(function () {
        const tableRowHeights = measureHeaderRowHeights(dom.tableHead);
        const summaryRowHeights = measureHeaderRowHeights(dom.summaryHead);
        const rowCount = Math.max(2, tableRowHeights.length || 0, summaryRowHeights.length || 0);
        const tableRowsSum = tableRowHeights.reduce(function (sum, value) { return sum + value; }, 0);
        const summaryRowsSum = summaryRowHeights.reduce(function (sum, value) { return sum + value; }, 0);
        const rawTableHeadHeight = dom.tableHead ? Math.ceil(dom.tableHead.getBoundingClientRect().height || 0) : 0;
        const rawSummaryHeadHeight = dom.summaryHead ? Math.ceil(dom.summaryHead.getBoundingClientRect().height || 0) : 0;
        const measuredBandHeight = Math.max(
          rowCount * 24,
          Math.min(120, Math.max(0, rawTableHeadHeight)),
          Math.min(120, Math.max(0, rawSummaryHeadHeight)),
          tableRowsSum,
          summaryRowsSum
        );

        return {
          rowCount: rowCount,
          frozenBandHeight: measuredBandHeight,
          rowHeight: Math.max(24, Math.ceil(measuredBandHeight / rowCount))
        };
      });
      const rowHeight = naturalMetrics.rowHeight;
      const frozenBandHeight = naturalMetrics.frozenBandHeight;
      const tableRect = dom.table ? dom.table.getBoundingClientRect() : null;
      const frameRect = dom.sheetFrame ? dom.sheetFrame.getBoundingClientRect() : null;
      const frozenHeadRect = dom.frozenTableHead ? dom.frozenTableHead.getBoundingClientRect() : null;
      const frozenDayHeadRect = dom.frozenTableHead && dom.frozenTableHead.querySelector("[data-day-head]")
        ? dom.frozenTableHead.querySelector("[data-day-head]").getBoundingClientRect()
        : null;
      const periodGridRect = dom.periodGrid ? dom.periodGrid.getBoundingClientRect() : null;
      const minimumTop = headerHeight + periodHeight;
      const minimumLegendHeight = 320;
      const legendTop = frozenDayHeadRect && frozenDayHeadRect.height > 0
        ? Math.max(minimumTop, Math.round(frozenDayHeadRect.top))
        : frozenHeadRect && frozenHeadRect.height > 0
        ? Math.max(minimumTop, Math.round(frozenHeadRect.top))
        : frameRect
        ? Math.max(minimumTop, Math.round(frameRect.top))
        : tableRect
        ? Math.max(minimumTop, Math.round(tableRect.top))
        : minimumTop;
      const legendRight = frameRect
        ? Math.max(0, Math.round(window.innerWidth - frameRect.right))
        : 8;
      const computedLegendBottom = frameRect
        ? Math.max(0, Math.round(window.innerHeight - frameRect.bottom))
        : 8;
      const legendBottom = Math.min(
        computedLegendBottom,
        Math.max(8, window.innerHeight - legendTop - minimumLegendHeight)
      );
      const legendLeft = periodGridRect
        ? Math.max(16, Math.round(periodGridRect.right + 12))
        : Math.max(16, Math.round(window.innerWidth * 0.58));
      [dom.workspace, dom.app].forEach(function (target) {
        if (!target) {
          return;
        }
        target.style.setProperty("--schedule-header-height", String(headerHeight) + "px");
        target.style.setProperty("--schedule-period-height", String(periodHeight) + "px");
        target.style.setProperty("--schedule-sheet-sticky-top", String(headerHeight + periodHeight) + "px");
        target.style.setProperty("--schedule-table-head-row", String(rowHeight) + "px");
        target.style.setProperty("--schedule-frozen-band-height", String(frozenBandHeight) + "px");
        target.style.setProperty("--legend-panel-top", String(legendTop) + "px");
        target.style.setProperty("--legend-panel-left", String(legendLeft) + "px");
        target.style.setProperty("--legend-panel-right", String(legendRight) + "px");
        target.style.setProperty("--legend-panel-bottom", String(legendBottom) + "px");
      });
      syncSummarySpacerWidth();
      requestFrozenHeaderSync();
    }

  function syncSummarySpacerWidth() {
    if (!dom.summaryTable) {
      return;
    }
    const summaryWidth = Math.round(dom.summaryTable.offsetWidth || dom.summaryTable.clientWidth || dom.summaryTable.getBoundingClientRect().width || 0);
    if (summaryWidth > 0) {
      [dom.workspace, dom.app].forEach(function (target) {
        if (!target) {
          return;
        }
        target.style.setProperty("--summary-table-total", String(summaryWidth) + "px");
      });
    }
  }

  function requestFrozenHeaderSync() {
    if (uiState.frozenSyncFrame) {
      return;
    }
    uiState.frozenSyncFrame = window.requestAnimationFrame(function () {
      uiState.frozenSyncFrame = 0;
      syncFrozenLayer();
    });
  }

  function syncFrozenLayer() {
    if (!dom.sheetScroll || !dom.frozenScroll) {
      return;
    }
    dom.frozenScroll.scrollLeft = dom.sheetScroll.scrollLeft;
    updateFrozenColumnOcclusion();
    [dom.workspace, dom.app].forEach(function (target) {
      if (!target) {
        return;
      }
      target.classList.toggle("schedule-sheet--x-shifted", dom.sheetScroll.scrollLeft > 1);
    });
  }

  function updateFrozenColumnOcclusion() {
    if (!dom.sheetScroll) {
      return;
    }
    const frozenEdgeSource =
      document.querySelector("#scheduleFrozenTableHead .schedule-table__sticky--position") ||
      document.querySelector("#scheduleTableHead .schedule-table__sticky--position") ||
      document.querySelector(".schedule-table__body-row .schedule-table__sticky--position");
    const scrollRect = dom.sheetScroll.getBoundingClientRect();
    const frozenEdge = frozenEdgeSource
      ? Math.round(frozenEdgeSource.getBoundingClientRect().right)
      : Math.round(scrollRect.left);
    const isShifted = dom.sheetScroll.scrollLeft > 1;
    const candidates = document.querySelectorAll([
      "#scheduleFrozenTableHead .schedule-table__day-head",
      "#scheduleFrozenTableHead .schedule-table__weekday-head",
      "#scheduleTableBody .schedule-table__cell",
      "#scheduleSummaryHead th:not(.schedule-summary-table__blank)",
      "#scheduleFrozenSummaryHead th:not(.schedule-summary-table__blank)",
      "#scheduleSummaryBody td",
      "#dailySummaryHead th:not(.schedule-daily-table__sticky)",
      "#dailySummaryBody td:not(.schedule-daily-table__sticky)"
    ].join(", "));

    candidates.forEach(function (cell) {
      const rect = cell.getBoundingClientRect();
      const isUnderFrozenColumns = isShifted && rect.left < frozenEdge - 1;
      cell.classList.toggle("schedule-grid-cell--under-frozen", isUnderFrozenColumns);
    });
  }

  function getFilteredShiftCodes() {
    const query = normalizeCellValue(dom.selectionInput && dom.selectionInput.value);
    return VALID_SHIFT_CODES.filter(function (code) {
      return !query || code.indexOf(query) === 0 || code.indexOf(query) >= 0;
    }).slice(0, 12);
  }

  function renderCodeDropdown() {
    if (!dom.codeDropdown) {
      return;
    }
    const items = getFilteredShiftCodes();
    const shouldShow = uiState.codeDropdownOpen && items.length > 0;
    dom.codeDropdown.hidden = !shouldShow;
    if (!shouldShow) {
      dom.codeDropdown.innerHTML = "";
      return;
    }
    if (uiState.codeDropdownIndex >= items.length) {
      uiState.codeDropdownIndex = items.length - 1;
    }
    dom.codeDropdown.innerHTML = items.map(function (code, index) {
      const activeClass = index === uiState.codeDropdownIndex ? " is-active" : "";
      return '<button type="button" class="schedule-code-dropdown__option' + activeClass + '" data-shift-suggestion="' + escapeHtml(code) + '">' + escapeHtml(code) + "</button>";
    }).join("");
  }

  function hideCodeDropdown() {
    uiState.codeDropdownOpen = false;
    uiState.codeDropdownIndex = -1;
    renderCodeDropdown();
  }

  function handleCodeDropdownKeydown(event) {
    const items = getFilteredShiftCodes();
    if (!items.length) {
      if (event.key === "Escape") {
        event.preventDefault();
        hideCodeDropdown();
        return true;
      }
      return false;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      uiState.codeDropdownOpen = true;
      uiState.codeDropdownIndex = Math.min(items.length - 1, uiState.codeDropdownIndex + 1);
      if (uiState.codeDropdownIndex < 0) {
        uiState.codeDropdownIndex = 0;
      }
      renderCodeDropdown();
      return true;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      uiState.codeDropdownOpen = true;
      uiState.codeDropdownIndex = Math.max(0, uiState.codeDropdownIndex - 1);
      renderCodeDropdown();
      return true;
    }
    if (event.key === "Tab" && uiState.codeDropdownOpen && uiState.codeDropdownIndex >= 0) {
      dom.selectionInput.value = items[uiState.codeDropdownIndex];
      hideCodeDropdown();
      return false;
    }
    if (event.key === "Enter" && uiState.codeDropdownOpen && uiState.codeDropdownIndex >= 0) {
      event.preventDefault();
      dom.selectionInput.value = items[uiState.codeDropdownIndex];
      hideCodeDropdown();
      applySelectionInput();
      return true;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      hideCodeDropdown();
      return true;
    }
    return false;
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
      colIndex: Number(cell.getAttribute("data-col-index") || 0)
    };
  }

  function renderCellValue(code) {
    return code ? escapeHtml(getLegendCodeLabel(code)) : '<span class="schedule-cell__placeholder">·</span>';
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

  function handleAddRows() {
    const count = Math.max(1, Math.min(100, Number(dom.addRowsCount && dom.addRowsCount.value || 1) || 1));
    const monthState = ensureCurrentMonthState();
    for (let index = 0; index < count; index += 1) {
      monthState.rows.push(createManualRow());
    }
    saveState();
    renderAll();
    showFeedback((i18n.getLocale() === "zh-Hant"
      ? "已新增 "
      : (i18n.getLocale() === "vi" ? "Đã thêm " : "Added "))
      + count
      + (i18n.getLocale() === "zh-Hant" ? " 行。" : (i18n.getLocale() === "vi" ? " hàng." : " rows.")), "success");
  }

  function handleDeleteRows() {
    const count = Math.max(1, Math.min(100, Number(dom.addRowsCount && dom.addRowsCount.value || 1) || 1));
    const monthState = ensureCurrentMonthState();
    if (!monthState.rows.length) {
      showFeedback(i18n.getLocale() === "zh-Hant" ? "目前沒有可刪除的列。" : (i18n.getLocale() === "vi" ? "Hiện không có hàng nào để xóa." : "There are no rows to delete."), "error");
      return;
    }
    const deletedCount = Math.min(count, monthState.rows.length);
    monthState.rows.splice(Math.max(0, monthState.rows.length - deletedCount), deletedCount);
    saveState();
    clearSelection(true);
    renderAll();
    showFeedback((i18n.getLocale() === "zh-Hant"
      ? "已刪除 "
      : (i18n.getLocale() === "vi" ? "Đã xóa " : "Deleted "))
      + deletedCount
      + (i18n.getLocale() === "zh-Hant" ? " 行。" : (i18n.getLocale() === "vi" ? " hàng." : " rows.")), "success");
  }

  function handleResizePointerStart(event) {
    const handle = event.target.closest("[data-resize-key]");
    if (!handle || event.button !== 0) {
      return;
    }
    event.preventDefault();
    const key = handle.getAttribute("data-resize-key");
    uiState.columnResize = {
      key: key,
      startX: event.clientX,
      startWidth: state.columnWidths[key]
    };
  }

  function handleResizePointerMove(event) {
    if (!uiState.columnResize) {
      return;
    }
    const nextWidth = uiState.columnResize.startWidth + (event.clientX - uiState.columnResize.startX);
    state.columnWidths[uiState.columnResize.key] = Math.max(uiState.columnResize.key === "day" ? 36 : 64, Math.round(nextWidth));
    applyColumnWidths();
    updateStickyMetrics();
    updateSheetOverflowState();
  }

  function handleResizeAutoFit(event) {
    const handle = event.target.closest("[data-resize-key]");
    if (!handle) {
      return;
    }
    event.preventDefault();
    const key = handle.getAttribute("data-resize-key");
    state.columnWidths[key] = measureAutoFitWidth(key);
    saveState();
    renderAll();
  }

  function measureAutoFitWidth(key) {
    const values = [];
    if (key === "day") {
      const days = getDaysInMonth(state.selectedYear, state.selectedMonth);
      for (let day = 1; day <= days; day += 1) {
        values.push(String(day));
        values.push(getWeekdayLabel(state.selectedYear, state.selectedMonth, day));
      }
      ensureCurrentMonthState().rows.forEach(function (row) {
        Object.keys(row.shifts).forEach(function (dayKey) {
          values.push(normalizeCellValue(row.shifts[dayKey]));
        });
      });
      return Math.max(36, Math.min(96, measureMaxWidth(values, 30)));
    }

    const meta = META_COLUMNS.find(function (item) { return item.widthKey === key; });
    if (!meta) {
      return DEFAULT_COLUMN_WIDTHS[key] || 80;
    }
    values.push((META_HEADERS[i18n.getLocale()] || META_HEADERS["zh-Hant"])[META_COLUMNS.indexOf(meta)]);
    ensureCurrentMonthState().rows.forEach(function (row) {
      values.push(String(row.employeeSnapshot[meta.key] || ""));
    });
    return Math.max(64, Math.min(280, measureMaxWidth(values, 34)));
  }

  function measureMaxWidth(values, padding) {
    const probe = document.createElement("span");
    probe.style.position = "fixed";
    probe.style.visibility = "hidden";
    probe.style.whiteSpace = "nowrap";
    probe.style.fontSize = "11px";
    probe.style.fontWeight = "800";
    probe.style.fontFamily = "inherit";
    document.body.appendChild(probe);
    let maxWidth = 0;
    values.forEach(function (value) {
      probe.textContent = value || "";
      maxWidth = Math.max(maxWidth, Math.ceil(probe.getBoundingClientRect().width));
    });
    probe.remove();
    return maxWidth + padding;
  }

  function uniqueOnly(value, index, list) {
    return list.indexOf(value) === index;
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
    }, 4200);
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
