(function () {
  const dataApi = window.YiDingEmployeesData;
  const currentYear = new Date().getFullYear();

  const EMPLOYEE_FORM_SECTIONS = [
    {
      id: "basic",
      title: "基本資料",
      fields: [
        { type: "text", path: "basic.vieName", label: "越文姓名" },
        { type: "text", path: "basic.engName", label: "英文姓名" },
        { type: "text", path: "basic.ydiId", label: "弈鼎編號" },
        { type: "text", path: "basic.haId", label: "HA 編號" },
        { type: "select", path: "basic.sex", label: "性別", options: dataApi.SEX_OPTIONS },
        { type: "dateTriple", path: "basic.dateOfBirth", label: "出生日期", startYear: 1960, endYear: currentYear },
        { type: "computed", path: "basic.age", label: "年齡" },
        { type: "computed", path: "basic.zodiac", label: "星座" },
        { type: "text", path: "basic.nationality", label: "國籍" },
        { type: "text", path: "basic.language", label: "語言" }
      ]
    },
    {
      id: "contact",
      title: "聯絡資料",
      fields: [
        { type: "phone", path: "contact.phoneNumber", label: "電話號碼" },
        { type: "phone", path: "contact.emergencyPhone", label: "緊急電話" },
        { type: "relationship", path: "contact.emergencyRelationship", label: "緊急關係" },
        { type: "text", path: "contact.email", label: "Gmail" },
        { type: "text", path: "contact.nationId", label: "身分證號" },
        { type: "text", path: "contact.placeOfOrigin", label: "籍貫" },
        { type: "text", path: "contact.placeOfResidence", label: "現居地址" }
      ]
    },
    {
      id: "work",
      title: "工作資料",
      fields: [
        { type: "selectOther", path: "work.department", label: "部門", options: dataApi.BASE_DEPARTMENT_OPTIONS },
        { type: "select", path: "work.position", label: "職位", options: dataApi.POSITION_OPTIONS },
        { type: "selectOther", path: "work.titleJob", label: "職務", options: dataApi.TITLE_JOB_OPTIONS },
        { type: "text", path: "work.directBoss", label: "直屬上司" },
        { type: "text", path: "work.recruitmentDept", label: "招募部門" },
        { type: "status", path: "work.status", label: "狀態" },
        { type: "dateTriple", path: "work.onboardDate", label: "入職日期", startYear: 2020, endYear: currentYear + 1 },
        { type: "select", path: "work.probationDays", label: "試用天數", options: createNumberOptions(1, 200) },
        { type: "dateTriple", path: "work.probEndDate", label: "試用期結束日", startYear: 2020, endYear: currentYear + 2 },
        { type: "dateTriple", path: "work.officialDate", label: "轉正日期", startYear: 2020, endYear: currentYear + 2 },
        { type: "room", path: "work.roomNumber", label: "房號" }
      ]
    },
    {
      id: "bank",
      title: "銀行資料",
      fields: [
        { type: "text", path: "bank.bankNumber", label: "銀行帳號" },
        { type: "text", path: "bank.bankName", label: "銀行名稱" },
        { type: "text", path: "bank.probationSalary", label: "試用薪資" },
        { type: "text", path: "bank.officialSalary", label: "正式薪資" }
      ]
    },
    {
      id: "other",
      title: "其他",
      fields: [
        { type: "file", path: "other.attachments", label: "員工檔案" },
        { type: "textarea", path: "other.remark", label: "備註", placeholder: "請輸入資料" }
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

    if (onboardDate && probationDays) {
      work.probEndDate = createDatePartsFromDate(addDays(onboardDate, probationDays - 1));
    }

    if (onboardDate && probEndDate && !probationDays) {
      work.probationDays = String(Math.round((probEndDate - onboardDate) / 86400000) + 1);
    }

    if (onboardDate && officialDate && !probationDays) {
      work.probationDays = String(Math.max(1, Math.round((officialDate - onboardDate) / 86400000)));
    }

    if (onboardDate && officialDate) {
      work.probEndDate = createDatePartsFromDate(addDays(officialDate, -1));
    }

    if (!onboardDate && probEndDate && probationDays) {
      work.onboardDate = createDatePartsFromDate(addDays(probEndDate, -(probationDays - 1)));
    }

    if (!onboardDate && officialDate && probationDays) {
      work.onboardDate = createDatePartsFromDate(addDays(officialDate, -probationDays));
    }

    if (createDateFromParts(work.probEndDate)) {
      work.officialDate = createDatePartsFromDate(addDays(createDateFromParts(work.probEndDate), 1));
    }
  }

  function applyDerivedFields(draft) {
    const nextDraft = cloneDraft(draft);

    nextDraft.contact.phoneNumber = normalizePhoneValue(nextDraft.contact.phoneNumber);
    nextDraft.contact.emergencyPhone = normalizePhoneValue(nextDraft.contact.emergencyPhone);
    nextDraft.other = Object.assign({}, nextDraft.other, {
      attachments: normalizeAttachmentList(nextDraft.other && nextDraft.other.attachments, nextDraft)
    });
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

  function normalizePhoneValue(value) {
    if (!value) {
      return {
        countryCode: dataApi.PHONE_COUNTRY_OPTIONS[0],
        number: ""
      };
    }

    if (value.countryCode !== undefined || value.number !== undefined) {
      return {
        countryCode: value.countryCode || dataApi.PHONE_COUNTRY_OPTIONS[0],
        number: value.number || ""
      };
    }

    return {
      countryCode: dataApi.PHONE_COUNTRY_OPTIONS[0],
      number: value.value || ""
    };
  }

  function normalizeAttachmentList(value, draft) {
    if (Array.isArray(value)) {
      return value;
    }

    if (draft && draft.other && draft.other.employeesFileName) {
      return [{
        id: "attachment-legacy",
        name: draft.other.employeesFileName,
        data: draft.other.employeesFileData || ""
      }];
    }

    return [];
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
        return [
          normalizePhoneValue(employee.contact.phoneNumber).countryCode,
          normalizePhoneValue(employee.contact.phoneNumber).number
        ].filter(Boolean).join(" ").trim() || "未設定";
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
      normalizePhoneValue(draft.contact.phoneNumber).number,
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

  function renderSelectControl(attributes, optionMarkup) {
    return [
      '<div class="employee-form__select-wrap">',
      '<select ' + attributes + '>' + optionMarkup + "</select>",
      '<span class="employee-form__select-arrow" aria-hidden="true">▾</span>',
      "</div>"
    ].join("");
  }

  function renderDatePart(label, path, options, selectedValue, disabled) {
    return [
      '<label class="employee-form__date-part">',
      renderSelectControl(
        'data-path="' + escapeHtml(path) + '"' + (disabled ? " disabled" : ""),
        '<option value="">' + escapeHtml(label) + "</option>" + renderOptionList(options, selectedValue)
      ),
      '<span class="employee-form__date-unit">' + escapeHtml(label) + "</span>",
      "</label>"
    ].join("");
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
      renderDatePart("年", field.path + ".year", years, value.year, disabled),
      renderDatePart("月", field.path + ".month", createNumberOptions(1, 12).map(function (option) { return option.padStart(2, "0"); }), value.month, disabled),
      renderDatePart("日", field.path + ".day", createNumberOptions(1, 31).map(function (option) { return option.padStart(2, "0"); }), value.day, disabled),
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
      return renderSelectControl(
        'data-path="' + escapeHtml(field.path) + '"' + (disabled ? " disabled" : ""),
        '<option value=""></option>' + renderOptionList(field.options, value)
      );
    }

    if (field.type === "computed") {
      return '<div class="employee-form__readonly">' + escapeHtml(value || "自動計算") + "</div>";
    }

    if (field.type === "dateTriple") {
      return renderDateTripleField(field, value, disabled);
    }

    if (field.type === "phone") {
      const phoneValue = normalizePhoneValue(value);
      const listId = "phone-country-" + field.path.replace(/[.]/g, "-");

      return [
        '<div class="employee-form__compound employee-form__compound--phone">',
        '<div class="employee-form__country-wrap">',
        '<input class="employee-form__country-input" type="text" list="' + escapeHtml(listId) + '" data-path="' + escapeHtml(field.path) + '.countryCode" value="' + escapeHtml(phoneValue.countryCode) + '" placeholder="國家 + 區碼"' + (disabled ? " disabled" : "") + '>',
        '<datalist id="' + escapeHtml(listId) + '">' + dataApi.PHONE_COUNTRY_OPTIONS.map(function (option) {
          return '<option value="' + escapeHtml(option) + '"></option>';
        }).join("") + "</datalist>",
        "</div>",
        '<input type="text" data-path="' + escapeHtml(field.path) + '.number" value="' + escapeHtml(phoneValue.number) + '" placeholder="電話號碼"' + (disabled ? " disabled" : "") + '>',
        "</div>"
      ].join("");
    }

    if (field.type === "relationship") {
      const otherVisible = value.preset === "其他";

      return [
        '<div class="employee-form__compound employee-form__compound--stack">',
        renderSelectControl(
          'data-path="' + escapeHtml(field.path) + '.preset"' + (disabled ? " disabled" : ""),
          renderOptionList(dataApi.RELATIONSHIP_OPTIONS, value.preset)
        ),
        otherVisible
          ? '<input type="text" data-path="' + escapeHtml(field.path) + '.other" value="' + escapeHtml(value.other) + '" placeholder="請輸入關係"' + (disabled ? " disabled" : "") + '>'
          : "",
        "</div>"
      ].join("");
    }

    if (field.type === "selectOther") {
      const otherVisible = value.preset === "其他";

      return [
        '<div class="employee-form__compound employee-form__compound--stack">',
        renderSelectControl(
          'data-path="' + escapeHtml(field.path) + '.preset"' + (disabled ? " disabled" : ""),
          renderOptionList(field.options, value.preset)
        ),
        otherVisible
          ? '<input type="text" data-path="' + escapeHtml(field.path) + '.other" value="' + escapeHtml(value.other) + '" placeholder="請輸入其他"' + (disabled ? " disabled" : "") + '>'
          : "",
        "</div>"
      ].join("");
    }

    if (field.type === "status") {
      return [
        '<div class="employee-form__status-stack">',
        renderSelectControl(
          'data-path="' + escapeHtml(field.path) + '"' + (disabled ? " disabled" : ""),
          dataApi.STATUS_OPTIONS.map(function (statusValue) {
            const selected = statusValue === value ? " selected" : "";
            const disabledOption = options.statusLocked && statusValue === "離職" ? " disabled" : "";

            return '<option value="' + escapeHtml(statusValue) + '"' + selected + disabledOption + ">" + escapeHtml(statusValue) + "</option>";
          }).join("")
        ),
        value === "離職" ? '<div class="employee-form__nested"><div class="employee-form__field-label employee-form__field-label--nested">最後工作日</div>' + renderDateTripleField({ path: "work.lastDay" }, draft.work.lastDay, !options.isEditable) + "</div>" : "",
        "</div>"
      ].join("");
    }

    if (field.type === "room") {
      return [
        '<div class="employee-form__compound">',
        renderSelectControl(
          'data-path="' + escapeHtml(field.path) + '.type"' + (disabled ? " disabled" : ""),
          renderOptionList(dataApi.ROOM_TYPE_OPTIONS, value.type)
        ),
        '<input type="text" data-path="' + escapeHtml(field.path) + '.value" value="' + escapeHtml(value.value) + '"' + (disabled ? " disabled" : "") + ">",
        "</div>"
      ].join("");
    }

    if (field.type === "file") {
      const attachments = normalizeAttachmentList(value, draft);
      const pendingAttachments = Array.isArray(options.pendingAttachments) ? options.pendingAttachments : [];

      return [
        '<div class="employee-form__attachments">',
        attachments.map(function (attachment, index) {
          return [
            '<div class="employee-form__attachment-item">',
            '<button type="button" class="employee-form__attachment-link" data-action="preview-attachment" data-attachment-index="' + String(index) + '">' + escapeHtml(attachment.name) + "</button>",
            '<div class="employee-form__attachment-actions">',
            '<button type="button" class="employees-icon-button employees-icon-button--ghost" data-action="replace-attachment" data-attachment-index="' + String(index) + '"' + (!options.isEditable ? " disabled" : "") + ' aria-label="更換檔案">↺</button>',
            '<button type="button" class="employees-icon-button employees-icon-button--ghost" data-action="move-attachment-up" data-attachment-index="' + String(index) + '"' + (!options.isEditable || index === 0 ? " disabled" : "") + ' aria-label="上移檔案">↑</button>',
            '<button type="button" class="employees-icon-button employees-icon-button--ghost" data-action="move-attachment-down" data-attachment-index="' + String(index) + '"' + (!options.isEditable || index === attachments.length - 1 ? " disabled" : "") + ' aria-label="下移檔案">↓</button>',
            '<button type="button" class="employees-icon-button employees-icon-button--ghost employees-icon-button--danger" data-action="request-delete-attachment" data-attachment-index="' + String(index) + '"' + (!options.isEditable ? " disabled" : "") + ' aria-label="刪除檔案">✕</button>',
            "</div>",
            "</div>"
          ].join("");
        }).join(""),
        pendingAttachments.map(function (attachment, index) {
          return '<div class="employee-form__attachment-item employee-form__attachment-item--pending"><div class="employee-form__attachment-link employee-form__attachment-link--static">' + escapeHtml(attachment.name) + '</div><div class="employee-form__attachment-actions"><button type="button" class="employees-icon-button employees-icon-button--ghost" data-action="confirm-pending-attachment" data-pending-index="' + String(index) + '" aria-label="確認檔案">✓</button><button type="button" class="employees-icon-button employees-icon-button--ghost employees-icon-button--danger" data-action="cancel-pending-attachment" data-pending-index="' + String(index) + '" aria-label="取消檔案">✕</button></div></div>';
        }).join(""),
        '<div class="employee-form__file-row"><button type="button" class="employee-form__ghost-button employee-form__attachment-add" data-action="choose-employee-file"' + (!options.isEditable ? " disabled" : "") + ">" + escapeHtml(attachments.length ? "新增檔案" : "選擇檔案") + "</button></div>",
        pendingAttachments.length ? '<div class="employee-form__field-hint">按 Enter 可直接確認最上方待確認檔案。</div>' : "",
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
    normalizePhoneValue: normalizePhoneValue,
    normalizeAttachmentList: normalizeAttachmentList,
    getFieldDisplayValue: getFieldDisplayValue,
    hasMeaningfulEmployeeData: hasMeaningfulEmployeeData,
    renderEmployeeFormSections: renderEmployeeFormSections,
    serializeDraft: serializeDraft
  };
})();
