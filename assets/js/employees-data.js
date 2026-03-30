(function () {
  const DEFAULT_INTERFACE_TITLE = "弈鼎員工";
  const DEFAULT_INTERFACE_SUBTITLE = "點擊部門切換名單，拖曳即可重新排序。";
  const DEFAULT_IMAGE_SRC = "../image/logo.png";
  const STORAGE_KEY = "yiding_employees_module_state_v1";

  const DEFAULT_DEPARTMENTS = [
    { id: "dept-accounting", name: "賬房" },
    { id: "dept-venue", name: "場面" },
    { id: "dept-service", name: "服務部" }
  ];

  const RETIRED_DEPARTMENT = { id: "dept-retired", name: "離職", fixed: true };

  const BASE_DEPARTMENT_OPTIONS = [
    "場面",
    "賬房",
    "服務部",
    "人事部",
    "市場部",
    "會計部",
    "其他"
  ];

  const POSITION_OPTIONS = [
    "員工",
    "資深員工",
    "代主任",
    "主任",
    "副經理",
    "部門經理",
    "高級經理",
    "副總監",
    "部門總監"
  ];

  const TITLE_JOB_OPTIONS = [
    "賬房",
    "公關",
    "接待",
    "接駁",
    "司機",
    "行政",
    "主管",
    "其他"
  ];

  const SEX_OPTIONS = ["男", "女", "其他"];
  const STATUS_OPTIONS = ["在職", "離職"];
  const RELATIONSHIP_OPTIONS = ["父親", "母親", "哥哥", "姐姐", "弟弟", "妹妹", "親戚", "朋友", "其他"];
  const ROOM_TYPE_OPTIONS = ["別墅", "員工宿舍"];
  const PHONE_COUNTRY_OPTIONS = [
    "越南 +84",
    "澳門 +853",
    "台灣 +886",
    "香港 +852",
    "中國 +86",
    "韓國 +82",
    "菲律賓 +63",
    "寮國 +856",
    "柬埔寨 +855",
    "馬來西亞 +60",
    "日本 +81"
  ];

  const SORT_OPTIONS = [
    { id: "createdAsc", label: "依新增順序" },
    { id: "positionDesc", label: "依職位高至低" },
    { id: "positionAsc", label: "依職位低至高" },
    { id: "onboardOldest", label: "依入職最早" },
    { id: "onboardNewest", label: "依入職最新" },
    { id: "ageAsc", label: "依年齡由小至大" },
    { id: "ageDesc", label: "依年齡由大至小" },
    { id: "retiredSoonest", label: "依離職最早" }
  ];

  const CARD_FIELD_OPTIONS = [
    { id: "vieName", label: "越文姓名" },
    { id: "engName", label: "英文姓名" },
    { id: "ydiId", label: "弈鼎編號" },
    { id: "haId", label: "HA 編號" },
    { id: "position", label: "職位" },
    { id: "titleJob", label: "職務" },
    { id: "phoneNumber", label: "電話號碼" },
    { id: "dateOfBirth", label: "出生日期" },
    { id: "onboardDate", label: "入職日期" },
    { id: "nationality", label: "國籍" },
    { id: "status", label: "狀態" },
    { id: "lastDay", label: "最後工作日" }
  ];

  const SEED_EMPLOYEES = [
    {
      id: "employee-001",
      createdAt: 1,
      departmentId: "dept-accounting",
      avatarSrc: DEFAULT_IMAGE_SRC,
      avatarChanged: false,
      basic: {
        vieName: "阮氏金妝",
        engName: "CANDY",
        ydiId: "YDI-0001",
        haId: "HA-221",
        sex: "女",
        dateOfBirth: { year: "1992", month: "09", day: "16" },
        age: "",
        zodiac: "",
        nationality: "越南",
        language: "越南語 / 中文"
      },
      contact: {
        phoneNumber: { countryCode: "越南 +84", number: "0911 223 344" },
        emergencyPhone: { countryCode: "越南 +84", number: "912 888 199" },
        emergencyRelationship: { preset: "母親", other: "" },
        email: "candy@yiding.local",
        nationId: "VN0921200",
        placeOfOrigin: "胡志明市",
        placeOfResidence: "芽莊"
      },
      work: {
        department: { preset: "賬房", other: "" },
        position: "主任",
        titleJob: { preset: "賬房", other: "" },
        directBoss: "阿傑",
        recruitmentDept: "人事部",
        status: "在職",
        onboardDate: { year: "2024", month: "03", day: "04" },
        probationDays: "30",
        probEndDate: { year: "", month: "", day: "" },
        officialDate: { year: "", month: "", day: "" },
        roomNumber: { type: "別墅", value: "A-12" },
        lastDay: { year: "", month: "", day: "" }
      },
      bank: {
        bankNumber: "001-882211",
        bankName: "越南工商銀行",
        probationSalary: "18000",
        officialSalary: "22000"
      },
      other: {
        attachments: [],
        remark: "熟悉賬務流程。"
      }
    },
    {
      id: "employee-002",
      createdAt: 2,
      departmentId: "dept-service",
      avatarSrc: DEFAULT_IMAGE_SRC,
      avatarChanged: false,
      basic: {
        vieName: "陳氏蓮",
        engName: "ALICE",
        ydiId: "YDI-0002",
        haId: "HA-345",
        sex: "女",
        dateOfBirth: { year: "2000", month: "08", day: "18" },
        age: "",
        zodiac: "",
        nationality: "越南",
        language: "越南語 / 中文"
      },
      contact: {
        phoneNumber: { countryCode: "越南 +84", number: "0908 777 991" },
        emergencyPhone: { countryCode: "越南 +84", number: "0901 000 998" },
        emergencyRelationship: { preset: "姐姐", other: "" },
        email: "alice@yiding.local",
        nationId: "VN222880",
        placeOfOrigin: "同奈",
        placeOfResidence: "芽莊"
      },
      work: {
        department: { preset: "服務部", other: "" },
        position: "資深員工",
        titleJob: { preset: "接待", other: "" },
        directBoss: "Mia",
        recruitmentDept: "市場部",
        status: "在職",
        onboardDate: { year: "2025", month: "01", day: "10" },
        probationDays: "45",
        probEndDate: { year: "", month: "", day: "" },
        officialDate: { year: "", month: "", day: "" },
        roomNumber: { type: "員工宿舍", value: "B-05" },
        lastDay: { year: "", month: "", day: "" }
      },
      bank: {
        bankNumber: "220-991188",
        bankName: "ACB",
        probationSalary: "15000",
        officialSalary: "18000"
      },
      other: {
        attachments: [],
        remark: "負責前線接待。"
      }
    },
    {
      id: "employee-003",
      createdAt: 3,
      departmentId: "dept-venue",
      avatarSrc: DEFAULT_IMAGE_SRC,
      avatarChanged: false,
      basic: {
        vieName: "黃文明",
        engName: "LEO",
        ydiId: "YDI-0003",
        haId: "HA-188",
        sex: "男",
        dateOfBirth: { year: "1996", month: "04", day: "02" },
        age: "",
        zodiac: "",
        nationality: "越南",
        language: "越南語 / 英語"
      },
      contact: {
        phoneNumber: { countryCode: "越南 +84", number: "0912 112 233" },
        emergencyPhone: { countryCode: "越南 +84", number: "0933 889 221" },
        emergencyRelationship: { preset: "父親", other: "" },
        email: "leo@yiding.local",
        nationId: "VN887733",
        placeOfOrigin: "河內",
        placeOfResidence: "芽莊"
      },
      work: {
        department: { preset: "場面", other: "" },
        position: "副經理",
        titleJob: { preset: "主管", other: "" },
        directBoss: "Tom",
        recruitmentDept: "人事部",
        status: "在職",
        onboardDate: { year: "2023", month: "10", day: "09" },
        probationDays: "60",
        probEndDate: { year: "", month: "", day: "" },
        officialDate: { year: "", month: "", day: "" },
        roomNumber: { type: "別墅", value: "C-08" },
        lastDay: { year: "", month: "", day: "" }
      },
      bank: {
        bankNumber: "551-331100",
        bankName: "Vietcombank",
        probationSalary: "24000",
        officialSalary: "30000"
      },
      other: {
        attachments: [],
        remark: "現場管理經驗完整。"
      }
    },
    {
      id: "employee-004",
      createdAt: 4,
      departmentId: "dept-service",
      avatarSrc: DEFAULT_IMAGE_SRC,
      avatarChanged: false,
      basic: {
        vieName: "黎海英",
        engName: "MAY",
        ydiId: "YDI-0004",
        haId: "HA-902",
        sex: "女",
        dateOfBirth: { year: "1998", month: "12", day: "25" },
        age: "",
        zodiac: "",
        nationality: "越南",
        language: "越南語 / 中文 / 英語"
      },
      contact: {
        phoneNumber: { countryCode: "越南 +84", number: "936 552 889" },
        emergencyPhone: { countryCode: "越南 +84", number: "0981 115 779" },
        emergencyRelationship: { preset: "朋友", other: "" },
        email: "may@yiding.local",
        nationId: "VN112288",
        placeOfOrigin: "大叻",
        placeOfResidence: "芽莊"
      },
      work: {
        department: { preset: "服務部", other: "" },
        position: "員工",
        titleJob: { preset: "公關", other: "" },
        directBoss: "Mia",
        recruitmentDept: "市場部",
        status: "離職",
        onboardDate: { year: "2024", month: "07", day: "12" },
        probationDays: "30",
        probEndDate: { year: "", month: "", day: "" },
        officialDate: { year: "", month: "", day: "" },
        roomNumber: { type: "員工宿舍", value: "B-09" },
        lastDay: { year: "2026", month: "03", day: "20" }
      },
      bank: {
        bankNumber: "998-712233",
        bankName: "Sacombank",
        probationSalary: "12000",
        officialSalary: "15000"
      },
      other: {
        attachments: [],
        remark: "已完成離職交接。"
      }
    }
  ];

  function cloneValue(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createEmptyDateParts() {
    return { year: "", month: "", day: "" };
  }

  function createTodayDateParts() {
    const now = new Date();

    return {
      year: String(now.getFullYear()),
      month: String(now.getMonth() + 1).padStart(2, "0"),
      day: String(now.getDate()).padStart(2, "0")
    };
  }

  function createEmptyEmployeeDraft(departmentName) {
    const today = createTodayDateParts();

    return {
      id: "",
      createdAt: 0,
      departmentId: "",
      avatarSrc: DEFAULT_IMAGE_SRC,
      avatarChanged: false,
      basic: {
        vieName: "",
        engName: "",
        ydiId: "",
        haId: "",
        sex: "",
        dateOfBirth: cloneValue(today),
        age: "",
        zodiac: "",
        nationality: "",
        language: ""
      },
      contact: {
        phoneNumber: { countryCode: PHONE_COUNTRY_OPTIONS[0], number: "" },
        emergencyPhone: { countryCode: PHONE_COUNTRY_OPTIONS[0], number: "" },
        emergencyRelationship: { preset: "父親", other: "" },
        email: "",
        nationId: "",
        placeOfOrigin: "",
        placeOfResidence: ""
      },
      work: {
        department: { preset: departmentName || "", other: "" },
        position: "員工",
        titleJob: { preset: "賬房", other: "" },
        directBoss: "",
        recruitmentDept: "",
        status: "在職",
        onboardDate: cloneValue(today),
        probationDays: "",
        probEndDate: cloneValue(today),
        officialDate: cloneValue(today),
        roomNumber: { type: "別墅", value: "" },
        lastDay: cloneValue(today)
      },
      bank: {
        bankNumber: "",
        bankName: "",
        probationSalary: "",
        officialSalary: ""
      },
      other: {
        attachments: [],
        remark: ""
      }
    };
  }

  function createInitialTabsByDepartment() {
    return {
      "dept-accounting": [],
      "dept-venue": [],
      "dept-service": []
    };
  }

  function createInitialState() {
    return {
      interfaceMeta: {
        title: DEFAULT_INTERFACE_TITLE,
        subtitle: DEFAULT_INTERFACE_SUBTITLE,
        iconSrc: DEFAULT_IMAGE_SRC,
        customIcon: false
      },
      departments: cloneValue(DEFAULT_DEPARTMENTS),
      selectedDepartmentId: DEFAULT_DEPARTMENTS[0].id,
      tabsByDepartment: createInitialTabsByDepartment(),
      activeTabByDepartment: {},
      employees: cloneValue(SEED_EMPLOYEES),
      cardDisplay: {
        titleField: "engName",
        extraFieldIds: ["vieName", "position"]
      },
      sortMode: "createdAsc",
      searchQuery: "",
      filters: {
        position: "全部",
        status: "全部"
      }
    };
  }

  window.YiDingEmployeesData = {
    DEFAULT_INTERFACE_TITLE: DEFAULT_INTERFACE_TITLE,
    DEFAULT_INTERFACE_SUBTITLE: DEFAULT_INTERFACE_SUBTITLE,
    DEFAULT_IMAGE_SRC: DEFAULT_IMAGE_SRC,
    STORAGE_KEY: STORAGE_KEY,
    DEFAULT_DEPARTMENTS: DEFAULT_DEPARTMENTS,
    RETIRED_DEPARTMENT: RETIRED_DEPARTMENT,
    BASE_DEPARTMENT_OPTIONS: BASE_DEPARTMENT_OPTIONS,
    POSITION_OPTIONS: POSITION_OPTIONS,
    TITLE_JOB_OPTIONS: TITLE_JOB_OPTIONS,
    SEX_OPTIONS: SEX_OPTIONS,
    STATUS_OPTIONS: STATUS_OPTIONS,
    RELATIONSHIP_OPTIONS: RELATIONSHIP_OPTIONS,
    ROOM_TYPE_OPTIONS: ROOM_TYPE_OPTIONS,
    PHONE_COUNTRY_OPTIONS: PHONE_COUNTRY_OPTIONS,
    SORT_OPTIONS: SORT_OPTIONS,
    CARD_FIELD_OPTIONS: CARD_FIELD_OPTIONS,
    SEED_EMPLOYEES: SEED_EMPLOYEES,
    cloneValue: cloneValue,
    createEmptyDateParts: createEmptyDateParts,
    createTodayDateParts: createTodayDateParts,
    createEmptyEmployeeDraft: createEmptyEmployeeDraft,
    createInitialState: createInitialState
  };
})();
