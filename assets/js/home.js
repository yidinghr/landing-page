(function () {
  const i18n = window.YiDingI18n || null;
  const authStore = window.YiDingAuthStore || null;
  const employeesDataApi = window.YiDingEmployeesData || null;
  const SCHEDULE_STORAGE_KEY = "yiding_schedule_module_v3";
  const HOME_TAB_STORAGE_KEY = "yiding_dashboard_active_tab_v2";
  const REDIRECT_TO_LOGIN = "../index.html";
  const CHI_CHI_URL = "http://46.225.160.243";
  const ROLE_OWNER = "owner";
  const SHIFT_CODE_DEFINITIONS = Object.freeze([
    { code: "A", checkIn: "7", checkOut: "15", hoursPay: 8 },
    { code: "A1", checkIn: "8", checkOut: "16", hoursPay: 8 },
    { code: "A2", checkIn: "9", checkOut: "17", hoursPay: 8 },
    { code: "A3", checkIn: "10", checkOut: "18", hoursPay: 8 },
    { code: "A4", checkIn: "11", checkOut: "19", hoursPay: 8 },
    { code: "A5", checkIn: "12", checkOut: "20", hoursPay: 8 },
    { code: "A6", checkIn: "13", checkOut: "21", hoursPay: 8 },
    { code: "A7", checkIn: "14", checkOut: "22", hoursPay: 8 },
    { code: "B", checkIn: "15", checkOut: "23", hoursPay: 8 },
    { code: "B1", checkIn: "16", checkOut: "0", hoursPay: 8 },
    { code: "B2", checkIn: "17", checkOut: "1", hoursPay: 8 },
    { code: "B3", checkIn: "18", checkOut: "2", hoursPay: 8 },
    { code: "B4", checkIn: "19", checkOut: "3", hoursPay: 8 },
    { code: "B5", checkIn: "20", checkOut: "4", hoursPay: 8 },
    { code: "B6", checkIn: "21", checkOut: "5", hoursPay: 8 },
    { code: "B7", checkIn: "22", checkOut: "6", hoursPay: 8 },
    { code: "C", checkIn: "23", checkOut: "7", hoursPay: 8 },
    { code: "C1", checkIn: "0", checkOut: "8", hoursPay: 8 },
    { code: "C2", checkIn: "1", checkOut: "9", hoursPay: 8 },
    { code: "C3", checkIn: "2", checkOut: "10", hoursPay: 8 },
    { code: "C4", checkIn: "3", checkOut: "11", hoursPay: 8 },
    { code: "C5", checkIn: "4", checkOut: "12", hoursPay: 8 },
    { code: "C6", checkIn: "5", checkOut: "13", hoursPay: 8 },
    { code: "C7", checkIn: "6", checkOut: "14", hoursPay: 8 }
  ]);
  const SHIFT_CODE_MAP = SHIFT_CODE_DEFINITIONS.reduce(function (result, item) {
    result[item.code] = item;
    return result;
  }, {});

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
      scheduleLiveTitle: "當前在崗",
      scheduleOnShiftNow: "當前上班人數",
      scheduleActiveDepartments: "當前啟用部門",
      scheduleCurrentTime: "現在時間",
      scheduleCurrentDate: "對應日期",
      scheduleLiveHint: "依照目前時間比對 A / B / C 系列班碼，跨夜班也會接續前一天的班別。",
      scheduleLiveEmpty: "現在沒有任何員工處於班內。",
      scheduleDepartmentActive: "在崗部門",
      scheduleAssignedDays: "已排 {count} 天",
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
      help: "Hướng dẫn",
      logout: "Đăng xuất",
      roleAdmin: "Tài khoản admin",
      roleViewer: "Tài khoản thường",
      roleOwner: "Owner / chủ Chi Chi",
      readOnly: "Chỉ xem",
      editable: "Chỉnh sửa",
      allDepartments: "Tất cả bộ phận",
      selectedDepartments: "Bộ phận chỉ định",
      menuEmployees: "Nhân viên",
      menuSchedule: "Ca làm",
      menuAttendance: "Chấm công",
      menuInfo: "Thông tin YiDing",
      menuAccounts: "Quản lý tài khoản",
      menuChiChi: "Chi Chi",
      employeesTitle: "Tổng quan nhân viên",
      employeesHintAdmin: "Dữ liệu nhân viên đầy đủ vẫn nằm ở module cũ; khu này chỉ hiện tổng quan và lối tắt.",
      employeesHintViewer: "Tài khoản này chỉ thấy các bộ phận và nhân viên được cấp quyền.",
      employeesDepartment: "Bộ phận",
      employeesEmpty: "Không có nhân viên nào trong phạm vi quyền hiện tại.",
      employeesStatActive: "Nhân viên đang làm",
      employeesStatRetired: "Nhân viên đã nghỉ",
      employeesStatDepartments: "Bộ phận có thể xem",
      employeesStatSelected: "Bộ phận đang chọn",
      employeesOpen: "Mở module nhân viên đầy đủ",
      scheduleTitle: "Tổng quan ca làm",
      scheduleHintAdmin: "Logic xếp ca đầy đủ vẫn ở module cũ; khu này chỉ hiện tóm tắt và lối vào.",
      scheduleHintViewer: "Tài khoản này chỉ xem lịch theo quyền, không được sửa ngoài phạm vi quyền.",
      scheduleMonth: "Tháng",
      scheduleEmpty: "Hiện tại không có dữ liệu ca làm để hiển thị.",
      scheduleRows: "Số dòng có thể xem",
      scheduleAssignments: "Ô đã xếp ca",
      scheduleVisibleDepartments: "Bộ phận có thể xem",
      scheduleLiveTitle: "Nhân sự đang trên ca",
      scheduleOnShiftNow: "Đang trên ca",
      scheduleActiveDepartments: "Bộ phận đang hoạt động",
      scheduleCurrentTime: "Thời điểm hiện tại",
      scheduleCurrentDate: "Ngày đối chiếu",
      scheduleLiveHint: "Tự đối chiếu theo giờ hiện tại với các mã ca A / B / C và cả các ca qua đêm.",
      scheduleLiveEmpty: "Hiện tại không có nhân viên nào đang ở trên ca.",
      scheduleDepartmentActive: "Bộ phận đang trên ca",
      scheduleAssignedDays: "Đã xếp {count} ngày",
      scheduleOpen: "Mở module ca làm đầy đủ",
      attendanceTitle: "Khu chấm công",
      attendanceBody: "Để dành cho phần kết nối chấm công, bất thường và tổng hợp sau này.",
      infoTitle: "Thông tin YiDing",
      infoBody: "Để dành cho thông báo, SOP và cổng vào tri thức nội bộ.",
      accountsTitle: "Quản lý tài khoản",
      accountsHint: "YiDing Admin có thể tạo, sửa tài khoản và quyền truy cập. Tạo xong đăng nhập được ngay.",
      accountsAdd: "Thêm tài khoản",
      accountsHide: "Ẩn form",
      accountEdit: "Sửa tài khoản",
      accountSave: "Lưu thay đổi",
      accountCreate: "Tạo tài khoản",
      accountCancel: "Hủy",
      accountUsername: "Tài khoản",
      accountPassword: "Mật khẩu",
      accountWelcome: "Lời chào đăng nhập",
      accountPhone: "Số điện thoại liên kết",
      accountEmployeesPermission: "Quyền module nhân viên",
      accountSchedulePermission: "Quyền module ca làm",
      accountDepartments: "Bộ phận được cấp quyền",
      accountSuccess: "Đã tạo tài khoản, hiện có thể đăng nhập ngay.",
      accountUpdateSuccess: "Đã cập nhật tài khoản.",
      accountDuplicate: "Tài khoản này đã tồn tại, hãy đổi tên khác.",
      accountMissing: "Vẫn còn trường bắt buộc chưa điền.",
      accountCurrent: "Tài khoản đang đăng nhập",
      accountNoDepartments: "Hãy chọn ít nhất 1 bộ phận, hoặc đổi về tất cả bộ phận.",
      accountViewer: "Tài khoản thường",
      accountModuleView: "Chỉ xem",
      accountModuleEdit: "Được sửa",
      currentBinding: "Đang liên kết",
      phoneEmpty: "Chưa liên kết số điện thoại",
      chiChiTitle: "Trung tâm Chi Chi",
      chiChiBadge: "External",
      chiChiPrimary: "Lối vào đối thoại Chi Chi",
      chiChiBody: "Bản production hiện chỉ mở an toàn cửa sổ Chi Chi bên ngoài từ đây; muốn nhúng trực tiếp vào trang này thì vẫn cần HTTPS hoặc reverse proxy.",
      chiChiOwner: "YiDing Admin sẽ được xem như owner.",
      chiChiOpen: "Mở Chi Chi trong tab mới",
      chiChiWarning: "VPS Chi Chi hiện chỉ có HTTP, trình duyệt sẽ chặn việc nhúng trực tiếp từ trang HTTPS.",
      openModule: "Mở module đầy đủ",
      permissionScope: "Phạm vi quyền",
      permissionAccess: "Mức thao tác",
      permissionDepartments: "Bộ phận được cấp quyền",
      summaryViewer: "Chỉ xem",
      summaryEditor: "Được sửa",
      summaryAll: "Tất cả bộ phận",
      summarySelected: "Bộ phận chỉ định",
      noDepartmentPermission: "Chưa được cấp quyền bộ phận nào"
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
      scheduleLiveTitle: "Currently On Shift",
      scheduleOnShiftNow: "On Shift Now",
      scheduleActiveDepartments: "Active Departments",
      scheduleCurrentTime: "Current Time",
      scheduleCurrentDate: "Matched Date",
      scheduleLiveHint: "Resolved against the current time with A / B / C shift codes, including overnight carryovers.",
      scheduleLiveEmpty: "No employees are currently on shift.",
      scheduleDepartmentActive: "Departments On Shift",
      scheduleAssignedDays: "Assigned {count} days",
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
      const liveSchedule = getCurrentLiveSchedule(currentAccount);

      chatTitle.textContent = t("scheduleLiveTitle");
      chatBadge.textContent = liveSchedule.timeLabel;
      chatBody.innerHTML = [
        '<div class="dashboard-chat-stack">',
        '<section class="dashboard-chat-surface dashboard-chat-surface--live">',
        '<h3 class="dashboard-chat-surface__title">' + escapeHtml(t("scheduleLiveTitle")) + "</h3>",
        '<p class="dashboard-chat-surface__hint">' + escapeHtml(t("scheduleLiveHint")) + "</p>",
        '<div class="dashboard-chat-chip-grid">',
        renderChatChip(t("scheduleOnShiftNow"), String(liveSchedule.staff.length)),
        renderChatChip(t("scheduleActiveDepartments"), String(liveSchedule.departments.length)),
        renderChatChip(t("scheduleCurrentDate"), liveSchedule.dateLabel),
        renderChatChip(t("scheduleCurrentTime"), liveSchedule.timeLabel),
        "</div>",
        "</section>",
        liveSchedule.staff.length
          ? '<section class="dashboard-chat-surface"><h4 class="dashboard-chat-surface__subhead">' + escapeHtml(t("scheduleDepartmentActive")) + '</h4><div class="dashboard-live-groups">' + liveSchedule.departments.map(function (department) {
              return [
                '<article class="dashboard-live-group">',
                '<div class="dashboard-live-group__head">',
                '<strong class="dashboard-live-group__title">' + escapeHtml(department.name) + "</strong>",
                '<span class="dashboard-role-badge">' + escapeHtml(String(department.members.length)) + "</span>",
                "</div>",
                '<div class="dashboard-live-group__members">' + department.members.map(function (member) {
                  const secondary = member.position ? member.position + " · " + member.code : member.code;
                  return [
                    '<div class="dashboard-live-member">',
                    '<strong>' + escapeHtml(member.name) + "</strong>",
                    '<span>' + escapeHtml(secondary) + "</span>",
                    "</div>"
                  ].join("");
                }).join("") + "</div>",
                "</article>"
              ].join("");
            }).join("") + "</div></section>"
          : '<section class="dashboard-chat-surface"><div class="dashboard-empty">' + escapeHtml(t("scheduleLiveEmpty")) + "</div></section>",
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
              '<span>' + escapeHtml(t("scheduleAssignedDays", { count: Object.keys(shifts).length })) + "</span>",
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

  function normalizeShiftCode(value) {
    return normalizeString(value).toUpperCase();
  }

  function parseShiftHour(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function getShiftWindow(code) {
    const definition = SHIFT_CODE_MAP[normalizeShiftCode(code)];
    if (!definition || Number(definition.hoursPay || 0) <= 0) {
      return null;
    }

    const startHour = parseShiftHour(definition.checkIn);
    const endHour = parseShiftHour(definition.checkOut);

    if (startHour === null || endHour === null) {
      return null;
    }

    return {
      code: definition.code,
      startMinutes: startHour * 60,
      endMinutes: endHour * 60,
      overnight: endHour <= startHour
    };
  }

  function formatClock(date) {
    return String(date.getHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0");
  }

  function formatDateLabel(date) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");
  }

  function collectLiveMembers(liveMap, monthState, dayNumber, currentMinutes, sourceType) {
    (monthState.rows || []).forEach(function (row) {
      const shifts = row && row.shifts ? row.shifts : {};
      const code = normalizeShiftCode(shifts[String(dayNumber)]);
      const window = getShiftWindow(code);
      const snapshot = row && row.employeeSnapshot ? row.employeeSnapshot : {};

      if (!window) {
        return;
      }

      const isActive = sourceType === "carry"
        ? window.overnight && currentMinutes < window.endMinutes
        : (
            window.overnight
              ? currentMinutes >= window.startMinutes
              : currentMinutes >= window.startMinutes && currentMinutes < window.endMinutes
          );

      if (!isActive) {
        return;
      }

      const memberKey = String(row.employeeId || snapshot.employeeId || snapshot.ydiId || row.id || "");
      liveMap[memberKey] = {
        id: memberKey,
        code: window.code,
        department: normalizeString(snapshot.department),
        name: normalizeString(snapshot.engName) || normalizeString(snapshot.vieName) || normalizeString(snapshot.ydiId) || memberKey,
        secondaryName: normalizeString(snapshot.vieName),
        position: normalizeString(snapshot.position),
        sourceType: sourceType
      };
    });
  }

  function getCurrentLiveSchedule(account) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const currentMonthKey = buildMonthKey(now.getFullYear(), now.getMonth() + 1);
    const previousDate = new Date(now.getTime());
    previousDate.setDate(now.getDate() - 1);
    const previousMonthKey = buildMonthKey(previousDate.getFullYear(), previousDate.getMonth() + 1);
    const liveMap = {};

    collectLiveMembers(liveMap, getVisibleMonthState(getScheduleState(), previousMonthKey, account), previousDate.getDate(), currentMinutes, "carry");
    collectLiveMembers(liveMap, getVisibleMonthState(getScheduleState(), currentMonthKey, account), now.getDate(), currentMinutes, "current");

    const staff = Object.keys(liveMap).map(function (key) {
      return liveMap[key];
    }).sort(function (left, right) {
      const departmentCompare = left.department.localeCompare(right.department);
      return departmentCompare || left.name.localeCompare(right.name);
    });

    const groupedDepartments = {};
    staff.forEach(function (member) {
      const departmentName = member.department || t("noDepartmentPermission");
      if (!groupedDepartments[departmentName]) {
        groupedDepartments[departmentName] = [];
      }
      groupedDepartments[departmentName].push(member);
    });

    return {
      now: now,
      timeLabel: formatClock(now),
      dateLabel: formatDateLabel(now),
      staff: staff,
      departments: Object.keys(groupedDepartments).sort().map(function (name) {
        return {
          name: name,
          members: groupedDepartments[name]
        };
      })
    };
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

  function t(key, params) {
    const locale = i18n.getLocale();
    const bucket = customText[locale] || customText["zh-Hant"];
    const template = bucket[key] || customText["zh-Hant"][key] || key;
    if (!params) {
      return template;
    }
    return String(template).replace(/\{([^}]+)\}/g, function (_, token) {
      return params[token] !== undefined ? String(params[token]) : "";
    });
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
