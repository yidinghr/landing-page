(function () {
  const dataApi = window.YiDingEmployeesData;
  const currentYear = new Date().getFullYear();

  const EMPLOYEE_FORM_SECTIONS = [
    {
      id: "basic",
      title: "基本資料",
      fields: [
        { type: "text", path: "basic.vieName", label: "Vie Name" },
        { type: "text", path: "basic.engName", label: "Eng Name" },
        { type: "text", path: "basic.ydiId", label: "YDI ID" },
        { type: "text", path: "basic.haId", label: "HA ID" },
        { type: "select", path: "basic.sex", label: "Sex", options: dataApi.SEX_OPTIONS },
        { type: "dateTriple", path: "basic.dateOfBirth", label: "Date of birth", startYear: 1960, endYear: currentYear },
        { type: "computed", path: "basic.age", label: "Age" },
        { type: "computed", path: "basic.zodiac", label: "Zodiac" },
        { type: "text", path: "basic.nationality", label: "Nationality" },
        { type: "text", path: "basic.language", label: "Language" }
      ]
    },
    {
      id: "contact",
      title: "聯絡資料",
      fields: [
        { type: "phone", path: "contact.phoneNumber", label: "Phone Number" },
        { type: "phone", path: "contact.emergencyPhone", label: "Emergency phone" },
        { type: "relationship", path: "contact.emergencyRelationship", label: "Emergency Relationship" },
        { type: "text", path: "contact.email", label: "Email" },
        { type: "text", path: "contact.nationId", label: "Nation ID" },
        { type: "text", path: "contact.placeOfOrigin", label: "Place of origin" },
        { type: "text", path: "contact.placeOfResidence", label: "Place of residence" }
      ]
    },
    {
      id: "work",
      title: "工作資料",
      fields: [
        { type: "selectOther", path: "work.department", label: "Department", options: dataApi.BASE_DEPARTMENT_OPTIONS },
        { type: "select", path: "work.position", label: "Position", options: dataApi.POSITION_OPTIONS },
        { type: "selectOther", path: "work.titleJob", label: "Title Job", options: dataApi.TITLE_JOB_OPTIONS },
        { type: "text", path: "work.directBoss", label: "Direct Boss" },
        { type: "text", path: "work.recruitmentDept", label: "Recruitment Dept" },
        { type: "status", path: "work.status", label: "Status" },
        { type: "dateTriple", path: "work.onboardDate", label: "Onboard date", startYear: 2020, endYear: currentYear + 1 },
        { type: "select", path: "work.probationDays", label: "Probation Days", options: createNumberOptions(1, 200) },
        { type: "dateTriple", path: "work.probEndDate", label: "Prob End Date", startYear: 2020, endYear: currentYear + 2 },
        { type: "dateTriple", path: "work.officialDate", label: "Official date", startYear: 2020, endYear: currentYear + 2 },
        { type: "room", path: "work.roomNumber", label: "Room Number" }
      ]
    },
    {
      id: "bank",
      title: "銀行資料",
      fields: [
        { type: "text", path: "bank.bankNumber", label: "Bank Number" },
        { type: "text", path: "bank.bankName", label: "Bank Name" },
        { type: "text", path: "bank.probationSalary", label: "Probation Salary" },
        { type: "text", path: "bank.officialSalary", label: "Official Salary" }
      ]
    },
    {
      id: "other",
      title: "其他",
      fields: [
        { type: "file", path: "other.employeesFileData", label: "Employees' file" },
        { type: "textarea", path: "other.remark", label: "Remark", placeholder: "请输⼊数据" }
      ]
    }
  ];

  function createNumberOptions(start, end) {
    const values = [];
    let current = start;

    while (current <= end) {
      values.push(String(current));
      current += 1;
    }

    return values;
  }

  function cloneDraft(draft) {
    return dataApi.cloneValue(draft);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getValueAtPath(target, path) {
    return path.split(".").reduce(function (current, key) {
      return current ? current[key] : undefined;
    }, target);
  }

  function setValueAtPath(target, path, value) {
    const pathParts = path.split(".");
    const lastKey = pathParts.pop();
    const destination = pathParts.reduce(function (current, key) {
      if (!current[key]) {
        current[key] = {};
      }

      return current[key];
    }, target);

    destination[lastKey] = value;
  }

  function createDateFromParts(parts) {
    if (!parts || !parts.year || !parts.month || !parts.day) {
      return null;
    }

    const year = Number(parts.year);
    const month = Number(parts.month);
    const day = Number(parts.day);

    if (!year || !month || !day) {
      return null;
    }

    const date = new Date(year, month - 1, day);

    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return null;
    }

    return date;
  }

  function createDatePartsFromDate(date) {
    if (!(date instanceof Date)) {
      return dataApi.createEmptyDateParts();
    }

    return {
      year: String(date.getFullYear()),
      month: String(date.getMonth() + 1).padStart(2, "0"),
      day: String(date.getDate()).padStart(2, "0")
    };
  }

  function addDays(date, amount) {
    const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    next.setDate(next.getDate() + amount);
    return next;
  }

  function calculateAge(parts) {
    const birthday = createDateFromParts(parts);

    if (!birthday) {
      return "";
    }

    const now = new Date();
    let age = now.getFullYear() - birthday.getFullYear();
    const monthOffset = now.getMonth() - birthday.getMonth();

    if (monthOffset < 0 || (monthOffset === 0 && now.getDate() < birthday.getDate())) {
      age -= 1;
    }

    return age >= 0 ? String(age) : "";
  }

  function getZodiac(parts) {
    const date = createDateFromParts(parts);

    if (!date) {
      return "";
    }

    const month = date.getMonth() + 1;
    const day = date.getDate();

    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
      return "♈ 牡羊";
    }

    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
      return "♉ 金牛";
    }

    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
      return "♊ 雙子";
    }

    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
      return "♋ 巨蟹";
    }

    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
      return "♌ 獅子";
    }

    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
      return "♍ 處女";
    }

    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
      return "♎ 天秤";
    }

    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
      return "♏ 天蠍";
    }

    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
      return "♐ 射手";
    }

    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
      return "♑ 摩羯";
    }

    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
      return "♒ 水瓶";
    }

    return "♓ 雙魚";
  }

  function syncEmploymentDates(draft) {
    const work = draft.work;
    const onboardDate = createDateFromParts(work.onboardDate);
    const probationDays = Number(work.probationDays);
    const probEndDate = createDateFromParts(work.probEndDate);
    const officialDate = createDateFromParts(work.officialDate);

    if (onboardDate && probationDays && !probEndDate) {
      work.probEndDate = createDatePartsFromDate(addDays(onboardDate, probationDays - 1));
    }

    if (onboardDate && probEndDate && !probationDays) {
      work.probationDays = String(Math.round((probEndDate - onboardDate) / 86400000) + 1);
    }

    if (onboardDate && officialDate && !probEndDate) {
      work.probEndDate = createDatePartsFromDate(addDays(officialDate, -1));
    }

    if (!onboardDate && probEndDate && probationDays) {
      work.onboardDate = createDatePartsFromDate(addDays(probEndDate, -(probationDays - 1)));
    }

    if (!onboardDate && officialDate && probationDays) {
      work.onboardDate = createDatePartsFromDate(addDays(officialDate, -probationDays));
    }

    if (createDateFromParts(work.probEndDate) && !createDateFromParts(work.officialDate)) {
      work.officialDate = createDatePartsFromDate(addDays(createDateFromParts(work.probEndDate), 1));
    }

    if (!createDateFromParts(work.probEndDate) && createDateFromParts(work.officialDate)) {
      work.probEndDate = createDatePartsFromDate(addDays(createDateFromParts(work.officialDate), -1));
    }
  }

  function applyDerivedFields(draft) {
    const nextDraft = cloneDraft(draft);

    nextDraft.basic.age = calculateAge(nextDraft.basic.dateOfBirth);
    nextDraft.basic.zodiac = getZodiac(nextDraft.basic.dateOfBirth);
    syncEmploymentDates(nextDraft);

    if (nextDraft.work.status !== "離職") {
      nextDraft.work.lastDay = dataApi.createEmptyDateParts();
    }

    return nextDraft;
  }

  function formatDateParts(parts) {
    if (!parts || !parts.year || !parts.month || !parts.day) {
      return "未設定";
    }

    return [parts.year, parts.month, parts.day].join("-");
  }

  function getFieldDisplayValue(employee, fieldId) {
    switch (fieldId) {
      case "vieName":
        return employee.basic.vieName || "未設定";
      case "engName":
        return employee.basic.engName || "未設定";
      case "ydiId":
        return employee.basic.ydiId || "未設定";
      case "haId":
        return employee.basic.haId || "未設定";
      case "position":
        return employee.work.position || "未設定";
      case "titleJob":
        return employee.work.titleJob.preset === "其他" ? employee.work.titleJob.other || "其他" : employee.work.titleJob.preset || "未設定";
      case "phoneNumber":
        return employee.contact.phoneNumber.value || "未設定";
      case "dateOfBirth":
        return formatDateParts(employee.basic.dateOfBirth);
      case "onboardDate":
        return formatDateParts(employee.work.onboardDate);
      case "nationality":
        return employee.basic.nationality || "未設定";
      case "status":
        return employee.work.status || "未設定";
      case "lastDay":
        return formatDateParts(employee.work.lastDay);
      default:
        return "未設定";
    }
  }

  function hasMeaningfulEmployeeData(draft) {
    return [
      draft.basic.vieName,
      draft.basic.engName,
      draft.basic.ydiId,
      draft.contact.phoneNumber.value,
      draft.work.directBoss,
      draft.other.remark
    ].some(function (value) {
      return String(value || "").trim() !== "";
    });
  }

  function renderOptionList(options, selectedValue) {
    return options.map(function (optionValue) {
      const value = typeof optionValue === "string" ? optionValue : optionValue.id;
      const label = typeof optionValue === "string" ? optionValue : optionValue.label;
      const selected = value === selectedValue ? " selected" : "";

      return '<option value="' + escapeHtml(value) + '"' + selected + ">" + escapeHtml(label) + "</option>";
    }).join("");
  }

  function renderDateTripleField(field, value, disabled) {
    const years = [];
    const startYear = field.startYear || 1990;
    const endYear = field.endYear || currentYear + 1;
    let year = startYear;

    while (year <= endYear) {
      years.push(String(year));
      year += 1;
    }

    return [
      '<div class="employee-form__date-grid">',
      '<select data-path="' + escapeHtml(field.path) + '.year"' + (disabled ? " disabled" : "") + '><option value="">年</option>' + renderOptionList(years, value.year) + "</select>",
      '<select data-path="' + escapeHtml(field.path) + '.month"' + (disabled ? " disabled" : "") + '><option value="">月</option>' + renderOptionList(createNumberOptions(1, 12).map(function (option) { return option.padStart(2, "0"); }), value.month) + "</select>",
      '<select data-path="' + escapeHtml(field.path) + '.day"' + (disabled ? " disabled" : "") + '><option value="">日</option>' + renderOptionList(createNumberOptions(1, 31).map(function (option) { return option.padStart(2, "0"); }), value.day) + "</select>",
      "</div>"
    ].join("");
  }

  function renderFieldContent(field, draft, options) {
    const value = getValueAtPath(draft, field.path);
    const disabled = !options.isEditable || (field.type === "status" && options.statusLocked);

    if (field.type === "text") {
      return '<input type="text" data-path="' + escapeHtml(field.path) + '" value="' + escapeHtml(value) + '"' + (disabled ? " disabled" : "") + ">";
    }

    if (field.type === "select") {
      return '<select data-path="' + escapeHtml(field.path) + '"' + (disabled ? " disabled" : "") + '><option value="">請選擇</option>' + renderOptionList(field.options, value) + "</select>";
    }

    if (field.type === "computed") {
      return '<div class="employee-form__readonly">' + escapeHtml(value || "自動生成") + "</div>";
    }

    if (field.type === "dateTriple") {
      return renderDateTripleField(field, value, disabled);
    }

    if (field.type === "phone") {
      return [
        '<div class="employee-form__compound employee-form__compound--phone">',
        '<select data-path="' + escapeHtml(field.path) + '.mode"' + (disabled ? " disabled" : "") + ">" + renderOptionList(dataApi.PHONE_MODE_OPTIONS, value.mode) + "</select>",
        '<input type="text" data-path="' + escapeHtml(field.path) + '.value" value="' + escapeHtml(value.value) + '"' + (disabled ? " disabled" : "") + ">",
        "</div>"
      ].join("");
    }

    if (field.type === "relationship") {
      const otherVisible = value.preset === "其他";

      return [
        '<div class="employee-form__compound">',
        '<select data-path="' + escapeHtml(field.path) + '.preset"' + (disabled ? " disabled" : "") + ">" + renderOptionList(dataApi.RELATIONSHIP_OPTIONS, value.preset) + "</select>",
        '<input type="text" data-path="' + escapeHtml(field.path) + '.other" value="' + escapeHtml(value.other) + '" placeholder="其他關係"' + (disabled || !otherVisible ? " disabled" : "") + ">",
        "</div>"
      ].join("");
    }

    if (field.type === "selectOther") {
      const otherVisible = value.preset === "其他";

      return [
        '<div class="employee-form__compound">',
        '<select data-path="' + escapeHtml(field.path) + '.preset"' + (disabled ? " disabled" : "") + ">" + renderOptionList(field.options, value.preset) + "</select>",
        '<input type="text" data-path="' + escapeHtml(field.path) + '.other" value="' + escapeHtml(value.other) + '" placeholder="請輸入其他"' + (disabled || !otherVisible ? " disabled" : "") + ">",
        "</div>"
      ].join("");
    }

    if (field.type === "status") {
      return [
        '<div class="employee-form__status-stack">',
        '<select data-path="' + escapeHtml(field.path) + '"' + (disabled ? " disabled" : "") + '><option value="">請選擇</option>' +
          dataApi.STATUS_OPTIONS.map(function (statusValue) {
            const selected = statusValue === value ? " selected" : "";
            const disabledOption = options.statusLocked && statusValue === "離職" ? " disabled" : "";

            return '<option value="' + escapeHtml(statusValue) + '"' + selected + disabledOption + ">" + escapeHtml(statusValue) + "</option>";
          }).join("") +
        "</select>",
        value === "離職" ? '<div class="employee-form__nested"><div class="employee-form__field-label employee-form__field-label--nested">Last day</div>' + renderDateTripleField({ path: "work.lastDay" }, draft.work.lastDay, !options.isEditable) + "</div>" : "",
        "</div>"
      ].join("");
    }

    if (field.type === "room") {
      return [
        '<div class="employee-form__compound">',
        '<select data-path="' + escapeHtml(field.path) + '.type"' + (disabled ? " disabled" : "") + ">" + renderOptionList(dataApi.ROOM_TYPE_OPTIONS, value.type) + "</select>",
        '<input type="text" data-path="' + escapeHtml(field.path) + '.value" value="' + escapeHtml(value.value) + '"' + (disabled ? " disabled" : "") + ">",
        "</div>"
      ].join("");
    }

    if (field.type === "file") {
      return [
        '<div class="employee-form__file-row">',
        '<div class="employee-form__file-name">' + escapeHtml(draft.other.employeesFileName || "尚未上傳檔案") + "</div>",
        '<button type="button" class="employee-form__ghost-button" data-action="choose-employee-file"' + (!options.isEditable ? " disabled" : "") + ">選擇檔案</button>",
        "</div>"
      ].join("");
    }

    if (field.type === "textarea") {
      return '<textarea data-path="' + escapeHtml(field.path) + '" placeholder="' + escapeHtml(field.placeholder || "") + '"' + (disabled ? " disabled" : "") + ">" + escapeHtml(value) + "</textarea>";
    }

    return "";
  }

  function renderEmployeeFormSections(draft, options) {
    return EMPLOYEE_FORM_SECTIONS.map(function (section) {
      const fieldMarkup = section.fields.map(function (field) {
        return [
          '<section class="employee-form__field" data-field="' + escapeHtml(field.path) + '">',
          '<div class="employee-form__field-label">' + escapeHtml(field.label) + "</div>",
          renderFieldContent(field, draft, options),
          "</section>"
        ].join("");
      }).join("");

      return [
        '<div class="employee-form__section" data-section="' + escapeHtml(section.id) + '">',
        '<h3 class="employee-form__section-title">' + escapeHtml(section.title) + "</h3>",
        '<div class="employee-form__section-grid">' + fieldMarkup + "</div>",
        "</div>"
      ].join("");
    }).join("");
  }

  function serializeDraft(draft, departmentId, createdAt, existingId) {
    const nextDraft = applyDerivedFields(draft);

    nextDraft.departmentId = departmentId;
    nextDraft.createdAt = createdAt;
    nextDraft.id = existingId;

    return nextDraft;
  }

  window.YiDingEmployeesForm = {
    EMPLOYEE_FORM_SECTIONS: EMPLOYEE_FORM_SECTIONS,
    cloneDraft: cloneDraft,
    getValueAtPath: getValueAtPath,
    setValueAtPath: setValueAtPath,
    applyDerivedFields: applyDerivedFields,
    createDateFromParts: createDateFromParts,
    createDatePartsFromDate: createDatePartsFromDate,
    formatDateParts: formatDateParts,
    getFieldDisplayValue: getFieldDisplayValue,
    hasMeaningfulEmployeeData: hasMeaningfulEmployeeData,
    renderEmployeeFormSections: renderEmployeeFormSections,
    serializeDraft: serializeDraft
  };
})();
