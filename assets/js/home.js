(function () {
  const i18n = window.YiDingI18n || null;
  const authStore = window.YiDingAuthStore || null;
  const employeesDataApi = window.YiDingEmployeesData || null;
  const SCHEDULE_STORAGE_KEY = "yiding_schedule_module_v3";
  const HOME_TAB_STORAGE_KEY = "yiding_dashboard_active_tab_v2";
  const REDIRECT_TO_LOGIN = "../index.html";
  const CHI_CHI_URL = "http://46.225.160.243";
  const ROLE_OWNER = "owner";

  const homeMenu = document.getElementById("homeMenu");
  const homeTopActions = document.getElementById("homeTopActions");
  const profileName = document.getElementById("dashboardProfileName");
  const profileRole = document.getElementById("dashboardProfileRole");
  const avatarButton = document.getElementById("dashboardAvatarButton");
  const avatarImage = document.getElementById("dashboardAvatarImage");
  const avatarInput = document.getElementById("dashboardAvatarInput");
  const logoutButton = document.getElementById("dashboardLogoutButton");
  const chatEyebrow = document.getElementById("dashboardChatEyebrow");
  const chatTitle = document.getElementById("dashboardChatTitle");
  const chatBadge = document.getElementById("dashboardChatBadge");
  const chatBody = document.getElementById("dashboardChatBody");
  const detailEyebrow = document.getElementById("dashboardDetailEyebrow");
  const detailTitle = document.getElementById("dashboardDetailTitle");
  const detailBody = document.getElementById("dashboardDetailBody");

  if (
    !i18n ||
    !authStore ||
    !homeMenu ||
    !homeTopActions ||
    !chatBody ||
    !detailBody ||
    !chatEyebrow ||
    !chatTitle ||
    !chatBadge
  ) {
    return;
  }

  const currentAccount = authStore.getCurrentAccount();

  if (!currentAccount) {
    window.location.replace(REDIRECT_TO_LOGIN);
    return;
  }

  const uiState = {
    localeMenuOpen: false,
    activeTab: getStoredActiveTab(currentAccount),
    employeeDepartmentId: "",
    scheduleMonthKey: "",
    accountFormOpen: false,
    accountFormMode: "create",
    editingAccountUsername: "",
    accountFeedback: { text: "", type: "" }
  };

  const customText = {
    "zh-Hant": {
      detailEyebrow: "LIVE PANEL",
      chatEyebrow: "MID PANEL",
      help: "說明",
      logout: "退出登录",
      roleAdmin: "最高權限帳號",
      roleViewer: "一般帳號",
      roleOwner: "Owner / Chi Chi 主人",
      readOnly: "唯讀",
      editable: "可編輯",
      allDepartments: "全部部門",
      selectedDepartments: "指定部門",
      menuEmployees: "員工",
      menuSchedule: "班表",
      menuAttendance: "出勤",
      menuInfo: "弈鼎資料",
      menuAccounts: "管理帳號",
      menuChiChi: "Chi Chi",
      employeesTitle: "員工總覽",
      employeesHintAdmin: "完整 Airtable 匯入資料會從舊員工模組同步顯示，這裡先做總覽與捷徑。",
      employeesHintViewer: "此帳號只會看到被授權的部門與員工。",
      employeesDepartment: "部門",
      employeesEmpty: "這個權限範圍目前沒有可顯示的員工。",
      employeesStatActive: "在職員工",
      employeesStatRetired: "離職人員",
      employeesStatDepartments: "可見部門",
      employeesStatSelected: "當前部門",
      employeesOpen: "打開完整員工模組",
      scheduleTitle: "班表總覽",
      scheduleHintAdmin: "完整排班邏輯仍維持舊模組，這裡只做摘要與入口。",
      scheduleHintViewer: "此帳號依權限查看排班，不可跨權限編輯。",
      scheduleMonth: "月份",
      scheduleEmpty: "目前沒有可顯示的班表資料。",
      scheduleRows: "可見列數",
      scheduleAssignments: "已排班格",
      scheduleVisibleDepartments: "可見部門",
      scheduleOpen: "打開完整班表模組",
      attendanceTitle: "出勤區",
      attendanceBody: "保留給之後接打卡、異常與考勤摘要。",
      infoTitle: "弈鼎資料",
      infoBody: "保留給公告、SOP 與內部知識入口。",
      accountsTitle: "帳號管理",
      accountsHint: "YiDing Admin 可以建立、編輯帳號與權限。新增後立刻可登入。",
      accountsAdd: "新增帳號",
      accountsHide: "收起表單",
      accountEdit: "編輯帳號",
      accountSave: "儲存變更",
      accountCreate: "建立帳號",
      accountCancel: "取消",
      accountUsername: "帳號",
      accountPassword: "密碼",
      accountWelcome: "歡迎登入",
      accountPhone: "綁定手機",
      accountEmployeesPermission: "員工模組權限",
      accountSchedulePermission: "班表模組權限",
      accountDepartments: "授權部門",
      accountSuccess: "帳號已建立，現在可以直接登入。",
      accountUpdateSuccess: "帳號已更新。",
      accountDuplicate: "此帳號已存在，請換一個名稱。",
      accountMissing: "必填欄位尚未填完。",
      accountCurrent: "目前登入中",
      accountNoDepartments: "請至少選一個部門，或改回全部部門。",
      accountViewer: "一般帳號",
      accountModuleView: "只看",
      accountModuleEdit: "可編輯",
      currentBinding: "目前綁定",
      phoneEmpty: "尚未綁手機",
      chiChiTitle: "Chi Chi 中控",
      chiChiBadge: "External",
      chiChiPrimary: "Chi Chi 對話入口",
      chiChiBody: "Production 目前只能安全地從這裡打開外部 Chi Chi 視窗；要直接嵌入本站還需要 HTTPS 或反向代理。",
      chiChiOwner: "YiDing Admin 會被視為 owner 身分。",
      chiChiOpen: "在新分頁打開 Chi Chi",
      chiChiWarning: "目前 Chi Chi VPS 只有 HTTP，瀏覽器會阻擋從 HTTPS 首頁直接內嵌。",
      openModule: "打開完整模組",
      permissionScope: "權限範圍",
      permissionAccess: "操作權限",
      permissionDepartments: "部門授權",
      summaryViewer: "只可瀏覽",
      summaryEditor: "可編輯",
      summaryAll: "全部部門",
      summarySelected: "指定部門",
      noDepartmentPermission: "尚未授權任何部門"
    },
    vi: {
      detailEyebrow: "LIVE PANEL",
      chatEyebrow: "MID PANEL",
      help: "Huong dan",
      logout: "Dang xuat",
      roleAdmin: "Tai khoan admin",
      roleViewer: "Tai khoan thuong",
      roleOwner: "Owner / chu Chi Chi",
      readOnly: "Chi xem",
      editable: "Chinh sua",
      allDepartments: "Tat ca bo phan",
      selectedDepartments: "Bo phan chi dinh",
      menuEmployees: "Nhan vien",
      menuSchedule: "Ca lam",
      menuAttendance: "Cham cong",
      menuInfo: "Thong tin YiDing",
      menuAccounts: "Quan ly tai khoan",
      menuChiChi: "Chi Chi",
      employeesTitle: "Tong quan nhan vien",
      employeesHintAdmin: "Du lieu nhan vien day du van nam o module cu; khu nay chi hien tong quan va loi tat.",
      employeesHintViewer: "Tai khoan nay chi thay cac bo phan va nhan vien duoc cap quyen.",
      employeesDepartment: "Bo phan",
      employeesEmpty: "Khong co nhan vien nao trong pham vi quyen hien tai.",
      employeesStatActive: "Nhan vien dang lam",
      employeesStatRetired: "Nhan vien da nghi",
      employeesStatDepartments: "Bo phan co the xem",
      employeesStatSelected: "Bo phan dang chon",
      employeesOpen: "Mo module nhan vien day du",
      scheduleTitle: "Tong quan ca lam",
      scheduleHintAdmin: "Logic xep ca day du van o module cu; khu nay chi hien tom tat va loi vao.",
      scheduleHintViewer: "Tai khoan nay chi xem lich theo quyen, khong duoc sua ngoai pham vi quyen.",
      scheduleMonth: "Thang",
      scheduleEmpty: "Hien tai khong co du lieu ca lam de hien thi.",
      scheduleRows: "So dong co the xem",
      scheduleAssignments: "O da xep ca",
      scheduleVisibleDepartments: "Bo phan co the xem",
      scheduleOpen: "Mo module ca lam day du",
      attendanceTitle: "Khu cham cong",
      attendanceBody: "De danh cho phan ket noi cham cong, bat thuong va tong hop sau nay.",
      infoTitle: "Thong tin YiDing",
      infoBody: "De danh cho thong bao, SOP va cong vao tri thuc noi bo.",
      accountsTitle: "Quan ly tai khoan",
      accountsHint: "YiDing Admin co the tao, sua tai khoan va quyen truy cap. Tao xong dang nhap duoc ngay.",
      accountsAdd: "Them tai khoan",
      accountsHide: "An form",
      accountEdit: "Sua tai khoan",
      accountSave: "Luu thay doi",
      accountCreate: "Tao tai khoan",
      accountCancel: "Huy",
      accountUsername: "Tai khoan",
      accountPassword: "Mat khau",
      accountWelcome: "Loi chao dang nhap",
      accountPhone: "So dien thoai lien ket",
      accountEmployeesPermission: "Quyen module nhan vien",
      accountSchedulePermission: "Quyen module ca lam",
      accountDepartments: "Bo phan duoc cap quyen",
      accountSuccess: "Da tao tai khoan, hien co the dang nhap ngay.",
      accountUpdateSuccess: "Da cap nhat tai khoan.",
      accountDuplicate: "Tai khoan nay da ton tai, hay doi ten khac.",
      accountMissing: "Van con truong bat buoc chua dien.",
      accountCurrent: "Tai khoan dang dang nhap",
      accountNoDepartments: "Hay chon it nhat 1 bo phan, hoac doi ve tat ca bo phan.",
      accountViewer: "Tai khoan thuong",
      accountModuleView: "Chi xem",
      accountModuleEdit: "Duoc sua",
      currentBinding: "Dang lien ket",
      phoneEmpty: "Chua lien ket so dien thoai",
      chiChiTitle: "Trung tam Chi Chi",
      chiChiBadge: "External",
      chiChiPrimary: "Loi vao doi thoai Chi Chi",
      chiChiBody: "Ban production hien chi mo an toan cua so Chi Chi ben ngoai tu day; muon nhung truc tiep vao trang nay thi van can HTTPS hoac reverse proxy.",
      chiChiOwner: "YiDing Admin se duoc xem nhu owner.",
      chiChiOpen: "Mo Chi Chi trong tab moi",
      chiChiWarning: "VPS Chi Chi hien chi co HTTP, trinh duyet se chan viec nhung truc tiep tu trang HTTPS.",
      openModule: "Mo module day du",
      permissionScope: "Pham vi quyen",
      permissionAccess: "Muc thao tac",
      permissionDepartments: "Bo phan duoc cap quyen",
      summaryViewer: "Chi xem",
      summaryEditor: "Duoc sua",
      summaryAll: "Tat ca bo phan",
      summarySelected: "Bo phan chi dinh",
      noDepartmentPermission: "Chua duoc cap quyen bo phan nao"
    },
    en: {
      detailEyebrow: "LIVE PANEL",
      chatEyebrow: "MID PANEL",
      help: "Help",
      logout: "Log out",
      roleAdmin: "Admin account",
      roleViewer: "Standard account",
      roleOwner: "Owner / Chi Chi owner",
      readOnly: "Read only",
      editable: "Editable",
      allDepartments: "All departments",
      selectedDepartments: "Selected departments",
      menuEmployees: "Employees",
      menuSchedule: "Schedule",
      menuAttendance: "Attendance",
      menuInfo: "YiDing Info",
      menuAccounts: "Accounts",
      menuChiChi: "Chi Chi",
      employeesTitle: "Employee Overview",
      employeesHintAdmin: "The full Airtable-import employee data still lives in the legacy module; this area is currently a summary and shortcut layer.",
      employeesHintViewer: "This account only sees the departments and employees it is authorized to access.",
      employeesDepartment: "Department",
      employeesEmpty: "There are no employees available in the current permission scope.",
      employeesStatActive: "Active Employees",
      employeesStatRetired: "Retired Employees",
      employeesStatDepartments: "Visible Departments",
      employeesStatSelected: "Selected Department",
      employeesOpen: "Open Full Employee Module",
      scheduleTitle: "Schedule Overview",
      scheduleHintAdmin: "The full scheduling workflow still lives in the legacy module; this area currently provides a summary and shortcut.",
      scheduleHintViewer: "This account can only view schedules within its permission scope and cannot edit outside it.",
      scheduleMonth: "Month",
      scheduleEmpty: "There is no schedule data available to display right now.",
      scheduleRows: "Visible Rows",
      scheduleAssignments: "Assigned Cells",
      scheduleVisibleDepartments: "Visible Departments",
      scheduleOpen: "Open Full Schedule Module",
      attendanceTitle: "Attendance Zone",
      attendanceBody: "Reserved for future clock-in, exception, and attendance summary integration.",
      infoTitle: "YiDing Info",
      infoBody: "Reserved for announcements, SOPs, and internal knowledge entry points.",
      accountsTitle: "Account Management",
      accountsHint: "YiDing Admin can create and edit accounts and permissions here. New accounts can log in immediately.",
      accountsAdd: "Add Account",
      accountsHide: "Hide Form",
      accountEdit: "Edit Account",
      accountSave: "Save Changes",
      accountCreate: "Create Account",
      accountCancel: "Cancel",
      accountUsername: "Account",
      accountPassword: "Password",
      accountWelcome: "Welcome Message",
      accountPhone: "Bound Phone",
      accountEmployeesPermission: "Employee Module Permission",
      accountSchedulePermission: "Schedule Module Permission",
      accountDepartments: "Authorized Departments",
      accountSuccess: "The account has been created and can log in immediately.",
      accountUpdateSuccess: "The account has been updated.",
      accountDuplicate: "That account already exists. Please choose another name.",
      accountMissing: "Some required fields are still empty.",
      accountCurrent: "Currently signed in",
      accountNoDepartments: "Select at least one department, or switch back to all departments.",
      accountViewer: "Standard account",
      accountModuleView: "View only",
      accountModuleEdit: "Can edit",
      currentBinding: "Current binding",
      phoneEmpty: "No phone linked yet",
      chiChiTitle: "Chi Chi Control",
      chiChiBadge: "External",
      chiChiPrimary: "Chi Chi conversation entry",
      chiChiBody: "Production can currently open the external Chi Chi window safely from here; embedding it directly still needs HTTPS or a reverse proxy.",
      chiChiOwner: "YiDing Admin is treated as the owner role.",
      chiChiOpen: "Open Chi Chi in a new tab",
      chiChiWarning: "The Chi Chi VPS currently only serves HTTP, so browsers block direct embedding from an HTTPS homepage.",
      openModule: "Open Full Module",
      permissionScope: "Permission Scope",
      permissionAccess: "Access Level",
      permissionDepartments: "Authorized Departments",
      summaryViewer: "View only",
      summaryEditor: "Can edit",
      summaryAll: "All departments",
      summarySelected: "Selected departments",
      noDepartmentPermission: "No departments have been authorized yet"
    }
  };

  const menuConfigs = [
    { id: "employees", labelKey: "menuEmployees", icon: "👥" },
    { id: "schedule", labelKey: "menuSchedule", icon: "🗓" },
    { id: "chiChi", labelKey: "menuChiChi", icon: "💬" },
    { id: "attendance", labelKey: "menuAttendance", icon: "⏱" },
    { id: "yidingInfo", labelKey: "menuInfo", icon: "✦" },
    { id: "accounts", labelKey: "menuAccounts", icon: "🛡", adminOnly: true }
  ];

  const topActionIcons = [
    { id: "help", icon: "?", tooltipKey: "help" },
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
      uiState.accountFeedback = { text: "", type: "" };
      uiState.accountFormOpen = false;
      uiState.accountFormMode = "create";
      uiState.editingAccountUsername = "";
      storeActiveTab(currentAccount, nextTab);
      renderAll();
    });

    homeTopActions.addEventListener("click", function (event) {
      const localeOption = event.target.closest("[data-locale-value]");
      const actionButton = event.target.closest(".dashboard-top-action");

      if (localeOption) {
        event.stopPropagation();
        i18n.setLocale(localeOption.getAttribute("data-locale-value"));
        uiState.localeMenuOpen = false;
        renderTopActions();
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
      if (uiState.localeMenuOpen && !homeTopActions.contains(event.target)) {
        uiState.localeMenuOpen = false;
        renderTopActions();
      }
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

    chatBody.addEventListener("click", function (event) {
      const button = event.target.closest("[data-chat-action='open-external']");
      if (!button) {
        return;
      }

      window.open(CHI_CHI_URL, "_blank", "noopener,noreferrer");
    });

    detailBody.addEventListener("click", function (event) {
      const accountToggle = event.target.closest("[data-account-action='toggle-form']");
      const accountCancel = event.target.closest("[data-account-action='cancel-form']");
      const accountEdit = event.target.closest("[data-account-action='edit-account']");
      const openModuleButton = event.target.closest("[data-open-module]");

      if (openModuleButton) {
        window.location.href = openModuleButton.getAttribute("data-open-module");
        return;
      }

      if (accountToggle) {
        uiState.accountFeedback = { text: "", type: "" };
        uiState.accountFormMode = "create";
        uiState.editingAccountUsername = "";
        uiState.accountFormOpen = !uiState.accountFormOpen;
        renderDetailPanel();
        return;
      }

      if (accountCancel) {
        uiState.accountFeedback = { text: "", type: "" };
        uiState.accountFormOpen = false;
        uiState.accountFormMode = "create";
        uiState.editingAccountUsername = "";
        renderDetailPanel();
        return;
      }

      if (accountEdit) {
        uiState.accountFeedback = { text: "", type: "" };
        uiState.accountFormOpen = true;
        uiState.accountFormMode = "edit";
        uiState.editingAccountUsername = accountEdit.getAttribute("data-account-username") || "";
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

      if (event.target.name === "employeesScope" || event.target.name === "scheduleScope") {
        renderDetailPanel();
      }
    });

    detailBody.addEventListener("submit", function (event) {
      const form = event.target.closest("#dashboardAccountForm");
      if (!form) {
        return;
      }

      event.preventDefault();
      submitAccountForm(form);
    });
  }

  function renderAll() {
    document.title = i18n.t("home.pageTitle");
    renderProfile();
    renderTopActions();
    renderSidebarMenu();
    renderChatPanel();
    renderDetailPanel();
  }

  function renderProfile() {
    const freshAccount = authStore.getCurrentAccount() || currentAccount;
    profileName.textContent = freshAccount.displayName || freshAccount.username;
    profileRole.textContent = authStore.isAdmin(freshAccount)
      ? t("roleAdmin")
      : (freshAccount.username === authStore.ADMIN_ACCOUNT.username ? t("roleOwner") : t("roleViewer"));
    avatarImage.src = freshAccount.avatarSrc || authStore.DEFAULT_AVATAR_SRC;
    avatarImage.alt = freshAccount.displayName || freshAccount.username;
    logoutButton.textContent = t("logout");
  }

  function renderTopActions() {
    homeTopActions.setAttribute("aria-label", i18n.t("home.topActionsAria"));
    homeTopActions.innerHTML = topActionIcons.map(function (iconConfig) {
      return [
        '<button type="button" id="dashboardTopAction-' + iconConfig.id + '" class="dashboard-top-action" data-top-action-id="' + iconConfig.id + '" aria-label="' + escapeHtml(resolveActionTooltip(iconConfig.tooltipKey)) + '" data-tooltip="' + escapeHtml(resolveActionTooltip(iconConfig.tooltipKey)) + '"',
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
        "<span>" + escapeHtml(option.label) + "</span>",
        '<span class="yd-locale-option__check" aria-hidden="true">●</span>',
        "</button>"
      ].join("");
    }).join("");

    return [
      '<div class="yd-locale-control dashboard-top-actions__locale-control">',
      '<div class="yd-locale-popover"' + (uiState.localeMenuOpen ? "" : " hidden") + ">",
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
      uiState.activeTab = authStore.isAdmin(currentAccount) ? "accounts" : "employees";
    }

    homeMenu.setAttribute("aria-label", i18n.t("home.menuAria"));
    homeMenu.innerHTML = buttons.map(function (buttonConfig) {
      const isActive = buttonConfig.id === uiState.activeTab;
      return [
        '<button type="button" id="dashboardMainButton-' + buttonConfig.id + '" class="dashboard-nav__item' + (isActive ? " is-active" : "") + '" data-main-menu-id="' + buttonConfig.id + '">',
        '<span class="dashboard-nav__label">' + escapeHtml(t(buttonConfig.labelKey)) + "</span>",
        '<span class="dashboard-nav__icon" aria-hidden="true">' + buttonConfig.icon + "</span>",
        "</button>"
      ].join("");
    }).join("");
  }

  function renderChatPanel() {
    const freshAccount = authStore.getCurrentAccount() || currentAccount;
    const currentPhone = freshAccount.phoneNumber || "";

    chatEyebrow.textContent = t("chatEyebrow");

    if (uiState.activeTab === "chiChi") {
      chatTitle.textContent = t("chiChiTitle");
      chatBadge.textContent = t("chiChiBadge");
      chatBody.innerHTML = [
        '<div class="dashboard-chat-stack dashboard-chat-stack--chi-chi">',
        '<section class="dashboard-chat-surface">',
        '<div class="dashboard-chat-surface__row">',
        '<span class="dashboard-role-badge">' + escapeHtml(authStore.isAdmin(freshAccount) ? t("roleOwner") : t("roleViewer")) + "</span>",
        '<span class="dashboard-role-badge">' + escapeHtml(t("currentBinding")) + ": " + escapeHtml(currentPhone || t("phoneEmpty")) + "</span>",
        "</div>",
        '<h3 class="dashboard-chat-surface__title">' + escapeHtml(t("chiChiPrimary")) + "</h3>",
        '<p class="dashboard-chat-surface__body">' + escapeHtml(t("chiChiBody")) + "</p>",
        '<p class="dashboard-chat-surface__hint">' + escapeHtml(t("chiChiOwner")) + "</p>",
        '<button type="button" class="dashboard-button dashboard-button--accent" data-chat-action="open-external">' + escapeHtml(t("chiChiOpen")) + "</button>",
        '<div class="dashboard-chat-warning">' + escapeHtml(t("chiChiWarning")) + "</div>",
        "</section>",
        '<section class="dashboard-chat-surface dashboard-chat-surface--support">',
        '<div class="dashboard-chat-chip-grid">',
        renderChatChip("Account", freshAccount.username),
        renderChatChip("Phone", currentPhone || t("phoneEmpty")),
        renderChatChip("Mode", authStore.isAdmin(freshAccount) ? ROLE_OWNER : "user"),
        "</div>",
        "</section>",
        "</div>"
      ].join("");
      return;
    }

    if (uiState.activeTab === "employees") {
      const employeesState = getEmployeesState();
      const employees = getAccessibleEmployees(currentAccount, employeesState);
      const activeEmployees = employees.filter(function (employee) {
        return employee && employee.work && employee.work.status === "在職";
      });
      const departmentCount = getAccessibleDepartments(currentAccount, "employees", employeesState, false).length;

      chatTitle.textContent = t("employeesTitle");
      chatBadge.textContent = String(activeEmployees.length);
      chatBody.innerHTML = [
        '<div class="dashboard-chat-stack">',
        '<section class="dashboard-chat-surface">',
        '<h3 class="dashboard-chat-surface__title">' + escapeHtml(t("employeesTitle")) + "</h3>",
        '<div class="dashboard-chat-chip-grid">',
        renderChatChip(t("employeesStatActive"), String(activeEmployees.length)),
        renderChatChip(t("employeesStatRetired"), String(Math.max(employees.length - activeEmployees.length, 0))),
        renderChatChip(t("employeesStatDepartments"), String(departmentCount)),
        "</div>",
        "</section>",
        "</div>"
      ].join("");
      return;
    }

    if (uiState.activeTab === "schedule") {
      const scheduleState = getScheduleState();
      const monthKey = getResolvedScheduleMonthKey(scheduleState);
      const monthState = getVisibleMonthState(scheduleState, monthKey, currentAccount);
      const rows = monthState.rows || [];
      const assignmentCount = rows.reduce(function (sum, row) {
        return sum + Object.keys(row && row.shifts ? row.shifts : {}).length;
      }, 0);

      chatTitle.textContent = t("scheduleTitle");
      chatBadge.textContent = monthKey;
      chatBody.innerHTML = [
        '<div class="dashboard-chat-stack">',
        '<section class="dashboard-chat-surface">',
        '<h3 class="dashboard-chat-surface__title">' + escapeHtml(t("scheduleTitle")) + "</h3>",
        '<div class="dashboard-chat-chip-grid">',
        renderChatChip(t("scheduleRows"), String(rows.length)),
        renderChatChip(t("scheduleAssignments"), String(assignmentCount)),
        renderChatChip(t("scheduleMonth"), monthKey),
        "</div>",
        "</section>",
        "</div>"
      ].join("");
      return;
    }

    chatTitle.textContent = i18n.t("home.welcome");
    chatBadge.textContent = "Ready";
    chatBody.innerHTML = [
      '<div class="dashboard-chat-stack">',
      '<section class="dashboard-chat-placeholder">',
      '<div class="dashboard-chat-placeholder__orb"></div>',
      '<div class="dashboard-chat-placeholder__grid"></div>',
      '<div class="dashboard-chat-placeholder__copy">',
      '<h3>' + escapeHtml(t("chiChiTitle")) + "</h3>",
      '<p>' + escapeHtml(t("chiChiBody")) + "</p>",
      "</div>",
      "</section>",
      "</div>"
    ].join("");
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

    if (uiState.activeTab === "chiChi") {
      detailTitle.textContent = t("chiChiTitle");
      detailBody.innerHTML = renderChiChiDetailPanel();
      return;
    }

    if (uiState.activeTab === "accounts" && authStore.isAdmin(currentAccount)) {
      detailTitle.textContent = t("accountsTitle");
      detailBody.innerHTML = renderAccountsPanel();
      return;
    }

    uiState.activeTab = authStore.isAdmin(currentAccount) ? "accounts" : "employees";
    renderDetailPanel();
  }

  function renderEmployeesPanel() {
    const employeesState = getEmployeesState();
    const accessibleDepartments = getAccessibleDepartments(currentAccount, "employees", employeesState, false);
    const accessibleEmployees = getAccessibleEmployees(currentAccount, employeesState);
    const activeEmployees = accessibleEmployees.filter(function (employee) {
      return employee && employee.work && employee.work.status === "在職";
    });
    const retiredEmployees = accessibleEmployees.filter(function (employee) {
      return employee && employee.work && employee.work.status === "離職";
    });

    if (!uiState.employeeDepartmentId || !accessibleDepartments.some(function (department) { return department.id === uiState.employeeDepartmentId; })) {
      uiState.employeeDepartmentId = accessibleDepartments[0] ? accessibleDepartments[0].id : "";
    }

    const filteredEmployees = activeEmployees.filter(function (employee) {
      return employee.departmentId === uiState.employeeDepartmentId;
    });

    const currentDepartment = accessibleDepartments.find(function (department) {
      return department.id === uiState.employeeDepartmentId;
    });

    return [
      '<section class="dashboard-surface-stack">',
      '<div class="dashboard-stat-grid">',
      renderStatCard(t("employeesStatActive"), activeEmployees.length),
      renderStatCard(t("employeesStatRetired"), retiredEmployees.length),
      renderStatCard(t("employeesStatDepartments"), accessibleDepartments.length),
      renderStatCard(t("employeesStatSelected"), currentDepartment ? currentDepartment.name : "--"),
      "</div>",
      '<section class="dashboard-surface-card">',
      '<div class="dashboard-panel__meta">',
      '<h3 class="dashboard-panel__title">' + escapeHtml(t("employeesTitle")) + "</h3>",
      authStore.canEditModule(currentAccount, "employees")
        ? '<button type="button" class="dashboard-button dashboard-button--ghost" data-open-module="employees.html">' + escapeHtml(t("employeesOpen")) + "</button>"
        : '<span class="dashboard-role-badge">' + escapeHtml(t("readOnly")) + "</span>",
      "</div>",
      '<p class="dashboard-readonly-note">' + escapeHtml(authStore.isAdmin(currentAccount) ? t("employeesHintAdmin") : t("employeesHintViewer")) + "</p>",
      accessibleDepartments.length
        ? '<label class="dashboard-form-label" for="dashboardDepartmentFilter">' + escapeHtml(t("employeesDepartment")) + '<select id="dashboardDepartmentFilter" class="dashboard-select">' + accessibleDepartments.map(function (department) {
            return '<option value="' + escapeHtml(department.id) + '"' + (department.id === uiState.employeeDepartmentId ? " selected" : "") + ">" + escapeHtml(department.name) + "</option>";
          }).join("") + "</select></label>"
        : "",
      filteredEmployees.length
        ? '<div class="dashboard-list">' + filteredEmployees.slice(0, 16).map(function (employee) {
            const basic = employee.basic || {};
            const work = employee.work || {};
            return [
              '<article class="dashboard-list__item">',
              '<div class="dashboard-list__avatar-wrap"><img class="dashboard-list__avatar" src="' + escapeHtml(employee.avatarSrc || authStore.DEFAULT_AVATAR_SRC) + '" alt="' + escapeHtml(basic.engName || basic.vieName || employee.id) + '"></div>',
              '<div class="dashboard-list__content">',
              '<strong>' + escapeHtml(basic.engName || basic.vieName || employee.id) + "</strong>",
              '<span>' + escapeHtml(basic.vieName || basic.engName || "") + "</span>",
              '<span>' + escapeHtml((work.position || "") + " · " + (basic.ydiId || "")) + "</span>",
              "</div>",
              "</article>"
            ].join("");
          }).join("") + "</div>"
        : '<div class="dashboard-empty">' + escapeHtml(t("employeesEmpty")) + "</div>",
      "</section>",
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

    const monthState = getVisibleMonthState(scheduleState, uiState.scheduleMonthKey, currentAccount);
    const rows = Array.isArray(monthState.rows) ? monthState.rows : [];
    const assignedCells = rows.reduce(function (sum, row) {
      return sum + Object.keys(row && row.shifts ? row.shifts : {}).length;
    }, 0);
    const visibleDepartmentCount = getVisibleScheduleDepartmentCount(rows);

    return [
      '<section class="dashboard-surface-stack">',
      '<div class="dashboard-stat-grid">',
      renderStatCard(t("scheduleRows"), rows.length),
      renderStatCard(t("scheduleAssignments"), assignedCells),
      renderStatCard(t("scheduleMonth"), uiState.scheduleMonthKey || fallbackKey),
      renderStatCard(t("scheduleVisibleDepartments"), visibleDepartmentCount),
      "</div>",
      '<section class="dashboard-surface-card">',
      '<div class="dashboard-panel__meta">',
      '<h3 class="dashboard-panel__title">' + escapeHtml(t("scheduleTitle")) + "</h3>",
      authStore.canEditModule(currentAccount, "schedule")
        ? '<button type="button" class="dashboard-button dashboard-button--ghost" data-open-module="edit/index.html">' + escapeHtml(t("scheduleOpen")) + "</button>"
        : '<span class="dashboard-role-badge">' + escapeHtml(t("readOnly")) + "</span>",
      "</div>",
      '<p class="dashboard-readonly-note">' + escapeHtml(authStore.isAdmin(currentAccount) ? t("scheduleHintAdmin") : t("scheduleHintViewer")) + "</p>",
      '<label class="dashboard-form-label" for="dashboardScheduleMonth">' + escapeHtml(t("scheduleMonth")) + '<select id="dashboardScheduleMonth" class="dashboard-select">' + (monthKeys.length ? monthKeys : [fallbackKey]).map(function (key) {
        return '<option value="' + escapeHtml(key) + '"' + (key === uiState.scheduleMonthKey ? " selected" : "") + ">" + escapeHtml(key) + "</option>";
      }).join("") + "</select></label>",
      rows.length
        ? '<div class="dashboard-schedule-list">' + rows.slice(0, 14).map(function (row) {
            const snapshot = row.employeeSnapshot || {};
            const shifts = row.shifts || {};
            return [
              '<article class="dashboard-schedule-card">',
              '<strong>' + escapeHtml(snapshot.engName || snapshot.vieName || snapshot.ydiId || row.id) + "</strong>",
              '<span>' + escapeHtml((snapshot.department || "") + " · " + (snapshot.position || "")) + "</span>",
              '<span>' + escapeHtml("Assigned days: " + Object.keys(shifts).length) + "</span>",
              "</article>"
            ].join("");
          }).join("") + "</div>"
        : '<div class="dashboard-empty">' + escapeHtml(t("scheduleEmpty")) + "</div>",
      "</section>",
      "</section>"
    ].join("");
  }

  function renderAccountsPanel() {
    const accounts = authStore.getAccounts();
    const departments = getDepartmentCatalog();
    const formValues = getAccountFormValues();
    const feedbackClass = uiState.accountFeedback.type ? " is-" + uiState.accountFeedback.type : "";

    return [
      '<section class="dashboard-surface-stack">',
      '<section class="dashboard-surface-card">',
      '<div class="dashboard-account-toolbar">',
      '<div>',
      '<h3 class="dashboard-panel__title">' + escapeHtml(t("accountsTitle")) + "</h3>",
      '<p class="dashboard-readonly-note">' + escapeHtml(t("accountsHint")) + "</p>",
      "</div>",
      '<button type="button" class="dashboard-button" data-account-action="toggle-form">' + escapeHtml(uiState.accountFormOpen ? t("accountsHide") : t("accountsAdd")) + "</button>",
      "</div>",
      '<p class="dashboard-feedback' + feedbackClass + '">' + escapeHtml(uiState.accountFeedback.text || "") + "</p>",
      renderAccountForm(formValues, departments),
      '<div class="dashboard-account-list">' + accounts.map(function (account) {
        const employeePermission = authStore.getModulePermission(account, "employees");
        const schedulePermission = authStore.getModulePermission(account, "schedule");
        return [
          '<article class="dashboard-account-card">',
          '<div class="dashboard-account-card__top">',
          "<strong>" + escapeHtml(account.username) + "</strong>",
          '<span class="dashboard-role-badge">' + escapeHtml(account.role === "admin" ? t("roleAdmin") : t("accountViewer")) + "</span>",
          "</div>",
          '<div class="dashboard-account-card__meta">',
          "<span>" + escapeHtml(t("accountWelcome") + ": " + (account.welcomeMessage || account.username)) + "</span>",
          "<span>" + escapeHtml(t("accountPhone") + ": " + (account.phoneNumber || t("phoneEmpty"))) + "</span>",
          "<span>" + escapeHtml(t("accountEmployeesPermission") + ": " + describePermission(employeePermission, departments)) + "</span>",
          "<span>" + escapeHtml(t("accountSchedulePermission") + ": " + describePermission(schedulePermission, departments)) + "</span>",
          account.username === currentAccount.username ? '<span>' + escapeHtml(t("accountCurrent")) + "</span>" : "",
          "</div>",
          '<div class="dashboard-account-card__actions"><button type="button" class="dashboard-button dashboard-button--ghost" data-account-action="edit-account" data-account-username="' + escapeHtml(account.username) + '">' + escapeHtml(t("accountEdit")) + "</button></div>",
          "</article>"
        ].join("");
      }).join("") + "</div>",
      "</section>",
      "</section>"
    ].join("");
  }

  function renderChiChiDetailPanel() {
    const freshAccount = authStore.getCurrentAccount() || currentAccount;
    return [
      '<section class="dashboard-surface-card">',
      '<h3 class="dashboard-panel__title">' + escapeHtml(t("chiChiTitle")) + "</h3>",
      '<p class="dashboard-readonly-note">' + escapeHtml(t("chiChiBody")) + "</p>",
      '<div class="dashboard-info-grid">',
      renderInfoCard("Account", freshAccount.username),
      renderInfoCard(t("accountPhone"), freshAccount.phoneNumber || t("phoneEmpty")),
      renderInfoCard("Mode", authStore.isAdmin(freshAccount) ? ROLE_OWNER : "user"),
      "</div>",
      '<button type="button" class="dashboard-button dashboard-button--accent" data-chat-action="open-external">' + escapeHtml(t("chiChiOpen")) + "</button>",
      '<div class="dashboard-empty">' + escapeHtml(t("chiChiWarning")) + "</div>",
      "</section>"
    ].join("");
  }

  function renderStaticPanel(title, bodyText) {
    return [
      '<section class="dashboard-surface-card">',
      '<h3 class="dashboard-panel__title">' + escapeHtml(title) + "</h3>",
      '<div class="dashboard-empty">' + escapeHtml(bodyText) + "</div>",
      "</section>"
    ].join("");
  }

  function renderAccountForm(formValues, departments) {
    if (!uiState.accountFormOpen) {
      return "";
    }

    return [
      '<form id="dashboardAccountForm" class="dashboard-account-form">',
      '<div class="dashboard-form-grid">',
      renderTextField(t("accountUsername"), "username", formValues.username),
      renderTextField(t("accountPassword"), "password", formValues.password),
      renderTextField(t("accountWelcome"), "welcomeMessage", formValues.welcomeMessage),
      renderTextField(t("accountPhone"), "phoneNumber", formValues.phoneNumber),
      "</div>",
      renderPermissionBlock("employees", t("accountEmployeesPermission"), formValues.permissions.employees, departments),
      renderPermissionBlock("schedule", t("accountSchedulePermission"), formValues.permissions.schedule, departments),
      '<div class="dashboard-form-actions">',
      '<button type="submit" class="dashboard-button dashboard-button--accent">' + escapeHtml(uiState.accountFormMode === "edit" ? t("accountSave") : t("accountCreate")) + "</button>",
      '<button type="button" class="dashboard-button dashboard-button--ghost" data-account-action="cancel-form">' + escapeHtml(t("accountCancel")) + "</button>",
      "</div>",
      "</form>"
    ].join("");
  }

  function renderPermissionBlock(moduleKey, title, permission, departments) {
    return [
      '<fieldset class="dashboard-permission-block">',
      '<legend class="dashboard-form-legend">' + escapeHtml(title) + "</legend>",
      '<div class="dashboard-form-grid dashboard-form-grid--permissions">',
      '<label class="dashboard-form-label">' + escapeHtml(t("permissionAccess")) + '<select class="dashboard-select" name="' + moduleKey + 'Access"><option value="view"' + (permission.access === "view" ? " selected" : "") + '>' + escapeHtml(t("accountModuleView")) + '</option><option value="edit"' + (permission.access === "edit" ? " selected" : "") + '>' + escapeHtml(t("accountModuleEdit")) + "</option></select></label>",
      '<label class="dashboard-form-label">' + escapeHtml(t("permissionScope")) + '<select class="dashboard-select" name="' + moduleKey + 'Scope"><option value="all"' + (permission.scope === "all" ? " selected" : "") + '>' + escapeHtml(t("allDepartments")) + '</option><option value="selected"' + (permission.scope === "selected" ? " selected" : "") + '>' + escapeHtml(t("selectedDepartments")) + "</option></select></label>",
      "</div>",
      '<div class="dashboard-department-checks">',
      departments.map(function (department) {
        const checked = permission.departmentIds.indexOf(department.id) >= 0 ? " checked" : "";
        return '<label class="dashboard-check-chip"><input type="checkbox" name="' + moduleKey + 'Departments" value="' + escapeHtml(department.id) + '"' + checked + '><span>' + escapeHtml(department.name) + "</span></label>";
      }).join(""),
      "</div>",
      "</fieldset>"
    ].join("");
  }

  function renderTextField(label, name, value) {
    return '<label class="dashboard-form-label">' + escapeHtml(label) + '<input class="dashboard-input" name="' + escapeHtml(name) + '" type="text" autocomplete="off" value="' + escapeHtml(value) + '"></label>';
  }

  function renderStatCard(label, value) {
    return [
      '<article class="dashboard-stat-card">',
      '<span class="dashboard-stat-card__label">' + escapeHtml(label) + "</span>",
      '<strong class="dashboard-stat-card__value">' + escapeHtml(value) + "</strong>",
      "</article>"
    ].join("");
  }

  function renderInfoCard(label, value) {
    return [
      '<article class="dashboard-info-card">',
      '<span class="dashboard-info-card__label">' + escapeHtml(label) + "</span>",
      '<strong class="dashboard-info-card__value">' + escapeHtml(value) + "</strong>",
      "</article>"
    ].join("");
  }

  function renderChatChip(label, value) {
    return [
      '<article class="dashboard-chat-chip">',
      '<span class="dashboard-chat-chip__label">' + escapeHtml(label) + "</span>",
      '<strong class="dashboard-chat-chip__value">' + escapeHtml(value) + "</strong>",
      "</article>"
    ].join("");
  }

  function submitAccountForm(form) {
    const values = {
      username: normalizeString(form.querySelector("[name='username']").value),
      password: normalizeString(form.querySelector("[name='password']").value),
      welcomeMessage: normalizeString(form.querySelector("[name='welcomeMessage']").value),
      phoneNumber: normalizeString(form.querySelector("[name='phoneNumber']").value),
      permissions: {
        employees: collectPermissionValues(form, "employees"),
        schedule: collectPermissionValues(form, "schedule")
      }
    };

    if (!values.username || !values.password || !values.welcomeMessage) {
      uiState.accountFeedback = { text: t("accountMissing"), type: "error" };
      renderDetailPanel();
      return;
    }

    if (
      (values.permissions.employees.scope === "selected" && !values.permissions.employees.departmentIds.length) ||
      (values.permissions.schedule.scope === "selected" && !values.permissions.schedule.departmentIds.length)
    ) {
      uiState.accountFeedback = { text: t("accountNoDepartments"), type: "error" };
      renderDetailPanel();
      return;
    }

    const result = uiState.accountFormMode === "edit"
      ? authStore.updateAccount(uiState.editingAccountUsername, values)
      : authStore.createAccount(values);

    if (!result.ok) {
      uiState.accountFeedback = {
        text: result.error === "duplicate-account" ? t("accountDuplicate") : t("accountMissing"),
        type: "error"
      };
      renderDetailPanel();
      return;
    }

    uiState.accountFeedback = {
      text: uiState.accountFormMode === "edit" ? t("accountUpdateSuccess") : t("accountSuccess"),
      type: "success"
    };
    uiState.accountFormOpen = false;
    uiState.accountFormMode = "create";
    uiState.editingAccountUsername = "";
    renderAll();
  }

  function collectPermissionValues(form, moduleKey) {
    return {
      access: form.querySelector("[name='" + moduleKey + "Access']").value,
      scope: form.querySelector("[name='" + moduleKey + "Scope']").value,
      departmentIds: Array.prototype.slice.call(form.querySelectorAll("[name='" + moduleKey + "Departments']:checked")).map(function (input) {
        return input.value;
      })
    };
  }

  function getAccountFormValues() {
    const editingAccount = uiState.accountFormMode === "edit" && uiState.editingAccountUsername
      ? authStore.getAccountByUsername(uiState.editingAccountUsername)
      : null;

    if (!editingAccount) {
      return {
        username: "",
        password: "",
        welcomeMessage: "",
        phoneNumber: "",
        permissions: {
          employees: authStore.getModulePermission({ role: "viewer", permissions: null }, "employees"),
          schedule: authStore.getModulePermission({ role: "viewer", permissions: null }, "schedule")
        }
      };
    }

    return {
      username: editingAccount.username,
      password: editingAccount.password,
      welcomeMessage: editingAccount.welcomeMessage,
      phoneNumber: editingAccount.phoneNumber || "",
      permissions: {
        employees: authStore.getModulePermission(editingAccount, "employees"),
        schedule: authStore.getModulePermission(editingAccount, "schedule")
      }
    };
  }

  function getEmployeesState() {
    if (!employeesDataApi || !employeesDataApi.createInitialState) {
      return { departments: [], employees: [] };
    }

    try {
      const parsed = JSON.parse(localStorage.getItem(employeesDataApi.STORAGE_KEY) || "null");
      if (parsed && Array.isArray(parsed.employees)) {
        const mergedState = employeesDataApi.mergeStateWithSeedData
          ? employeesDataApi.mergeStateWithSeedData(parsed)
          : parsed;

        return {
          departments: Array.isArray(mergedState.departments) ? mergedState.departments : employeesDataApi.DEFAULT_DEPARTMENTS,
          employees: mergedState.employees
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

  function getDepartmentCatalog() {
    const state = getEmployeesState();
    return getAccessibleDepartments(currentAccount, "employees", state, false);
  }

  function getAccessibleDepartments(account, moduleKey, employeesState, includeRetired) {
    const state = employeesState || getEmployeesState();
    const departments = (state.departments || []).filter(function (department) {
      return includeRetired || !department.fixed;
    });
    const ids = departments.map(function (department) { return department.id; });
    const allowedIds = authStore.getAccessibleDepartmentIds(account, moduleKey, ids);

    return departments.filter(function (department) {
      return allowedIds.indexOf(department.id) >= 0;
    });
  }

  function getAccessibleEmployees(account, employeesState) {
    const state = employeesState || getEmployeesState();
    const allowedIds = getAccessibleDepartments(account, "employees", state, false).map(function (department) {
      return department.id;
    });

    return (state.employees || []).filter(function (employee) {
      return allowedIds.indexOf(employee.departmentId) >= 0;
    });
  }

  function getVisibleMonthState(scheduleState, monthKey, account) {
    const state = scheduleState || getScheduleState();
    const monthState = state.months && state.months[monthKey] ? state.months[monthKey] : { rows: [] };
    const employeesState = getEmployeesState();
    const departments = getAccessibleDepartments(account, "schedule", employeesState, false);
    const allowedIds = departments.map(function (department) { return department.id; });
    const allowedDepartmentNames = departments.map(function (department) { return department.name; });
    const employeesById = {};

    (employeesState.employees || []).forEach(function (employee) {
      employeesById[String(employee.id || "")] = employee;
    });

    if (authStore.getModulePermission(account, "schedule").scope === "all") {
      return {
        rows: Array.isArray(monthState.rows) ? monthState.rows : []
      };
    }

    return {
      rows: (monthState.rows || []).filter(function (row) {
        const snapshot = row.employeeSnapshot || {};
        const employee = employeesById[String(row.employeeId || snapshot.employeeId || "")] || null;
        if (employee && allowedIds.indexOf(employee.departmentId) >= 0) {
          return true;
        }
        return allowedDepartmentNames.indexOf(snapshot.department) >= 0;
      })
    };
  }

  function getVisibleScheduleDepartmentCount(rows) {
    const names = {};
    (rows || []).forEach(function (row) {
      const name = row && row.employeeSnapshot ? row.employeeSnapshot.department : "";
      if (name) {
        names[name] = true;
      }
    });
    return Object.keys(names).length;
  }

  function getResolvedScheduleMonthKey(scheduleState) {
    const monthKeys = Object.keys(scheduleState.months || {}).sort();
    return monthKeys[0] || buildMonthKey(scheduleState.selectedYear, scheduleState.selectedMonth);
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

  function describePermission(permission, departments) {
    const accessText = permission.access === "edit" ? t("summaryEditor") : t("summaryViewer");
    const scopeText = permission.scope === "all"
      ? t("summaryAll")
      : (
        permission.departmentIds.length
          ? permission.departmentIds.map(function (departmentId) {
              const match = departments.find(function (department) {
                return department.id === departmentId;
              });
              return match ? match.name : departmentId;
            }).join(", ")
          : t("noDepartmentPermission")
      );
    return accessText + " · " + scopeText;
  }

  function resolveActionTooltip(key) {
    if (key.indexOf("common.") === 0) {
      return i18n.t(key);
    }
    return t(key);
  }

  function buildMonthKey(year, month) {
    return String(year) + "-" + String(month).padStart(2, "0");
  }

  function t(key) {
    const locale = i18n.getLocale();
    const bucket = customText[locale] || customText["zh-Hant"];
    return bucket[key] || customText["zh-Hant"][key] || key;
  }

  function normalizeString(value) {
    return String(value || "").trim();
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
