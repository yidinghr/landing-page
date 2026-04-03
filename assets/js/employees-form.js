(function () {
  const i18n = window.YiDingI18n || null;
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

  function tr(value) {
    return i18n ? i18n.translateLiteral(value) : value;
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

  function getDateDiffInDays(startDate, endDate) {
    return Math.round((endDate - startDate) / 86400000);
  }

  function normalizeProbationDays(value) {
    const numberValue = Number(value);

    if (!Number.isFinite(numberValue) || numberValue <= 0) {
      return null;
    }

    return Math.max(1, Math.round(numberValue));
  }

  function getChangedEmploymentField(changedPath) {
    if (!changedPath || changedPath.indexOf("work.") !== 0) {
      return "";
    }

    if (changedPath.indexOf("work.onboardDate.") === 0) {
      return "onboardDate";
    }

    if (changedPath.indexOf("work.probEndDate.") === 0) {
      return "probEndDate";
    }

    if (changedPath.indexOf("work.officialDate.") === 0) {
      return "officialDate";
    }

    if (changedPath === "work.probationDays") {
      return "probationDays";
    }

    return "";
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

  function syncEmploymentDates(draft, changedPath) {
    const work = draft.work;
    let onboardDate = createDateFromParts(work.onboardDate);
    let probationDays = normalizeProbationDays(work.probationDays);
    let probEndDate = createDateFromParts(work.probEndDate);
    let officialDate = createDateFromParts(work.officialDate);
    const changedField = getChangedEmploymentField(changedPath);

    function setOnboardDate(date) {
      if (!date) {
        return;
      }

      onboardDate = date;
      work.onboardDate = createDatePartsFromDate(date);
    }

    function setProbationDays(days) {
      const normalizedDays = normalizeProbationDays(days);

      if (!normalizedDays) {
        return;
      }

      probationDays = normalizedDays;
      work.probationDays = String(normalizedDays);
    }

    function setProbEndDate(date) {
      if (!date) {
        return;
      }

      probEndDate = date;
      work.probEndDate = createDatePartsFromDate(date);
    }

    function setOfficialDate(date) {
      if (!date) {
        return;
      }

      officialDate = date;
      work.officialDate = createDatePartsFromDate(date);
    }

    function resolveSyncMode() {
      if (changedField === "onboardDate") {
        if (onboardDate && probationDays) {
          return "onboard+probationDays";
        }

        if (onboardDate && probEndDate) {
          return "onboard+probEndDate";
        }

        if (onboardDate && officialDate) {
          return "onboard+officialDate";
        }
      }

      if (changedField === "probationDays") {
        if (onboardDate && probationDays) {
          return "onboard+probationDays";
        }

        if (probationDays && probEndDate) {
          return "probationDays+probEndDate";
        }

        if (probationDays && officialDate) {
          return "probationDays+officialDate";
        }
      }

      if (changedField === "probEndDate") {
        if (onboardDate && probEndDate) {
          return "onboard+probEndDate";
        }

        if (probationDays && probEndDate) {
          return "probationDays+probEndDate";
        }

        if (probEndDate && officialDate) {
          return "probEndDate+officialDate";
        }
      }

      if (changedField === "officialDate") {
        if (onboardDate && officialDate) {
          return "onboard+officialDate";
        }

        if (probationDays && officialDate) {
          return "probationDays+officialDate";
        }

        if (probEndDate && officialDate) {
          return "probEndDate+officialDate";
        }
      }

      if (onboardDate && probationDays) {
        return "onboard+probationDays";
      }

      if (onboardDate && probEndDate) {
        return "onboard+probEndDate";
      }

      if (onboardDate && officialDate) {
        return "onboard+officialDate";
      }

      if (probationDays && probEndDate) {
        return "probationDays+probEndDate";
      }

      if (probationDays && officialDate) {
        return "probationDays+officialDate";
      }

      if (probEndDate && officialDate) {
        return "probEndDate+officialDate";
      }

      return "";
    }

    switch (resolveSyncMode()) {
      case "onboard+probationDays": {
        setProbEndDate(addDays(onboardDate, probationDays - 1));
        setOfficialDate(addDays(probEndDate, 1));
        break;
      }
      case "onboard+probEndDate": {
        setProbationDays(getDateDiffInDays(onboardDate, probEndDate) + 1);
        setProbEndDate(addDays(onboardDate, probationDays - 1));
        setOfficialDate(addDays(probEndDate, 1));
        break;
      }
      case "onboard+officialDate": {
        setProbationDays(getDateDiffInDays(onboardDate, officialDate));
        setProbEndDate(addDays(onboardDate, probationDays - 1));
        setOfficialDate(addDays(probEndDate, 1));
        break;
      }
      case "probationDays+probEndDate": {
        setOnboardDate(addDays(probEndDate, -(probationDays - 1)));
        setProbEndDate(addDays(onboardDate, probationDays - 1));
        setOfficialDate(addDays(probEndDate, 1));
        break;
      }
      case "probationDays+officialDate": {
        setOnboardDate(addDays(officialDate, -probationDays));
        setProbEndDate(addDays(onboardDate, probationDays - 1));
        setOfficialDate(addDays(probEndDate, 1));
        break;
      }
      case "probEndDate+officialDate": {
        if (changedField === "officialDate") {
          setProbEndDate(addDays(officialDate, -1));
          break;
        }

        setOfficialDate(addDays(probEndDate, 1));
        break;
      }
      default:
        break;
    }
  }

  function applyDerivedFields(draft, changedPath) {
    const nextDraft = cloneDraft(draft);

    nextDraft.contact.phoneNumber = normalizePhoneValue(nextDraft.contact.phoneNumber);
    nextDraft.contact.emergencyPhone = normalizePhoneValue(nextDraft.contact.emergencyPhone);
    nextDraft.other = Object.assign({}, nextDraft.other, {
      attachments: normalizeAttachmentList(nextDraft.other && nextDraft.other.attachments, nextDraft)
    });
    nextDraft.basic.age = calculateAge(nextDraft.basic.dateOfBirth);
    nextDraft.basic.zodiac = getZodiac(nextDraft.basic.dateOfBirth);
    syncEmploymentDates(nextDraft, changedPath);

    if (nextDraft.work.status !== "離職") {
      nextDraft.work.lastDay = dataApi.createEmptyDateParts();
    }

    return nextDraft;
  }

  function formatDateParts(parts) {
    if (!parts || !parts.year || !parts.month || !parts.day) {
      return tr("未設定");
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
        return employee.basic.vieName || tr("未設定");
      case "engName":
        return employee.basic.engName || tr("未設定");
      case "ydiId":
        return employee.basic.ydiId || tr("未設定");
      case "haId":
        return employee.basic.haId || tr("未設定");
      case "position":
        return employee.work.position || tr("未設定");
      case "titleJob":
        return employee.work.titleJob.preset === "其他" ? employee.work.titleJob.other || "其他" : employee.work.titleJob.preset || tr("未設定");
      case "phoneNumber":
        return [
          normalizePhoneValue(employee.contact.phoneNumber).countryCode,
          normalizePhoneValue(employee.contact.phoneNumber).number
        ].filter(Boolean).join(" ").trim() || tr("未設定");
      case "dateOfBirth":
        return formatDateParts(employee.basic.dateOfBirth);
      case "onboardDate":
        return formatDateParts(employee.work.onboardDate);
      case "nationality":
        return employee.basic.nationality || tr("未設定");
      case "status":
        return employee.work.status || tr("未設定");
      case "lastDay":
        return formatDateParts(employee.work.lastDay);
      default:
        return tr("未設定");
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
        '<input class="employee-form__country-input" type="text" list="' + escapeHtml(listId) + '" data-path="' + escapeHtml(field.path) + '.countryCode" value="' + escapeHtml(phoneValue.countryCode) + '" placeholder="' + escapeHtml(tr("國家 + 區碼")) + '"' + (disabled ? " disabled" : "") + '>',
        '<datalist id="' + escapeHtml(listId) + '">' + dataApi.PHONE_COUNTRY_OPTIONS.map(function (option) {
          return '<option value="' + escapeHtml(option) + '"></option>';
        }).join("") + "</datalist>",
        "</div>",
        '<input type="text" data-path="' + escapeHtml(field.path) + '.number" value="' + escapeHtml(phoneValue.number) + '" placeholder="' + escapeHtml(tr("電話號碼")) + '"' + (disabled ? " disabled" : "") + '>',
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
          ? '<input type="text" data-path="' + escapeHtml(field.path) + '.other" value="' + escapeHtml(value.other) + '" placeholder="' + escapeHtml(tr("請輸入關係")) + '"' + (disabled ? " disabled" : "") + '>'
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
          ? '<input type="text" data-path="' + escapeHtml(field.path) + '.other" value="' + escapeHtml(value.other) + '" placeholder="' + escapeHtml(tr("請輸入其他")) + '"' + (disabled ? " disabled" : "") + '>'
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
        value === "離職" ? '<div class="employee-form__nested"><div class="employee-form__field-label employee-form__field-label--nested">' + escapeHtml(tr("最後工作日")) + "</div>" + renderDateTripleField({ path: "work.lastDay" }, draft.work.lastDay, !options.isEditable) + "</div>" : "",
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
            '<button type="button" class="employees-icon-button employees-icon-button--ghost employees-icon-button--danger" data-action="request-delete-attachment" data-attachment-index="' + String(index) + '"' + (!options.isEditable ? " disabled" : "") + ' aria-label="' + escapeHtml(tr("刪除檔案")) + '">✕</button>',
            "</div>",
            "</div>"
          ].join("");
        }).join(""),
        pendingAttachments.map(function (attachment, index) {
          return '<div class="employee-form__attachment-item employee-form__attachment-item--pending"><div class="employee-form__attachment-link employee-form__attachment-link--static">' + escapeHtml(attachment.name) + '</div><div class="employee-form__attachment-actions"><button type="button" class="employees-icon-button employees-icon-button--ghost" data-action="confirm-pending-attachment" data-pending-index="' + String(index) + '" aria-label="' + escapeHtml(tr("確認檔案")) + '">✓</button><button type="button" class="employees-icon-button employees-icon-button--ghost employees-icon-button--danger" data-action="cancel-pending-attachment" data-pending-index="' + String(index) + '" aria-label="' + escapeHtml(tr("取消檔案")) + '">✕</button></div></div>';
        }).join(""),
        '<div class="employee-form__file-row"><button type="button" class="employee-form__ghost-button employee-form__attachment-add" data-action="choose-employee-file"' + (!options.isEditable ? " disabled" : "") + ">" + escapeHtml(tr(attachments.length ? "新增檔案" : "選擇檔案")) + "</button></div>",
        pendingAttachments.length ? '<div class="employee-form__field-hint">' + escapeHtml(tr("按 Enter 可直接確認最上方待確認檔案。")) + "</div>" : "",
        "</div>"
      ].join("");
    }

    if (field.type === "textarea") {
      return '<textarea data-path="' + escapeHtml(field.path) + '" placeholder="' + escapeHtml(tr(field.placeholder || "")) + '"' + (disabled ? " disabled" : "") + ">" + escapeHtml(value) + "</textarea>";
    }

    return "";
  }

  function renderEmployeeFormSections(draft, options) {
    return EMPLOYEE_FORM_SECTIONS.map(function (section) {
      const fieldMarkup = section.fields.map(function (field) {
        return [
          '<section class="employee-form__field" data-field="' + escapeHtml(field.path) + '">',
          '<div class="employee-form__field-label">' + escapeHtml(tr(field.label)) + "</div>",
          renderFieldContent(field, draft, options),
          "</section>"
        ].join("");
      }).join("");

      return [
        '<div class="employee-form__section" data-section="' + escapeHtml(section.id) + '">',
        '<h3 class="employee-form__section-title">' + escapeHtml(tr(section.title)) + "</h3>",
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
