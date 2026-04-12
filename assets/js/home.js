(function () {
  const i18n = window.YiDingI18n || null;
  const authStore = window.YiDingAuthStore || null;
  const employeesDataApi = window.YiDingEmployeesData || null;
  const SCHEDULE_STORAGE_KEY = "yiding_schedule_module_v3";
  const HOME_TAB_STORAGE_KEY = "yiding_dashboard_active_tab_v1";
  const REDIRECT_TO_LOGIN = "../index.html";

  const homeMenu = document.getElementById("homeMenu");
  const homeTopActions = document.getElementById("homeTopActions");
  const profileName = document.getElementById("dashboardProfileName");
  const profileRole = document.getElementById("dashboardProfileRole");
  const profileWelcome = document.getElementById("dashboardProfileWelcome");
  const avatarButton = document.getElementById("dashboardAvatarButton");
  const avatarImage = document.getElementById("dashboardAvatarImage");
  const avatarInput = document.getElementById("dashboardAvatarInput");
  const logoutButton = document.getElementById("dashboardLogoutButton");
  const detailEyebrow = document.getElementById("dashboardDetailEyebrow");
  const detailTitle = document.getElementById("dashboardDetailTitle");
  const detailBody = document.getElementById("dashboardDetailBody");

  if (!i18n || !authStore || !homeMenu || !homeTopActions || !detailBody) {
    return;
  }

  const session = authStore.getSession();
  const currentAccount = authStore.getCurrentAccount();

  if (!session || !currentAccount) {
    window.location.replace(REDIRECT_TO_LOGIN);
    return;
  }

  const uiState = {
    localeMenuOpen: false,
    activeTab: getStoredActiveTab(currentAccount),
    employeeDepartmentId: "",
    scheduleMonthKey: "",
    accountFormOpen: false,
    accountFeedback: { text: "", type: "" }
  };

  const customText = {
    "zh-Hant": {
      roleAdmin: "最高權限帳號",
      roleViewer: "只讀帳號",
      aiTitle: "AI 對話區",
      aiBody: "先預留中控畫面位置，後續可直接接 AI 對話、知識庫與內部流程助手。",
      employeesTitle: "員工總覽",
      employeesHintAdmin: "管理帳號以外的功能先做成檢視層，原有員工模組仍保留。",
      employeesHintViewer: "此帳號僅能查看部門與員工，不可編輯。",
      employeesDepartment: "部門",
      employeesEmpty: "此部門目前沒有在職員工。",
      scheduleTitle: "班表總覽",
      scheduleHintAdmin: "先提供唯讀月表摘要，完整編輯仍在原班表模組。",
      scheduleHintViewer: "此帳號只可選月份查看，不可改班。",
      scheduleMonth: "月份",
      scheduleEmpty: "目前沒有已儲存的月份班表資料。",
      scheduleRows: "人員列",
      scheduleAssignments: "已排班格",
      attendanceTitle: "出勤區",
      attendanceBody: "先保留版位，後續接打卡與異常追蹤。",
      infoTitle: "弈鼎資料",
      infoBody: "預留企業資料、公告與 SOP 入口。",
      accountsTitle: "帳號管理",
      accountsHint: "只有 YiDing Admin 可以新增帳號。新增後可立即登入。",
      accountsAdd: "新增帳號",
      accountsHide: "收起表單",
      accountUsername: "帳號",
      accountPassword: "密碼",
      accountWelcome: "歡迎登入",
      accountCreate: "建立帳號",
      accountCancel: "取消",
      accountSuccess: "帳號已建立，現在可以直接登入。",
      accountDuplicate: "此帳號已存在，請換一個名稱。",
      accountMissing: "三個欄位都必須填寫。",
      accountCurrent: "目前登入中",
      menuAccounts: "管理帳號",
      menuAttendance: "出勤",
      menuInfo: "弈鼎資料",
      openModule: "開啟完整模組",
      readOnly: "唯讀模式",
      logout: "退出登录",
      help: "說明",
      chatEyebrow: "AI WORKSPACE",
      detailEyebrow: "LIVE PANEL"
    },
    vi: {
      roleAdmin: "Tai khoan admin",
      roleViewer: "Tai khoan chi xem",
      aiTitle: "Khu AI",
      aiBody: "Tam thoi giu san vi tri de noi AI chat va tri thuc noi bo o buoc sau.",
      employeesTitle: "Tong quan nhan vien",
      employeesHintAdmin: "Lop dashboard nay dang la view layer, module nhan vien goc van duoc giu.",
      employeesHintViewer: "Tai khoan nay chi duoc xem phong ban va nhan vien.",
      employeesDepartment: "Bo phan",
      employeesEmpty: "Bo phan nay hien khong co nhan vien dang lam.",
      scheduleTitle: "Tong quan ca lam",
      scheduleHintAdmin: "Dang hien thi ban tom tat read-only, module chinh sua day du van duoc giu rieng.",
      scheduleHintViewer: "Tai khoan nay chi duoc chon thang de xem lich.",
      scheduleMonth: "Thang",
      scheduleEmpty: "Chua co du lieu lich da luu.",
      scheduleRows: "Dong nhan vien",
      scheduleAssignments: "O da xep",
      attendanceTitle: "Cham cong",
      attendanceBody: "Tam thoi giu cho cho tinh nang cham cong.",
      infoTitle: "Thong tin YiDing",
      infoBody: "Khu vuc cho thong bao va thong tin doanh nghiep.",
      accountsTitle: "Quan ly tai khoan",
      accountsHint: "Chi YiDing Admin moi duoc tao tai khoan moi.",
      accountsAdd: "Them tai khoan",
      accountsHide: "An form",
      accountUsername: "Tai khoan",
      accountPassword: "Mat khau",
      accountWelcome: "Chao mung dang nhap",
      accountCreate: "Tao tai khoan",
      accountCancel: "Huy",
      accountSuccess: "Da tao tai khoan moi.",
      accountDuplicate: "Tai khoan nay da ton tai.",
      accountMissing: "Can nhap du ca ba truong.",
      accountCurrent: "Dang dang nhap",
      menuAccounts: "Quan ly tai khoan",
      menuAttendance: "Cham cong",
      menuInfo: "Thong tin YiDing",
      openModule: "Mo module day du",
      readOnly: "Chi xem",
      logout: "Dang xuat",
      help: "Huong dan",
      chatEyebrow: "AI WORKSPACE",
      detailEyebrow: "LIVE PANEL"
    },
    en: {
      roleAdmin: "Admin account",
      roleViewer: "View-only account",
      aiTitle: "AI Workspace",
      aiBody: "This central area is reserved for future AI chat, knowledge search, and internal assistant workflows.",
      employeesTitle: "Employees Overview",
      employeesHintAdmin: "This dashboard layer is read-oriented for now. The full employee module is still preserved separately.",
      employeesHintViewer: "This account can only view departments and employees.",
      employeesDepartment: "Department",
      employeesEmpty: "No active employees in this department.",
      scheduleTitle: "Schedule Overview",
      scheduleHintAdmin: "This panel shows a read-only monthly summary. The full schedule editor remains in the original module.",
      scheduleHintViewer: "This account can only choose a month and view the schedule.",
      scheduleMonth: "Month",
      scheduleEmpty: "No saved monthly schedule data yet.",
      scheduleRows: "Rows",
      scheduleAssignments: "Assigned cells",
      attendanceTitle: "Attendance",
      attendanceBody: "Reserved for future attendance insights and anomaly tracking.",
      infoTitle: "YiDing Info",
      infoBody: "Reserved for company updates, SOP, and internal resources.",
      accountsTitle: "Account Management",
      accountsHint: "Only YiDing Admin can create new accounts.",
      accountsAdd: "Add account",
      accountsHide: "Hide form",
      accountUsername: "Account",
      accountPassword: "Password",
      accountWelcome: "Welcome message",
      accountCreate: "Create account",
      accountCancel: "Cancel",
      accountSuccess: "Account created successfully.",
      accountDuplicate: "This account already exists.",
      accountMissing: "All three fields are required.",
      accountCurrent: "Current session",
      menuAccounts: "Account Management",
      menuAttendance: "Attendance",
      menuInfo: "YiDing Info",
      openModule: "Open full module",
      readOnly: "Read only",
      logout: "Log out",
      help: "Help",
      chatEyebrow: "AI WORKSPACE",
      detailEyebrow: "LIVE PANEL"
    }
  };

  const menuConfigs = [
    { id: "employees", labelKey: "home.menu.employees", icon: "👥" },
    { id: "schedule", labelKey: "home.menu.schedule", icon: "🗓" },
    { id: "attendance", customKey: "menuAttendance", icon: "⏱" },
    { id: "yidingInfo", customKey: "menuInfo", icon: "✦" },
    { id: "accounts", customKey: "menuAccounts", icon: "🛡", adminOnly: true }
  ];

  const topActionIcons = [
    { id: "help", icon: "?", tooltipKey: "common.help" },
    { id: "settings", icon: "⚙", tooltipKey: "common.settings" }
  ];

  renderAll();
  bindEvents();

  i18n.subscribe(function () {
    renderAll();
  });

  function bindEvents() {
    homeMenu.addEventListener("click", function (event) {
      const button = event.target.closest(".dashboard-nav__item");
      if (!button) {
        return;
      }

      const nextTab = button.getAttribute("data-main-menu-id");
      if (!nextTab) {
        return;
      }

      uiState.activeTab = nextTab;
      storeActiveTab(currentAccount, nextTab);
      if (nextTab !== "accounts") {
        uiState.accountFormOpen = false;
        uiState.accountFeedback = { text: "", type: "" };
      }
      renderAll();
    });

    homeTopActions.addEventListener("click", function (event) {
      const localeOption = event.target.closest("[data-locale-value]");
      const actionButton = event.target.closest(".dashboard-top-action");

      if (localeOption) {
        event.stopPropagation();
        i18n.setLocale(localeOption.getAttribute("data-locale-value"));
        uiState.localeMenuOpen = false;
        renderAll();
        return;
      }

      if (!actionButton) {
        return;
      }

      const actionId = actionButton.getAttribute("data-top-action-id");
      if (actionId === "settings") {
        event.stopPropagation();
        uiState.localeMenuOpen = !uiState.localeMenuOpen;
        renderTopActions();
        return;
      }

      if (actionId === "help") {
        uiState.activeTab = "yidingInfo";
        storeActiveTab(currentAccount, uiState.activeTab);
        renderAll();
      }
    });

    document.addEventListener("click", function (event) {
      if (!uiState.localeMenuOpen || homeTopActions.contains(event.target)) {
        return;
      }
      uiState.localeMenuOpen = false;
      renderTopActions();
    });

    avatarButton.addEventListener("click", function () {
      avatarInput.click();
    });

    avatarInput.addEventListener("change", function () {
      const file = avatarInput.files && avatarInput.files[0];
      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.onload = function () {
        authStore.updateAvatar(currentAccount.username, String(reader.result || ""));
        renderProfile();
        if (uiState.activeTab === "accounts") {
          renderDetailPanel();
        }
      };
      reader.readAsDataURL(file);
      avatarInput.value = "";
    });

    logoutButton.addEventListener("click", function () {
      authStore.clearSession();
      window.location.replace(REDIRECT_TO_LOGIN);
    });

    detailBody.addEventListener("click", function (event) {
      const addButton = event.target.closest("[data-account-action='toggle-form']");
      const cancelButton = event.target.closest("[data-account-action='cancel-form']");
      const adminModuleButton = event.target.closest("[data-open-module]");

      if (adminModuleButton) {
        window.location.href = adminModuleButton.getAttribute("data-open-module");
        return;
      }

      if (addButton) {
        uiState.accountFormOpen = !uiState.accountFormOpen;
        uiState.accountFeedback = { text: "", type: "" };
        renderDetailPanel();
        return;
      }

      if (cancelButton) {
        uiState.accountFormOpen = false;
        uiState.accountFeedback = { text: "", type: "" };
        renderDetailPanel();
      }
    });

    detailBody.addEventListener("change", function (event) {
      if (event.target.id === "dashboardDepartmentFilter") {
        uiState.employeeDepartmentId = event.target.value;
        renderDetailPanel();
      }

      if (event.target.id === "dashboardScheduleMonth") {
        uiState.scheduleMonthKey = event.target.value;
        renderDetailPanel();
      }
    });

    detailBody.addEventListener("submit", function (event) {
      const form = event.target.closest("#dashboardAccountForm");
      if (!form) {
        return;
      }

      event.preventDefault();
      const username = form.querySelector("[name='username']").value.trim();
      const password = form.querySelector("[name='password']").value.trim();
      const welcomeMessage = form.querySelector("[name='welcomeMessage']").value.trim();
      const result = authStore.createAccount({
        username: username,
        password: password,
        welcomeMessage: welcomeMessage
      });

      if (!result.ok) {
        uiState.accountFeedback = {
          text: result.error === "duplicate-account" ? t("accountDuplicate") : t("accountMissing"),
          type: "error"
        };
        renderDetailPanel();
        return;
      }

      uiState.accountFeedback = {
        text: t("accountSuccess"),
        type: "success"
      };
      uiState.accountFormOpen = false;
      renderDetailPanel();
    });
  }

  function renderAll() {
    document.title = i18n.t("home.pageTitle");
    renderProfile();
    renderTopActions();
    renderSidebarMenu();
    renderDetailPanel();
  }

  function renderProfile() {
    const freshAccount = authStore.getCurrentAccount() || currentAccount;
    profileName.textContent = freshAccount.displayName || freshAccount.username;
    profileRole.textContent = authStore.isAdmin(freshAccount) ? t("roleAdmin") : t("roleViewer");
    if (profileWelcome) {
      profileWelcome.textContent = freshAccount.welcomeMessage || freshAccount.username;
    }
    avatarImage.src = freshAccount.avatarSrc || authStore.DEFAULT_AVATAR_SRC;
    avatarImage.alt = freshAccount.displayName || freshAccount.username;
    logoutButton.textContent = t("logout");
  }

  function renderTopActions() {
    homeTopActions.setAttribute("aria-label", i18n.t("home.topActionsAria"));
    homeTopActions.innerHTML = topActionIcons.map(function (iconConfig) {
      return [
        '<button type="button" id="dashboardTopAction-' + iconConfig.id + '" class="dashboard-top-action" data-top-action-id="' + iconConfig.id + '" aria-label="' + escapeHtml(i18n.t(iconConfig.tooltipKey)) + '" data-tooltip="' + escapeHtml(iconConfig.id === "help" ? t("help") : i18n.t(iconConfig.tooltipKey)) + '"',
        iconConfig.id === "settings" ? ' aria-expanded="' + String(uiState.localeMenuOpen) + '"' : "",
        ">",
        '<span class="dashboard-top-action__icon" aria-hidden="true">' + iconConfig.icon + "</span>",
        "</button>"
      ].join("");
    }).join("") + renderLocalePopover();
  }

  function renderLocalePopover() {
    const options = i18n.getLocaleOptions().map(function (option) {
      const activeClass = option.value === i18n.getLocale() ? " is-active" : "";

      return [
        '<button type="button" class="yd-locale-option' + activeClass + '" data-locale-value="' + option.value + '">',
        '<span>' + option.label + "</span>",
        '<span class="yd-locale-option__check" aria-hidden="true">●</span>',
        "</button>"
      ].join("");
    }).join("");

    return [
      '<div class="yd-locale-control dashboard-top-actions__locale-control">',
      '<div class="yd-locale-popover"' + (uiState.localeMenuOpen ? "" : " hidden") + '>',
      '<p class="yd-locale-popover__title">' + escapeHtml(i18n.t("common.language")) + "</p>",
      options,
      "</div>",
      "</div>"
    ].join("");
  }

  function renderSidebarMenu() {
    const buttons = menuConfigs.filter(function (item) {
      return !item.adminOnly || authStore.isAdmin(currentAccount);
    });

    if (!buttons.some(function (item) { return item.id === uiState.activeTab; })) {
      uiState.activeTab = "employees";
    }

    homeMenu.setAttribute("aria-label", i18n.t("home.menuAria"));
    homeMenu.innerHTML = buttons.map(function (buttonConfig) {
      const isActive = buttonConfig.id === uiState.activeTab;
      const label = buttonConfig.labelKey ? i18n.t(buttonConfig.labelKey) : t(buttonConfig.customKey);
      return [
        '<button type="button" id="dashboardMainButton-' + buttonConfig.id + '" class="dashboard-nav__item' + (isActive ? " is-active" : "") + '" data-main-menu-id="' + buttonConfig.id + '">',
        '<span class="dashboard-nav__label">' + escapeHtml(label) + "</span>",
        '<span class="dashboard-nav__icon" aria-hidden="true">' + buttonConfig.icon + "</span>",
        "</button>"
      ].join("");
    }).join("");
  }

  function renderDetailPanel() {
    detailEyebrow.textContent = t("detailEyebrow");

    if (uiState.activeTab === "employees") {
      detailTitle.textContent = t("employeesTitle");
      detailBody.innerHTML = renderEmployeesPanel();
      return;
    }

    if (uiState.activeTab === "schedule") {
      detailTitle.textContent = t("scheduleTitle");
      detailBody.innerHTML = renderSchedulePanel();
      return;
    }

    if (uiState.activeTab === "attendance") {
      detailTitle.textContent = t("attendanceTitle");
      detailBody.innerHTML = renderStaticPanel(t("attendanceTitle"), t("attendanceBody"));
      return;
    }

    if (uiState.activeTab === "yidingInfo") {
      detailTitle.textContent = t("infoTitle");
      detailBody.innerHTML = renderStaticPanel(t("infoTitle"), t("infoBody"));
      return;
    }

    if (uiState.activeTab === "accounts" && authStore.isAdmin(currentAccount)) {
      detailTitle.textContent = t("accountsTitle");
      detailBody.innerHTML = renderAccountsPanel();
      return;
    }

    uiState.activeTab = "employees";
    renderDetailPanel();
  }

  function renderEmployeesPanel() {
    const state = getEmployeesState();
    const departments = Array.isArray(state.departments) ? state.departments : [];
    const activeEmployees = (state.employees || []).filter(function (employee) {
      return employee && employee.work && employee.work.status === "在職";
    });

    if (!uiState.employeeDepartmentId || !departments.some(function (department) { return department.id === uiState.employeeDepartmentId; })) {
      uiState.employeeDepartmentId = departments[0] ? departments[0].id : "";
    }

    const currentDepartment = departments.find(function (department) {
      return department.id === uiState.employeeDepartmentId;
    });

    const filtered = activeEmployees.filter(function (employee) {
      return employee.departmentId === uiState.employeeDepartmentId;
    });

    const listMarkup = filtered.length
      ? filtered.map(function (employee) {
          const basic = employee.basic || {};
          const work = employee.work || {};
          return [
            '<article class="dashboard-list__item">',
            "<strong>" + escapeHtml(basic.engName || basic.vieName || employee.id) + "</strong>",
            "<span>" + escapeHtml(basic.vieName || basic.engName || "") + "</span>",
            "<span>" + escapeHtml((work.position || "") + " · " + (basic.ydiId || "")) + "</span>",
            "</article>"
          ].join("");
        }).join("")
      : '<div class="dashboard-empty">' + escapeHtml(t("employeesEmpty")) + "</div>";

    return [
      '<section class="dashboard-panel">',
      '<div class="dashboard-panel__meta">',
      "<h3 class=\"dashboard-panel__title\">" + escapeHtml(t("employeesTitle")) + "</h3>",
      authStore.isAdmin(currentAccount) ? '<button type="button" class="dashboard-button dashboard-button--ghost" data-open-module="employees.html">' + escapeHtml(t("openModule")) + "</button>" : '<span class="dashboard-role-badge">' + escapeHtml(t("readOnly")) + "</span>",
      "</div>",
      '<p class="dashboard-readonly-note">' + escapeHtml(authStore.isAdmin(currentAccount) ? t("employeesHintAdmin") : t("employeesHintViewer")) + "</p>",
      '<label class="dashboard-form-label" for="dashboardDepartmentFilter">' + escapeHtml(t("employeesDepartment")) + '<select id="dashboardDepartmentFilter" class="dashboard-select">' + departments.map(function (department) {
        const selected = department.id === uiState.employeeDepartmentId ? " selected" : "";
        return '<option value="' + escapeHtml(department.id) + '"' + selected + ">" + escapeHtml(department.name) + "</option>";
      }).join("") + "</select></label>",
      '<div class="dashboard-panel"><div class="dashboard-panel__meta"><h4 class="dashboard-panel__title">' + escapeHtml(currentDepartment ? currentDepartment.name : t("employeesDepartment")) + '</h4><span class="dashboard-role-badge">' + filtered.length + " staff</span></div><div class=\"dashboard-list\">" + listMarkup + "</div></div>",
      "</section>"
    ].join("");
  }

  function renderSchedulePanel() {
    const scheduleState = getScheduleState();
    const monthKeys = Object.keys(scheduleState.months || {}).sort();
    const fallbackKey = monthKeys[0] || buildMonthKey(scheduleState.selectedYear, scheduleState.selectedMonth);

    if (!uiState.scheduleMonthKey || monthKeys.indexOf(uiState.scheduleMonthKey) === -1) {
      uiState.scheduleMonthKey = fallbackKey;
    }

    const monthState = scheduleState.months && scheduleState.months[uiState.scheduleMonthKey]
      ? scheduleState.months[uiState.scheduleMonthKey]
      : { rows: [] };
    const rows = Array.isArray(monthState.rows) ? monthState.rows : [];
    const assignedCells = rows.reduce(function (sum, row) {
      return sum + Object.keys(row && row.shifts ? row.shifts : {}).length;
    }, 0);

    const sampleRows = rows.slice(0, 8).map(function (row) {
      const snapshot = row.employeeSnapshot || {};
      const shifts = row.shifts || {};
      return [
        '<article class="dashboard-schedule-card">',
        "<strong>" + escapeHtml(snapshot.engName || snapshot.vieName || snapshot.ydiId || row.id) + "</strong>",
        "<span>" + escapeHtml((snapshot.department || "") + " · " + (snapshot.position || "")) + "</span>",
        "<span>" + escapeHtml("Assigned days: " + Object.keys(shifts).length) + "</span>",
        "</article>"
      ].join("");
    }).join("");

    const monthOptions = (monthKeys.length ? monthKeys : [fallbackKey]).map(function (key) {
      const selected = key === uiState.scheduleMonthKey ? " selected" : "";
      return '<option value="' + escapeHtml(key) + '"' + selected + ">" + escapeHtml(key) + "</option>";
    }).join("");

    return [
      '<section class="dashboard-panel">',
      '<div class="dashboard-panel__meta">',
      "<h3 class=\"dashboard-panel__title\">" + escapeHtml(t("scheduleTitle")) + "</h3>",
      authStore.isAdmin(currentAccount) ? '<button type="button" class="dashboard-button dashboard-button--ghost" data-open-module="edit/index.html">' + escapeHtml(t("openModule")) + "</button>" : '<span class="dashboard-role-badge">' + escapeHtml(t("readOnly")) + "</span>",
      "</div>",
      '<p class="dashboard-readonly-note">' + escapeHtml(authStore.isAdmin(currentAccount) ? t("scheduleHintAdmin") : t("scheduleHintViewer")) + "</p>",
      '<label class="dashboard-form-label" for="dashboardScheduleMonth">' + escapeHtml(t("scheduleMonth")) + '<select id="dashboardScheduleMonth" class="dashboard-select">' + monthOptions + "</select></label>",
      '<div class="dashboard-schedule-summary">',
      '<article class="dashboard-schedule-stat"><strong>' + rows.length + '</strong><span>' + escapeHtml(t("scheduleRows")) + "</span></article>",
      '<article class="dashboard-schedule-stat"><strong>' + assignedCells + '</strong><span>' + escapeHtml(t("scheduleAssignments")) + "</span></article>",
      "</div>",
      rows.length ? '<div class="dashboard-schedule-list">' + sampleRows + "</div>" : '<div class="dashboard-empty">' + escapeHtml(t("scheduleEmpty")) + "</div>",
      "</section>"
    ].join("");
  }

  function renderAccountsPanel() {
    const accounts = authStore.getAccounts();
    const listMarkup = accounts.map(function (account) {
      const isCurrent = account.username === currentAccount.username;
      return [
        '<article class="dashboard-account-card">',
        '<div class="dashboard-account-card__top">',
        "<strong>" + escapeHtml(account.username) + "</strong>",
        '<span class="dashboard-role-badge">' + escapeHtml(account.role === "admin" ? t("roleAdmin") : t("roleViewer")) + "</span>",
        "</div>",
        "<span>" + escapeHtml("Welcome: " + (account.welcomeMessage || account.username)) + "</span>",
        "<span>" + escapeHtml("Password: " + account.password) + "</span>",
        isCurrent ? '<span>' + escapeHtml(t("accountCurrent")) + "</span>" : "",
        "</article>"
      ].join("");
    }).join("");

    const feedbackClass = uiState.accountFeedback.type ? " is-" + uiState.accountFeedback.type : "";

    return [
      '<section class="dashboard-panel">',
      '<div class="dashboard-account-toolbar">',
      "<h3 class=\"dashboard-panel__title\">" + escapeHtml(t("accountsTitle")) + "</h3>",
      '<button type="button" class="dashboard-button" data-account-action="toggle-form">' + escapeHtml(uiState.accountFormOpen ? t("accountsHide") : t("accountsAdd")) + "</button>",
      "</div>",
      '<p class="dashboard-readonly-note">' + escapeHtml(t("accountsHint")) + "</p>",
      '<p class="dashboard-feedback' + feedbackClass + '">' + escapeHtml(uiState.accountFeedback.text || "") + "</p>",
      '<form id="dashboardAccountForm" class="dashboard-account-form"' + (uiState.accountFormOpen ? "" : " hidden") + ">",
      '<label class="dashboard-form-label">' + escapeHtml(t("accountUsername")) + '<input class="dashboard-input" name="username" type="text" autocomplete="off"></label>',
      '<label class="dashboard-form-label">' + escapeHtml(t("accountPassword")) + '<input class="dashboard-input" name="password" type="text" autocomplete="off"></label>',
      '<label class="dashboard-form-label">' + escapeHtml(t("accountWelcome")) + '<input class="dashboard-input" name="welcomeMessage" type="text" autocomplete="off"></label>',
      '<div class="dashboard-form-actions"><button type="submit" class="dashboard-button">' + escapeHtml(t("accountCreate")) + '</button><button type="button" class="dashboard-button dashboard-button--ghost" data-account-action="cancel-form">' + escapeHtml(t("accountCancel")) + "</button></div>",
      "</form>",
      '<div class="dashboard-account-list">' + listMarkup + "</div>",
      "</section>"
    ].join("");
  }

  function renderStaticPanel(title, bodyText) {
    return [
      '<section class="dashboard-panel">',
      "<h3 class=\"dashboard-panel__title\">" + escapeHtml(title) + "</h3>",
      '<div class="dashboard-empty">' + escapeHtml(bodyText) + "</div>",
      "</section>"
    ].join("");
  }

  function getEmployeesState() {
    if (!employeesDataApi || !employeesDataApi.createInitialState) {
      return { departments: [], employees: [] };
    }

    try {
      const parsed = JSON.parse(localStorage.getItem(employeesDataApi.STORAGE_KEY) || "null");
      if (parsed && Array.isArray(parsed.employees)) {
        return {
          departments: Array.isArray(parsed.departments) ? parsed.departments : employeesDataApi.DEFAULT_DEPARTMENTS,
          employees: parsed.employees
        };
      }
    } catch (error) {}

    const initial = employeesDataApi.createInitialState();
    return {
      departments: initial.departments || [],
      employees: initial.employees || []
    };
  }

  function getScheduleState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(SCHEDULE_STORAGE_KEY) || "null");
      if (parsed && typeof parsed === "object") {
        return {
          selectedYear: parsed.selectedYear || new Date().getFullYear(),
          selectedMonth: parsed.selectedMonth || (new Date().getMonth() + 1),
          months: parsed.months && typeof parsed.months === "object" ? parsed.months : {}
        };
      }
    } catch (error) {}

    return {
      selectedYear: new Date().getFullYear(),
      selectedMonth: new Date().getMonth() + 1,
      months: {}
    };
  }

  function getStoredActiveTab(account) {
    const stored = sessionStorage.getItem(HOME_TAB_STORAGE_KEY + ":" + account.username);
    if (stored) {
      return stored;
    }
    return authStore.isAdmin(account) ? "accounts" : "employees";
  }

  function storeActiveTab(account, nextTab) {
    sessionStorage.setItem(HOME_TAB_STORAGE_KEY + ":" + account.username, nextTab);
  }

  function buildMonthKey(year, month) {
    return String(year) + "-" + String(month).padStart(2, "0");
  }

  function t(key) {
    const locale = i18n.getLocale();
    const localeBucket = customText[locale] || customText["zh-Hant"];
    return localeBucket[key] || customText["zh-Hant"][key] || key;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();
