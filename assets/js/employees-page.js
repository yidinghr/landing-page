(function () {
  const dataApi = window.YiDingEmployeesData;
  const formApi = window.YiDingEmployeesForm;
  const root = document.getElementById("employeesModuleRoot");

  if (!dataApi || !formApi || !root) {
    return;
  }

  const uiState = {
    editingTitle: false,
    titleDraft: "",
    editingSubtitle: false,
    subtitleDraft: "",
    editingMainNote: false,
    mainNoteDraft: "",
    addingDepartment: false,
    departmentDraft: "",
    editingDepartmentId: "",
    departmentEditDraft: "",
    openDepartmentMenuId: "",
    draggingDepartmentId: "",
    creatingTab: false,
    editingTabId: "",
    tabDraft: { name: "", conditions: [] },
    openMoreTabs: false,
    showSearchInput: false,
    showFilterMenu: false,
    showDisplayMenu: false,
    detailMode: "hidden",
    selectedEmployeeId: "",
    draftEmployee: null,
    referenceEmployee: null,
    avatarDirty: false,
    openModal: null,
    passwordDraft: "",
    passwordError: "",
    noticeText: "",
    previewImageSrc: "",
    pendingAttachments: [],
    attachmentDeleteIndex: -1
  };

  let state = loadState();
  const dom = {};
  const TAB_FILTER_FIELDS = [
    { id: "work.status", label: "狀態", type: "select", options: dataApi.STATUS_OPTIONS },
    { id: "basic.engName", label: "英文姓名", type: "text" },
    { id: "basic.vieName", label: "越文姓名", type: "text" },
    { id: "basic.language", label: "語言", type: "text" },
    { id: "work.position", label: "職位", type: "select", options: dataApi.POSITION_OPTIONS },
    { id: "work.titleJob", label: "職務", type: "select", options: dataApi.TITLE_JOB_OPTIONS },
    { id: "work.onboardDate", label: "入職日期", type: "date" },
    { id: "basic.age", label: "年齡", type: "number" },
    { id: "basic.sex", label: "性別", type: "select", options: dataApi.SEX_OPTIONS },
    { id: "basic.nationality", label: "國籍", type: "text" }
  ];
  const TAB_OPERATORS_BY_TYPE = {
    text: [
      { id: "contains", label: "包含" },
      { id: "equals", label: "等於" },
      { id: "is", label: "是" },
      { id: "isNot", label: "不是" }
    ],
    select: [
      { id: "is", label: "是" },
      { id: "isNot", label: "不是" }
    ],
    date: [
      { id: "equals", label: "等於" },
      { id: "before", label: "早於" },
      { id: "after", label: "晚於" }
    ],
    number: [
      { id: "equals", label: "等於" },
      { id: "before", label: "小於" },
      { id: "after", label: "大於" }
    ]
  };

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getTabFieldConfig(fieldId) {
    return TAB_FILTER_FIELDS.find(function (field) {
      return field.id === fieldId;
    }) || TAB_FILTER_FIELDS[0];
  }

  function getTabOperators(fieldId) {
    const field = getTabFieldConfig(fieldId);
    return TAB_OPERATORS_BY_TYPE[field.type] || TAB_OPERATORS_BY_TYPE.text;
  }

  function createEmptyTabCondition(fieldId, sourceState) {
    const resolvedFieldId = getTabFieldConfig(fieldId).id;
    const field = getTabFieldConfig(resolvedFieldId);
    const operators = getTabOperators(resolvedFieldId);
    const defaultOperator = operators[0] ? operators[0].id : "is";
    let defaultValue = "";

    if (field.type === "select") {
      defaultValue = getFieldOptionList(resolvedFieldId, sourceState)[0] || "";
    }

    return {
      id: "condition-" + String(Date.now()) + "-" + String(Math.random()).slice(2, 8),
      fieldId: resolvedFieldId,
      operator: defaultOperator,
      value: defaultValue
    };
  }

  function normalizeTabCondition(condition, sourceState) {
    const baseCondition = createEmptyTabCondition(condition && condition.fieldId, sourceState);
    const field = getTabFieldConfig(baseCondition.fieldId);
    const operators = getTabOperators(baseCondition.fieldId);
    const nextValue = condition && condition.value !== undefined ? String(condition.value) : baseCondition.value;

    return {
      id: condition && condition.id ? condition.id : baseCondition.id,
      fieldId: baseCondition.fieldId,
      operator: operators.some(function (option) {
        return option.id === (condition && condition.operator);
      }) ? condition.operator : baseCondition.operator,
      value: field.type === "select" && !nextValue ? (getFieldOptionList(baseCondition.fieldId, sourceState)[0] || "") : nextValue
    };
  }

  function normalizeTab(tab, sourceState) {
    const conditions = Array.isArray(tab && tab.conditions) && tab.conditions.length
      ? tab.conditions.map(function (condition) {
        return normalizeTabCondition(condition, sourceState);
      })
      : [normalizeTabCondition({
        fieldId: tab && tab.fieldId,
        operator: tab && tab.operator,
        value: tab && tab.value
      }, sourceState)];

    return {
      id: tab && tab.id ? tab.id : "tab-" + Date.now(),
      name: tab && tab.name ? String(tab.name) : "",
      conditions: conditions
    };
  }

  function normalizePhoneEntry(entry) {
    return formApi.normalizePhoneValue(entry);
  }

  function normalizeAttachments(otherSection) {
    const attachments = formApi.normalizeAttachmentList(otherSection && otherSection.attachments, { other: otherSection || {} });

    return attachments.map(function (attachment, index) {
      return {
        id: attachment.id || "attachment-" + String(Date.now()) + "-" + String(index),
        name: attachment.name || attachment.fileName || "未命名檔案",
        data: attachment.data || attachment.url || ""
      };
    });
  }

  function normalizeEmployee(employee) {
    const nextEmployee = formApi.applyDerivedFields(employee);

    nextEmployee.contact.phoneNumber = normalizePhoneEntry(nextEmployee.contact.phoneNumber);
    nextEmployee.contact.emergencyPhone = normalizePhoneEntry(nextEmployee.contact.emergencyPhone);
    nextEmployee.other = Object.assign({}, nextEmployee.other, {
      attachments: normalizeAttachments(nextEmployee.other)
    });

    return nextEmployee;
  }

  function getFieldOptionList(fieldId, sourceState) {
    if (fieldId === "work.department") {
      const currentState = sourceState || state;

      return currentState.departments.map(function (department) {
        return department.name;
      }).concat([dataApi.RETIRED_DEPARTMENT.name]);
    }

    return (getTabFieldConfig(fieldId).options || []).slice();
  }

  function loadState() {
    const storageValue = window.localStorage.getItem(dataApi.STORAGE_KEY);

    if (!storageValue) {
      return hydrateState(dataApi.createInitialState());
    }

    try {
      return hydrateState(JSON.parse(storageValue));
    } catch (error) {
      return hydrateState(dataApi.createInitialState());
    }
  }

  function hydrateState(rawState) {
    const initialState = dataApi.createInitialState();
    const nextState = Object.assign({}, initialState, rawState || {});

    nextState.interfaceMeta = Object.assign({}, initialState.interfaceMeta, rawState.interfaceMeta || {});
    nextState.interfaceMeta.mainNotes = Object.assign({}, nextState.interfaceMeta.mainNotes || {}, rawState && rawState.interfaceMeta && rawState.interfaceMeta.mainNotes || {});
    nextState.departments = Array.isArray(rawState.departments) && rawState.departments.length ? rawState.departments : dataApi.cloneValue(initialState.departments);
    nextState.tabsByDepartment = Object.assign({}, initialState.tabsByDepartment, rawState.tabsByDepartment || {});
    nextState.activeTabByDepartment = Object.assign({}, initialState.activeTabByDepartment, rawState.activeTabByDepartment || {});
    nextState.cardDisplay = Object.assign({}, initialState.cardDisplay, rawState.cardDisplay || {});
    nextState.filters = Object.assign({}, initialState.filters, rawState.filters || {});
    nextState.interfaceMeta.subtitle = nextState.interfaceMeta.subtitle || dataApi.DEFAULT_INTERFACE_SUBTITLE;
    nextState.employees = (rawState.employees || initialState.employees).map(function (employee) {
      return normalizeEmployee(employee);
    });
    Object.keys(nextState.tabsByDepartment).forEach(function (departmentId) {
      nextState.tabsByDepartment[departmentId] = (nextState.tabsByDepartment[departmentId] || []).map(function (tab) {
        return normalizeTab(tab, nextState);
      });
    });
    nextState.cardDisplay.extraFieldIds = (nextState.cardDisplay.extraFieldIds || initialState.cardDisplay.extraFieldIds).slice(0, 2);

    if (!nextState.selectedDepartmentId || !getDepartmentMap(nextState)[nextState.selectedDepartmentId]) {
      nextState.selectedDepartmentId = nextState.departments[0].id;
    }

    return nextState;
  }

  function persistState() {
    window.localStorage.setItem(dataApi.STORAGE_KEY, JSON.stringify(state));
  }

  function getDepartmentMap(sourceState) {
    const map = {};

    sourceState.departments.forEach(function (department) {
      map[department.id] = department;
    });

    map[dataApi.RETIRED_DEPARTMENT.id] = dataApi.RETIRED_DEPARTMENT;
    return map;
  }

  function getAllDepartments() {
    return state.departments.concat([dataApi.RETIRED_DEPARTMENT]);
  }

  function getSelectedDepartment() {
    return getDepartmentMap(state)[state.selectedDepartmentId] || getAllDepartments()[0];
  }

  function getDefaultMainNote(departmentId) {
    return departmentId === dataApi.RETIRED_DEPARTMENT.id
      ? "離職名單預設依最後工作日排序。"
      : "點擊員工卡片可展開右側詳細資料。";
  }

  function getMainNote(departmentId) {
    const noteMap = state.interfaceMeta.mainNotes || {};
    return noteMap[departmentId] || getDefaultMainNote(departmentId);
  }

  function isRetiredView() {
    return state.selectedDepartmentId === dataApi.RETIRED_DEPARTMENT.id;
  }

  function isDetailOpen() {
    return uiState.detailMode !== "hidden";
  }

  function isNormalDepartmentView() {
    return !isRetiredView();
  }

  function getEmployeeById(employeeId) {
    return state.employees.find(function (employee) {
      return employee.id === employeeId;
    }) || null;
  }

  function getCurrentDraftEmployee() {
    return uiState.draftEmployee ? formApi.applyDerivedFields(uiState.draftEmployee) : null;
  }

  function getCurrentReferenceEmployee() {
    return uiState.referenceEmployee ? formApi.applyDerivedFields(uiState.referenceEmployee) : null;
  }

  function isDetailDirty() {
    if (uiState.detailMode === "hidden" || uiState.detailMode === "view") {
      return false;
    }

    const currentDraft = getCurrentDraftEmployee();

    if (uiState.detailMode === "add") {
      return formApi.hasMeaningfulEmployeeData(currentDraft) || uiState.avatarDirty || uiState.pendingAttachments.length > 0;
    }

    return JSON.stringify(currentDraft) !== JSON.stringify(getCurrentReferenceEmployee()) || uiState.avatarDirty || uiState.pendingAttachments.length > 0;
  }

  function buildShell() {
    root.innerHTML = [
      '<div class="employees-app">',
      '<aside class="employees-app__sidebar"><div id="employeesSidebarMount"></div></aside>',
      '<section id="employeesWorkspace" class="employees-workspace">',
      '<div class="employees-main">',
      '<div id="employeesMainHeaderMount"></div>',
      '<div id="employeesToolbarMount"></div>',
      '<div id="employeesCardsMount"></div>',
      "</div>",
      '<aside class="employees-detail"><div id="employeesDetailMount" class="employees-detail__inner"></div></aside>',
      "</section>",
      '<div id="employeesModalMount" class="employees-modal-root"></div>',
      '<input id="employeesInterfaceIconInput" class="employees-hidden" type="file" accept="image/*">',
      '<input id="employeesAvatarInput" class="employees-hidden" type="file" accept="image/*">',
      '<input id="employeesFileInput" class="employees-hidden" type="file" multiple>',
      "</div>"
    ].join("");

    dom.sidebarMount = document.getElementById("employeesSidebarMount");
    dom.mainHeaderMount = document.getElementById("employeesMainHeaderMount");
    dom.toolbarMount = document.getElementById("employeesToolbarMount");
    dom.cardsMount = document.getElementById("employeesCardsMount");
    dom.detailMount = document.getElementById("employeesDetailMount");
    dom.modalMount = document.getElementById("employeesModalMount");
    dom.workspace = document.getElementById("employeesWorkspace");
    dom.interfaceIconInput = document.getElementById("employeesInterfaceIconInput");
    dom.avatarInput = document.getElementById("employeesAvatarInput");
    dom.fileInput = document.getElementById("employeesFileInput");
  }

  function resolveDepartmentIdForDraft(employeeDraft, fallbackDepartmentId) {
    const selectedValue = employeeDraft.work.department.preset === "其他" ? employeeDraft.work.department.other : employeeDraft.work.department.preset;
    const matchingDepartment = state.departments.find(function (department) {
      return department.name === selectedValue;
    });

    return matchingDepartment ? matchingDepartment.id : fallbackDepartmentId;
  }

  function syncDepartmentOptionsWithState() {
    const baseOptions = ["場面", "賬房", "服務部", "人事部", "市場部", "會計部", "其他"];
    const dynamicOptions = state.departments.map(function (department) {
      return department.name;
    }).filter(function (name) {
      return baseOptions.indexOf(name) === -1;
    });

    dataApi.BASE_DEPARTMENT_OPTIONS.splice(0, dataApi.BASE_DEPARTMENT_OPTIONS.length);
    baseOptions.slice(0, baseOptions.length - 1).concat(dynamicOptions).concat(["其他"]).forEach(function (option) {
      dataApi.BASE_DEPARTMENT_OPTIONS.push(option);
    });
  }

  function resolveEmployeeFieldValue(employee, fieldId) {
    if (fieldId === "work.department") {
      return employee.work.department.preset === "其他" ? employee.work.department.other || "其他" : employee.work.department.preset;
    }

    if (fieldId === "work.titleJob") {
      return employee.work.titleJob.preset === "其他" ? employee.work.titleJob.other || "其他" : employee.work.titleJob.preset;
    }

    if (fieldId === "work.onboardDate") {
      return formApi.formatDateParts(employee.work.onboardDate);
    }

    if (fieldId === "basic.age") {
      return employee.basic.age || "";
    }

    return formApi.getValueAtPath(employee, fieldId) || "";
  }

  function getActiveTabConfig() {
    const activeId = state.activeTabByDepartment[state.selectedDepartmentId];
    const tabs = state.tabsByDepartment[state.selectedDepartmentId] || [];

    return tabs.find(function (tab) {
      return tab.id === activeId;
    }) || null;
  }

  function formatTabConditionSummary(condition) {
    const field = getTabFieldConfig(condition.fieldId);
    const operator = getTabOperators(condition.fieldId).find(function (option) {
      return option.id === condition.operator;
    });

    return [field.label, operator ? operator.label : "", condition.value].filter(Boolean).join(" ");
  }

  function formatTabSummary(tab) {
    const conditions = Array.isArray(tab && tab.conditions) ? tab.conditions : [];

    if (!conditions.length) {
      return "";
    }

    return conditions.map(function (condition) {
      return formatTabConditionSummary(condition);
    }).join(" 且 ");
  }

  function doesEmployeeMatchCondition(employee, condition) {
    if (!condition || !condition.fieldId || !condition.operator) {
      return true;
    }

    const field = getTabFieldConfig(condition.fieldId);
    const rawValue = resolveEmployeeFieldValue(employee, condition.fieldId);
    const employeeValue = String(rawValue || "").trim();
    const filterValue = String(condition.value || "").trim();

    if (!filterValue) {
      return true;
    }

    if (field.type === "date") {
      if (!employeeValue) {
        return false;
      }

      if (condition.operator === "before") {
        return employeeValue < filterValue;
      }

      if (condition.operator === "after") {
        return employeeValue > filterValue;
      }

      return employeeValue === filterValue;
    }

    if (field.type === "number") {
      const employeeNumber = Number(employeeValue);
      const filterNumber = Number(filterValue);

      if (!Number.isFinite(employeeNumber) || !Number.isFinite(filterNumber)) {
        return false;
      }

      if (condition.operator === "before") {
        return employeeNumber < filterNumber;
      }

      if (condition.operator === "after") {
        return employeeNumber > filterNumber;
      }

      return employeeNumber === filterNumber;
    }

    const left = employeeValue.toLowerCase();
    const right = filterValue.toLowerCase();

    if (condition.operator === "contains") {
      return left.indexOf(right) >= 0;
    }

    if (condition.operator === "isNot") {
      return left !== right;
    }

    return left === right;
  }

  function doesEmployeeMatchTab(employee, tab) {
    const conditions = Array.isArray(tab && tab.conditions) ? tab.conditions : [];

    if (!conditions.length) {
      return true;
    }

    return conditions.every(function (condition) {
      return doesEmployeeMatchCondition(employee, condition);
    });
  }

  function getVisibleEmployees() {
    const searchQuery = state.searchQuery.trim().toLowerCase();
    const selectedDepartmentId = state.selectedDepartmentId;
    const activeTab = isRetiredView() ? null : getActiveTabConfig();
    const filteredEmployees = state.employees.filter(function (employee) {
      const inDepartment = isRetiredView()
        ? employee.work.status === "離職"
        : employee.departmentId === selectedDepartmentId;

      if (!inDepartment) {
        return false;
      }

      if (state.filters.position !== "全部" && employee.work.position !== state.filters.position) {
        return false;
      }

      if (state.filters.status !== "全部" && employee.work.status !== state.filters.status) {
        return false;
      }

      if (activeTab && !doesEmployeeMatchTab(employee, activeTab)) {
        return false;
      }

      if (!searchQuery) {
        return true;
      }

      return [
        employee.basic.vieName,
        employee.basic.engName,
        employee.basic.ydiId,
        formApi.normalizePhoneValue(employee.contact.phoneNumber).number,
        employee.work.position
      ].some(function (value) {
        return String(value || "").toLowerCase().indexOf(searchQuery) >= 0;
      });
    });

    const sortMode = isRetiredView() ? "retiredSoonest" : state.sortMode;
    const positionRank = function (position) {
      const index = dataApi.POSITION_OPTIONS.indexOf(position);
      return index >= 0 ? index : 0;
    };

    return filteredEmployees.slice().sort(function (left, right) {
      if (sortMode === "createdAsc") {
        return left.createdAt - right.createdAt;
      }

      if (sortMode === "positionDesc") {
        return positionRank(right.work.position) - positionRank(left.work.position);
      }

      if (sortMode === "positionAsc") {
        return positionRank(left.work.position) - positionRank(right.work.position);
      }

      if (sortMode === "onboardOldest") {
        return formApi.createDateFromParts(left.work.onboardDate) - formApi.createDateFromParts(right.work.onboardDate);
      }

      if (sortMode === "onboardNewest") {
        return formApi.createDateFromParts(right.work.onboardDate) - formApi.createDateFromParts(left.work.onboardDate);
      }

      if (sortMode === "ageAsc") {
        return Number(left.basic.age || 0) - Number(right.basic.age || 0);
      }

      if (sortMode === "ageDesc") {
        return Number(right.basic.age || 0) - Number(left.basic.age || 0);
      }

      if (sortMode === "retiredSoonest") {
        return formApi.createDateFromParts(left.work.lastDay) - formApi.createDateFromParts(right.work.lastDay);
      }

      return left.createdAt - right.createdAt;
    });
  }

  function getVisibleTabs() {
    const tabs = state.tabsByDepartment[state.selectedDepartmentId] || [];
    const activeId = state.activeTabByDepartment[state.selectedDepartmentId];
    let visibleTabs = tabs.slice(0, 3);

    if (activeId && visibleTabs.every(function (tab) { return tab.id !== activeId; })) {
      const activeTab = tabs.find(function (tab) { return tab.id === activeId; });

      if (activeTab && visibleTabs.length) {
        visibleTabs = visibleTabs.slice(0, visibleTabs.length - 1).concat([activeTab]);
      }
    }

    const visibleIds = visibleTabs.map(function (tab) { return tab.id; });
    const hiddenTabs = tabs.filter(function (tab) { return visibleIds.indexOf(tab.id) === -1; });

    return {
      visibleTabs: visibleTabs,
      hiddenTabs: hiddenTabs
    };
  }

  function getIconSvg(iconType) {
    if (iconType === "search") {
      return '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 16L21 21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    }

    if (iconType === "filter") {
      return '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 5h16l-6 7v6l-4 2v-8L4 5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';
    }

    if (iconType === "more") {
      return '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="5" r="1.9" fill="currentColor"/><circle cx="12" cy="12" r="1.9" fill="currentColor"/><circle cx="12" cy="19" r="1.9" fill="currentColor"/></svg>';
    }

    if (iconType === "plus") {
      return '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    }

    if (iconType === "edit") {
      return '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 20l4.5-1 9-9-3.5-3.5-9 9L4 20z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M13.5 6.5l3.5 3.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
    }

    if (iconType === "trash") {
      return '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M5 7h14M9 7V4h6v3M8 7v12h8V7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }

    if (iconType === "grip") {
      return "⋮⋮";
    }

    return "";
  }

  function renderSidebar() {
    const selectedDepartmentId = state.selectedDepartmentId;
    const subtitleText = state.interfaceMeta.subtitle || dataApi.DEFAULT_INTERFACE_SUBTITLE;

    dom.sidebarMount.innerHTML = [
      '<div class="employees-sidebar__header">',
      '<div class="employees-sidebar__icon-wrap">',
      '<button type="button" class="employees-sidebar__icon-button" data-action="choose-interface-icon" data-tooltip="點擊更換介面圖片">',
      '<img class="employees-sidebar__icon-preview" src="' + escapeHtml(state.interfaceMeta.iconSrc) + '" alt="介面圖示">',
      "</button>",
      state.interfaceMeta.customIcon
        ? '<div class="employees-sidebar__icon-tools"><button type="button" class="employees-icon-button employees-icon-button--ghost employees-icon-button--danger" data-action="reset-interface-icon" aria-label="還原介面圖片">' + getIconSvg("trash") + "</button></div>"
        : "",
      "</div>",
      '<div class="employees-sidebar__text">',
      '<div class="employees-sidebar__title-row">',
      uiState.editingTitle
        ? '<input id="employeesTitleInput" class="employees-sidebar__title-input" type="text" value="' + escapeHtml(uiState.titleDraft) + '">'
        : '<h1 class="employees-sidebar__title">' + escapeHtml(state.interfaceMeta.title) + "</h1>",
      '<div class="employees-sidebar__title-actions">',
      '<button type="button" class="employees-icon-button employees-icon-button--ghost" data-action="toggle-title-edit" aria-label="編輯標題">' + getIconSvg("edit") + "</button>",
      "</div>",
      "</div>",
      '<div class="employees-sidebar__subtitle-row">',
      uiState.editingSubtitle
        ? '<input id="employeesSubtitleInput" class="employees-sidebar__title-input employees-sidebar__subtitle-input" type="text" value="' + escapeHtml(uiState.subtitleDraft) + '">'
        : '<div class="employees-sidebar__caption">' + escapeHtml(subtitleText) + "</div>",
      '<div class="employees-sidebar__title-actions">',
      '<button type="button" class="employees-icon-button employees-icon-button--ghost" data-action="toggle-subtitle-edit" aria-label="編輯說明">' + getIconSvg("edit") + "</button>",
      "</div>",
      "</div>",
      "</div>",
      "</div>",
      '<div class="employees-sidebar__body">',
      '<h2 class="employees-sidebar__section-title">部門</h2>',
      '<div class="employees-sidebar__list" id="employeesDepartmentList">',
      state.departments.map(function (department) {
        const isEditing = uiState.editingDepartmentId === department.id;
        const isActive = selectedDepartmentId === department.id;
        const isMenuOpen = uiState.openDepartmentMenuId === department.id;

        return [
          '<div class="employees-department' + (isActive ? " employees-department--active" : "") + '" draggable="true" data-department-id="' + escapeHtml(department.id) + '" data-action="select-department">',
          '<div class="employees-department__grip" aria-hidden="true">' + escapeHtml(getIconSvg("grip")) + "</div>",
          isEditing
            ? '<input class="employees-department__edit-input" data-role="department-edit-input" type="text" value="' + escapeHtml(uiState.departmentEditDraft) + '">'
            : '<div class="employees-department__name">' + escapeHtml(department.name) + "</div>",
          '<div class="employees-department__menu">',
          '<button type="button" class="employees-icon-button employees-icon-button--ghost employees-department__menu-button" data-action="toggle-department-menu" data-department-id="' + escapeHtml(department.id) + '" aria-label="部門選單">' + getIconSvg("more") + "</button>",
          isMenuOpen
            ? '<div class="employees-department__menu-panel"><button type="button" data-action="start-edit-department" data-department-id="' + escapeHtml(department.id) + '">編輯</button><button type="button" data-action="delete-department" data-department-id="' + escapeHtml(department.id) + '">刪除</button></div>'
            : "",
          "</div>",
          "</div>"
        ].join("");
      }).join(""),
      '<div class="employees-department-fixed employees-department--retired">',
      '<button type="button" class="employees-department employees-department--retired-row' + (selectedDepartmentId === dataApi.RETIRED_DEPARTMENT.id ? " employees-department--active" : "") + '" data-action="select-department" data-department-id="' + escapeHtml(dataApi.RETIRED_DEPARTMENT.id) + '"><div class="employees-department__grip employees-department__grip--empty" aria-hidden="true"></div><div class="employees-department__name">' + escapeHtml(dataApi.RETIRED_DEPARTMENT.name) + "</div></button>",
      "</div>",
      '<div class="employees-department-add">',
      uiState.addingDepartment
        ? '<input id="employeesDepartmentInput" class="employees-department-add__input" type="text" value="' + escapeHtml(uiState.departmentDraft) + '" placeholder="請輸入部門名稱">'
        : '<button type="button" class="employees-department-add__button" data-action="start-add-department"><span>' + getIconSvg("plus") + '</span><strong>新增部門</strong></button>',
      "</div>",
      "</div>",
      "</div>"
    ].join("");
  }

  function renderMainHeader() {
    const selectedDepartment = getSelectedDepartment();
    const mainNote = getMainNote(selectedDepartment.id);

    dom.mainHeaderMount.innerHTML = [
      '<div class="employees-main__title-row">',
      '<div class="employees-main__title-wrap">',
      '<h1>' + escapeHtml(selectedDepartment.name) + "</h1>",
      '<div class="employees-main__note-row">',
      uiState.editingMainNote
        ? '<input id="employeesMainNoteInput" class="employees-main__title-note-input" type="text" value="' + escapeHtml(uiState.mainNoteDraft) + '">'
        : '<div class="employees-main__title-note">' + escapeHtml(mainNote) + "</div>",
      '<div class="employees-main__note-actions">',
      '<button type="button" class="employees-icon-button employees-icon-button--ghost" data-action="toggle-main-note-edit" aria-label="編輯主區說明">' + getIconSvg("edit") + "</button>",
      "</div>",
      "</div>",
      "</div>",
      '<div class="employees-main__actions"></div>',
      "</div>"
    ].join("");
  }

  function renderFilterPopover() {
    return [
      '<div class="employees-popover" data-modal-body="true">',
      '<div class="employees-popover__section-title">篩選</div>',
      '<div class="employees-popover__field"><label>職位</label><select data-setting="filter-position"><option value="全部">全部</option>' + dataApi.POSITION_OPTIONS.map(function (option) {
        return '<option value="' + escapeHtml(option) + '"' + (state.filters.position === option ? " selected" : "") + ">" + escapeHtml(option) + "</option>";
      }).join("") + "</select></div>",
      '<div class="employees-popover__field"><label>狀態</label><select data-setting="filter-status">' +
      ['全部'].concat(dataApi.STATUS_OPTIONS).map(function (option) {
        return '<option value="' + escapeHtml(option) + '"' + (state.filters.status === option ? " selected" : "") + ">" + escapeHtml(option) + "</option>";
      }).join("") +
      "</select></div>",
      '<button type="button" class="employees-inline-action" data-action="clear-filters">清除篩選</button>',
      "</div>"
    ].join("");
  }

  function renderDisplayPopover() {
    const selectedSort = isRetiredView() ? "retiredSoonest" : state.sortMode;

    return [
      '<div class="employees-popover" data-modal-body="true">',
      '<div class="employees-popover__section-title">卡片顯示</div>',
      '<div class="employees-popover__field"><label>主標題</label><select data-setting="card-title">' + dataApi.CARD_FIELD_OPTIONS.map(function (field) {
        return '<option value="' + escapeHtml(field.id) + '"' + (state.cardDisplay.titleField === field.id ? " selected" : "") + ">" + escapeHtml(field.label) + "</option>";
      }).join("") + "</select></div>",
      state.cardDisplay.extraFieldIds.map(function (fieldId, index) {
        return '<div class="employees-popover__field"><label>欄位 ' + String(index + 1) + '</label><select data-setting="card-extra-' + String(index) + '">' + dataApi.CARD_FIELD_OPTIONS.map(function (field) {
          return '<option value="' + escapeHtml(field.id) + '"' + (fieldId === field.id ? " selected" : "") + ">" + escapeHtml(field.label) + "</option>";
        }).join("") + "</select></div>";
      }).join(""),
      '<div class="employees-popover__section-title">排序</div>',
      '<div class="employees-popover__field"><label>排序方式</label><select data-setting="sort-mode">' + dataApi.SORT_OPTIONS.filter(function (option) {
        return !isRetiredView() || option.id === "retiredSoonest";
      }).map(function (option) {
        return '<option value="' + escapeHtml(option.id) + '"' + (selectedSort === option.id ? " selected" : "") + ">" + escapeHtml(option.label) + "</option>";
      }).join("") + "</select></div>",
      "</div>"
    ].join("");
  }

  function renderTabValueControl(condition, conditionIndex) {
    const draftField = getTabFieldConfig(condition.fieldId);
    const inputAttrs = 'data-tab-condition-index="' + String(conditionIndex) + '" data-tab-condition-key="value"';

    if (draftField.type === "select") {
      return '<div class="employees-toolbar__composer-field"><label>內容</label><select ' + inputAttrs + '>' + getFieldOptionList(draftField.id).map(function (option) {
        return '<option value="' + escapeHtml(option) + '"' + (condition.value === option ? " selected" : "") + ">" + escapeHtml(option) + "</option>";
      }).join("") + "</select></div>";
    }

    if (draftField.type === "date") {
      return '<div class="employees-toolbar__composer-field"><label>日期</label><input type="text" ' + inputAttrs + ' value="' + escapeHtml(condition.value) + '" placeholder="2026-03-31"></div>';
    }

    if (draftField.type === "number") {
      return '<div class="employees-toolbar__composer-field"><label>數值</label><input type="number" ' + inputAttrs + ' value="' + escapeHtml(condition.value) + '" placeholder="0"></div>';
    }

    return '<div class="employees-toolbar__composer-field"><label>內容</label><input type="text" ' + inputAttrs + ' value="' + escapeHtml(condition.value) + '" placeholder="請輸入條件"></div>';
  }

  function renderTabConditionComposer(condition, conditionIndex, totalConditions) {
    return [
      '<div class="employees-toolbar__condition-row">',
      '<div class="employees-toolbar__composer-field"><label>欄位</label><select data-tab-condition-index="' + String(conditionIndex) + '" data-tab-condition-key="fieldId">' + TAB_FILTER_FIELDS.map(function (field) {
        return '<option value="' + escapeHtml(field.id) + '"' + (condition.fieldId === field.id ? " selected" : "") + ">" + escapeHtml(field.label) + "</option>";
      }).join("") + "</select></div>",
      '<div class="employees-toolbar__composer-field"><label>條件</label><select data-tab-condition-index="' + String(conditionIndex) + '" data-tab-condition-key="operator">' + getTabOperators(condition.fieldId).map(function (operator) {
        return '<option value="' + escapeHtml(operator.id) + '"' + (condition.operator === operator.id ? " selected" : "") + ">" + escapeHtml(operator.label) + "</option>";
      }).join("") + "</select></div>",
      renderTabValueControl(condition, conditionIndex),
      '<div class="employees-toolbar__condition-actions">' +
        (totalConditions > 1
          ? '<button type="button" class="employees-icon-button employees-icon-button--ghost employees-icon-button--danger" data-action="remove-tab-condition" data-tab-condition-index="' + String(conditionIndex) + '" aria-label="移除條件">✕</button>'
          : "") +
      "</div>",
      "</div>"
    ].join("");
  }

  function renderToolbar() {
    const visibleTabsData = getVisibleTabs();
    const activeTabId = state.activeTabByDepartment[state.selectedDepartmentId] || "";
    const activeTab = getActiveTabConfig();

    if (isRetiredView()) {
      dom.toolbarMount.innerHTML = [
        '<div class="employees-toolbar">',
        '<div class="employees-toolbar__left"></div>',
        '<div class="employees-toolbar__right">',
        uiState.showSearchInput ? '<input class="employees-search-box" data-path="searchQuery" value="' + escapeHtml(state.searchQuery) + '" placeholder="搜尋員工">' : "",
        '<button type="button" class="employees-tool-icon" data-action="toggle-search" data-tooltip="搜尋">' + getIconSvg("search") + "</button>",
        '<div class="employees-tool-group" data-tool-group="filter">',
        '<button type="button" class="employees-tool-icon" data-action="toggle-filter-menu" data-tooltip="篩選">' + getIconSvg("filter") + "</button>",
        uiState.showFilterMenu ? renderFilterPopover() : "",
        "</div>",
        "</div>",
        "</div>"
      ].join("");

      return;
    }

    dom.toolbarMount.innerHTML = [
      '<div class="employees-toolbar">',
      '<div class="employees-toolbar__left">',
      '<div class="employees-tabs">',
      visibleTabsData.visibleTabs.map(function (tab) {
        return '<button type="button" class="employees-tab' + (activeTabId === tab.id ? " employees-tab--active" : "") + '" data-action="select-tab" data-tab-id="' + escapeHtml(tab.id) + '" title="' + escapeHtml(formatTabSummary(tab)) + '">' + escapeHtml(tab.name || formatTabSummary(tab)) + '<span class="employees-tab__condition">' + escapeHtml(formatTabSummary(tab)) + "</span></button>";
      }).join(""),
      visibleTabsData.hiddenTabs.length
        ? '<div class="employees-tool-group" data-tool-group="more-tabs"><button type="button" class="employees-tab" data-action="toggle-more-tabs">更多</button>' +
          (uiState.openMoreTabs ? '<div class="employees-popover" data-modal-body="true">' + visibleTabsData.hiddenTabs.map(function (tab) {
            return '<button type="button" class="employees-inline-action" data-action="select-tab" data-tab-id="' + escapeHtml(tab.id) + '">' + escapeHtml(tab.name || formatTabSummary(tab)) + "</button>";
          }).join("") + "</div>" : "") +
          "</div>"
        : "",
      '<button type="button" class="employees-tab" data-action="start-create-tab" title="新增分頁">' + getIconSvg("plus") + "</button>",
      activeTab && !uiState.creatingTab
        ? '<div class="employees-tabs__actions"><button type="button" class="employees-icon-button employees-icon-button--ghost" data-action="start-edit-tab" aria-label="編輯分頁">' + getIconSvg("edit") + '</button><button type="button" class="employees-icon-button employees-icon-button--ghost employees-icon-button--danger" data-action="delete-active-tab" aria-label="刪除分頁">✕</button></div>'
        : "",
      "</div>",
      uiState.creatingTab
        ? '<div class="employees-toolbar__composer">' +
          '<div class="employees-toolbar__composer-field employees-toolbar__composer-field--wide"><label>分頁名稱</label><input type="text" id="employeesTabNameInput" value="' + escapeHtml(uiState.tabDraft.name) + '" placeholder="可留空，由條件自動命名"></div>' +
          '<div class="employees-toolbar__composer-note">同一分頁內的條件必須全部成立，才會顯示在這個分頁。</div>' +
          uiState.tabDraft.conditions.map(function (condition, index) {
            return renderTabConditionComposer(condition, index, uiState.tabDraft.conditions.length);
          }).join("") +
          '<div class="employees-toolbar__composer-footer"><button type="button" class="employees-secondary-button" data-action="add-tab-condition">' + getIconSvg("plus") + '<span>新增條件</span></button><button type="button" class="employees-secondary-button" data-action="cancel-tab-composer">取消</button><button type="button" class="employees-primary-button employees-toolbar__composer-confirm" data-action="confirm-create-tab">' + (uiState.editingTabId ? "儲存分頁" : "建立分頁") + "</button></div>" +
          "</div>"
        : "",
      "</div>",
      '<div class="employees-toolbar__right">',
      uiState.showSearchInput ? '<input class="employees-search-box" data-path="searchQuery" value="' + escapeHtml(state.searchQuery) + '" placeholder="搜尋員工">' : "",
      '<button type="button" class="employees-tool-icon" data-action="toggle-search" data-tooltip="搜尋">' + getIconSvg("search") + "</button>",
      '<div class="employees-tool-group" data-tool-group="filter">',
      '<button type="button" class="employees-tool-icon" data-action="toggle-filter-menu" data-tooltip="篩選">' + getIconSvg("filter") + "</button>",
      uiState.showFilterMenu ? renderFilterPopover() : "",
      "</div>",
      '<div class="employees-tool-group" data-tool-group="display">',
      '<button type="button" class="employees-tool-icon" data-action="toggle-display-menu" data-tooltip="顯示設定">' + getIconSvg("more") + "</button>",
      uiState.showDisplayMenu ? renderDisplayPopover() : "",
      "</div>",
      "</div>",
      "</div>"
    ].join("");
  }

  function renderCards() {
    const employees = getVisibleEmployees();

    if (!employees.length) {
      dom.cardsMount.innerHTML = '<div class="employees-cards-panel"><div class="employees-empty">目前沒有符合條件的員工資料。</div></div>';
      return;
    }

    dom.cardsMount.innerHTML = '<div class="employees-cards-panel"><div class="employees-cards">' + employees.map(function (employee) {
      const lines = state.cardDisplay.extraFieldIds.map(function (fieldId) {
        const fieldOption = dataApi.CARD_FIELD_OPTIONS.find(function (option) { return option.id === fieldId; });

        return [
          '<div class="employees-card__line">',
          '<div class="employees-card__label">' + escapeHtml(fieldOption ? fieldOption.label : fieldId) + "</div>",
          '<div class="employees-card__value">' + escapeHtml(formApi.getFieldDisplayValue(employee, fieldId)) + "</div>",
          "</div>"
        ].join("");
      }).join("");

      return [
        '<article class="employees-card' + (uiState.selectedEmployeeId === employee.id ? " employees-card--active" : "") + '" data-action="select-employee" data-employee-id="' + escapeHtml(employee.id) + '">',
        '<img class="employees-card__avatar" src="' + escapeHtml(employee.avatarSrc || dataApi.DEFAULT_IMAGE_SRC) + '" alt="' + escapeHtml(employee.basic.engName || employee.basic.vieName || "員工頭像") + '">',
        '<div class="employees-card__body">',
        '<h2 class="employees-card__title">' + escapeHtml(formApi.getFieldDisplayValue(employee, state.cardDisplay.titleField)) + "</h2>",
        lines,
        "</div>",
        "</article>"
      ].join("");
    }).join("") + "</div></div>";
  }

  function autoResizeRemark() {
    const remarkField = dom.detailMount.querySelector('textarea[data-path="other.remark"]');
    if (!remarkField) {
      return;
    }

    remarkField.style.height = "auto";
    remarkField.style.height = String(remarkField.scrollHeight) + "px";
  }

  function captureDetailContext() {
    const content = dom.detailMount.querySelector(".employees-detail__content");
    const activeElement = document.activeElement;

    if (!content) {
      return null;
    }

    return {
      scrollTop: content.scrollTop,
      selector: activeElement && dom.detailMount.contains(activeElement)
        ? (activeElement.getAttribute("data-path")
          ? '[data-path="' + activeElement.getAttribute("data-path") + '"]'
          : activeElement.id
            ? "#" + activeElement.id
            : activeElement.getAttribute("data-role")
              ? '[data-role="' + activeElement.getAttribute("data-role") + '"]'
              : "")
        : "",
      selectionStart: activeElement && typeof activeElement.selectionStart === "number" ? activeElement.selectionStart : null,
      selectionEnd: activeElement && typeof activeElement.selectionEnd === "number" ? activeElement.selectionEnd : null
    };
  }

  function restoreDetailContext(context) {
    const content = dom.detailMount.querySelector(".employees-detail__content");

    if (!context || !content) {
      return;
    }

    content.scrollTop = context.scrollTop;

    if (!context.selector) {
      return;
    }

    const target = dom.detailMount.querySelector(context.selector);

    if (!target) {
      return;
    }

    target.focus();

    if (typeof context.selectionStart === "number" && typeof target.setSelectionRange === "function") {
      target.setSelectionRange(context.selectionStart, context.selectionEnd);
    }
  }

  function renderDetailPanel(preserveContext) {
    const draft = getCurrentDraftEmployee();
    const isPanelOpen = isDetailOpen();
    const isEditable = uiState.detailMode === "add" || uiState.detailMode === "edit";
    const selectedEmployee = getEmployeeById(uiState.selectedEmployeeId);
    const inRetired = isRetiredView();
    const detailContext = preserveContext ? captureDetailContext() : null;

    dom.workspace.className = "employees-workspace" + (isPanelOpen ? " employees-workspace--panel-open" : "");

    if (!isPanelOpen || !draft) {
      dom.detailMount.innerHTML = "";
      return;
    }

    dom.detailMount.innerHTML = [
      '<div class="employees-detail__actions">',
      '<button type="button" class="employees-secondary-button employees-detail__collapse" data-action="request-close-panel">&gt;&gt;</button>',
      '<div class="employees-detail__actions-right">' +
        (selectedEmployee && uiState.detailMode !== "add"
          ? '<button type="button" class="employees-secondary-button employees-primary-button--danger" data-action="request-delete-employee">刪除</button>'
          : "") +
        (!inRetired ? '<button type="button" class="employees-primary-button" data-action="open-add-panel">' + getIconSvg("plus") + '<span>新增</span></button>' : "") +
      "</div>",
      "</div>",
      '<div class="employees-detail__content">',
      '<div class="employees-avatar-box">',
      '<div class="employees-avatar-box__preview-wrap">',
      '<button type="button" class="employees-avatar-box__preview" data-action="preview-avatar" data-tooltip="' + escapeHtml(isEditable ? "點擊查看或更換頭像" : "點擊查看頭像") + '">',
      '<img src="' + escapeHtml(draft.avatarSrc || dataApi.DEFAULT_IMAGE_SRC) + '" alt="員工頭像">',
      "</button>",
      "</div>",
      '<div class="employees-avatar-box__meta">' + (isEditable ? "點擊頭像可預覽或更換" : "點擊頭像可放大預覽") + "</div>",
      "</div>",
      '<div class="employee-form">' + formApi.renderEmployeeFormSections(draft, { isEditable: isEditable, statusLocked: uiState.detailMode === "add", pendingAttachments: uiState.pendingAttachments }) + "</div>",
      "</div>",
      !inRetired ? [
        '<div class="employees-detail__footer">',
        '<button type="button" class="employees-primary-button" data-action="save-employee"' + (uiState.detailMode === "view" ? " disabled" : "") + ">儲存</button>",
        '<button type="button" class="employees-secondary-button" data-action="start-edit-employee"' + (uiState.detailMode !== "view" ? " disabled" : "") + ">編輯</button>",
        "</div>"
      ].join("") : ""
    ].join("");

    autoResizeRemark();
    restoreDetailContext(detailContext);
  }

  function renderModal() {
    if (!uiState.openModal) {
      dom.modalMount.className = "employees-modal-root";
      dom.modalMount.innerHTML = "";
      return;
    }

    dom.modalMount.className = "employees-modal-root employees-modal-root--active";

    if (uiState.openModal === "confirm-delete") {
      dom.modalMount.innerHTML = [
        '<div class="employees-modal"><div class="employees-modal__card" data-modal-body="true">',
        '<h2 class="employees-modal__title">確認刪除</h2>',
        '<div class="employees-modal__text">確定要刪除此員工資料嗎？</div>',
        '<div class="employees-modal__actions">',
        '<button type="button" class="employees-secondary-button" data-action="close-modal">取消</button>',
        '<button type="button" class="employees-primary-button employees-primary-button--danger" data-action="open-password-modal">確認</button>',
        "</div></div></div>"
      ].join("");
      return;
    }

    if (uiState.openModal === "password-delete") {
      dom.modalMount.innerHTML = [
        '<div class="employees-modal"><div class="employees-modal__card" data-modal-body="true">',
        '<h2 class="employees-modal__title">請輸入刪除密碼</h2>',
        '<div class="employees-modal__text">密碼固定為：091100</div>',
        '<input id="employeesPasswordInput" class="employees-modal__input" type="password" value="' + escapeHtml(uiState.passwordDraft) + '">',
        uiState.passwordError ? '<div class="employees-modal__text" style="color:#ff8a80;">' + escapeHtml(uiState.passwordError) + "</div>" : "",
        '<div class="employees-modal__actions">',
        '<button type="button" class="employees-secondary-button" data-action="close-modal">取消</button>',
        '<button type="button" class="employees-primary-button employees-primary-button--danger" data-action="confirm-delete-employee">刪除</button>',
        "</div></div></div>"
      ].join("");
      return;
    }

    if (uiState.openModal === "password-delete-attachment") {
      dom.modalMount.innerHTML = [
        '<div class="employees-modal"><div class="employees-modal__card" data-modal-body="true">',
        '<h2 class="employees-modal__title">請輸入檔案刪除密碼</h2>',
        '<div class="employees-modal__text">密碼固定為：09110</div>',
        '<input id="employeesPasswordInput" class="employees-modal__input" type="password" value="' + escapeHtml(uiState.passwordDraft) + '">',
        uiState.passwordError ? '<div class="employees-modal__text" style="color:#ff8a80;">' + escapeHtml(uiState.passwordError) + "</div>" : "",
        '<div class="employees-modal__actions">',
        '<button type="button" class="employees-secondary-button" data-action="close-modal">取消</button>',
        '<button type="button" class="employees-primary-button employees-primary-button--danger" data-action="confirm-delete-attachment">刪除</button>',
        "</div></div></div>"
      ].join("");
      return;
    }

    if (uiState.openModal === "confirm-close") {
      dom.modalMount.innerHTML = [
        '<div class="employees-modal"><div class="employees-modal__card" data-modal-body="true">',
        '<h2 class="employees-modal__title">確認關閉</h2>',
        '<div class="employees-modal__text">各項資料可能不會儲存，是否確認繼續？</div>',
        '<div class="employees-modal__actions">',
        '<button type="button" class="employees-secondary-button" data-action="close-modal">取消</button>',
        '<button type="button" class="employees-primary-button" data-action="confirm-close-panel">確認</button>',
        "</div></div></div>"
      ].join("");
      return;
    }

    if (uiState.openModal === "notice") {
      dom.modalMount.innerHTML = [
        '<div class="employees-modal"><div class="employees-modal__card" data-modal-body="true">',
        '<h2 class="employees-modal__title">提示</h2>',
        '<div class="employees-modal__text">' + escapeHtml(uiState.noticeText) + "</div>",
        '<div class="employees-modal__actions"><button type="button" class="employees-primary-button" data-action="close-modal">確認</button></div>',
        "</div></div>"
      ].join("");
      return;
    }

    if (uiState.openModal === "preview-avatar") {
      dom.modalMount.innerHTML = [
        '<div class="employees-modal">',
        '<button type="button" class="employees-image-preview__backdrop" data-action="close-modal" aria-label="關閉預覽"></button>',
        '<div class="employees-image-preview" data-modal-body="true">',
        '<div class="employees-image-preview__frame-wrap">',
        '<button type="button" class="employees-icon-button employees-icon-button--ghost employees-image-preview__close" data-action="close-modal" aria-label="關閉預覽">✕</button>',
        '<div class="employees-image-preview__frame">',
        '<img src="' + escapeHtml(uiState.previewImageSrc) + '" alt="頭像預覽">',
        "</div></div>",
        '<div class="employees-image-preview__actions">' +
          (uiState.detailMode === "add" || uiState.detailMode === "edit"
            ? '<button type="button" class="employees-secondary-button" data-action="choose-avatar">更換</button>' +
              (uiState.draftEmployee && uiState.draftEmployee.avatarChanged ? '<button type="button" class="employees-secondary-button employees-primary-button--danger" data-action="reset-avatar">還原</button>' : "")
            : "") +
        "</div>",
        "</div></div>"
      ].join("");
    }
  }

  function focusPendingInputs() {
    window.requestAnimationFrame(function () {
      if (uiState.openModal === "password-delete" || uiState.openModal === "password-delete-attachment") {
        const passwordInput = document.getElementById("employeesPasswordInput");
        if (passwordInput) {
          passwordInput.focus();
        }
        return;
      }

      if (uiState.editingTitle) {
        const titleInput = document.getElementById("employeesTitleInput");
        if (titleInput) {
          titleInput.focus();
          titleInput.select();
        }
        return;
      }

      if (uiState.editingSubtitle) {
        const subtitleInput = document.getElementById("employeesSubtitleInput");
        if (subtitleInput) {
          subtitleInput.focus();
          subtitleInput.select();
        }
        return;
      }

      if (uiState.editingMainNote) {
        const mainNoteInput = document.getElementById("employeesMainNoteInput");
        if (mainNoteInput) {
          mainNoteInput.focus();
          mainNoteInput.select();
        }
        return;
      }

      if (uiState.addingDepartment) {
        const departmentInput = document.getElementById("employeesDepartmentInput");
        if (departmentInput) {
          departmentInput.focus();
          departmentInput.select();
        }
        return;
      }

      if (uiState.editingDepartmentId) {
        const editInput = document.querySelector('[data-role="department-edit-input"]');
        if (editInput) {
          editInput.focus();
          editInput.select();
        }
        return;
      }

      if (uiState.creatingTab) {
        const tabInput = document.getElementById("employeesTabNameInput") || document.querySelector("[data-tab-condition-index]");
        if (tabInput) {
          tabInput.focus();
        }
      }
    });
  }

  function renderAll() {
    renderSidebar();
    renderMainHeader();
    renderToolbar();
    renderCards();
    renderDetailPanel();
    renderModal();
    focusPendingInputs();
  }

  function openNotice(message) {
    uiState.noticeText = message;
    uiState.openModal = "notice";
    renderModal();
  }

  function getNextCreatedOrder() {
    return state.employees.reduce(function (maxValue, employee) {
      return Math.max(maxValue, employee.createdAt || 0);
    }, 0) + 1;
  }

  function startAddEmployee() {
    if (!isNormalDepartmentView()) {
      return;
    }

    const selectedDepartmentName = getSelectedDepartment().name;
    const draft = dataApi.createEmptyEmployeeDraft(selectedDepartmentName);

    uiState.detailMode = "add";
    uiState.selectedEmployeeId = "";
    uiState.draftEmployee = formApi.applyDerivedFields(draft);
    uiState.referenceEmployee = null;
    uiState.avatarDirty = false;
    uiState.pendingAttachments = [];
    renderAll();
  }

  function selectEmployee(employeeId) {
    const employee = getEmployeeById(employeeId);

    if (!employee) {
      return;
    }

    uiState.selectedEmployeeId = employeeId;
    uiState.detailMode = "view";
    uiState.draftEmployee = formApi.cloneDraft(employee);
    uiState.referenceEmployee = formApi.cloneDraft(employee);
    uiState.avatarDirty = false;
    uiState.pendingAttachments = [];
    renderAll();
  }

  function startEditEmployee() {
    if (!uiState.selectedEmployeeId) {
      return;
    }

    uiState.detailMode = "edit";
    renderDetailPanel();
  }

  function saveEmployee() {
    while (uiState.pendingAttachments.length) {
      confirmPendingAttachment(0);
    }

    const draft = getCurrentDraftEmployee();

    if (!draft) {
      return;
    }

    const fallbackDepartmentId = isRetiredView() && uiState.selectedEmployeeId
      ? getEmployeeById(uiState.selectedEmployeeId).departmentId
      : state.selectedDepartmentId;
    const selectedDepartmentId = resolveDepartmentIdForDraft(draft, fallbackDepartmentId);
    const nextId = uiState.selectedEmployeeId || "employee-" + Date.now();
    const createdAt = uiState.selectedEmployeeId ? getEmployeeById(uiState.selectedEmployeeId).createdAt : getNextCreatedOrder();
    const serialized = formApi.serializeDraft(draft, selectedDepartmentId, createdAt, nextId);
    const existingIndex = state.employees.findIndex(function (employee) {
      return employee.id === nextId;
    });

    if (existingIndex >= 0) {
      state.employees.splice(existingIndex, 1, serialized);
    } else {
      state.employees.push(serialized);
    }

    persistState();
    uiState.detailMode = "view";
    uiState.selectedEmployeeId = serialized.id;
    uiState.draftEmployee = formApi.cloneDraft(serialized);
    uiState.referenceEmployee = formApi.cloneDraft(serialized);
    uiState.avatarDirty = false;
    uiState.pendingAttachments = [];
    renderAll();
  }

  function closePanelImmediately() {
    uiState.detailMode = "hidden";
    uiState.selectedEmployeeId = "";
    uiState.draftEmployee = null;
    uiState.referenceEmployee = null;
    uiState.avatarDirty = false;
    uiState.pendingAttachments = [];
    uiState.attachmentDeleteIndex = -1;
    uiState.openModal = null;
    renderAll();
  }

  function requestClosePanel() {
    if (isDetailDirty()) {
      uiState.openModal = "confirm-close";
      renderModal();
      return;
    }

    closePanelImmediately();
  }

  function deleteSelectedEmployee() {
    if (uiState.passwordDraft !== "091100") {
      uiState.passwordError = "密碼錯誤。";
      renderModal();
      return;
    }

    state.employees = state.employees.filter(function (employee) {
      return employee.id !== uiState.selectedEmployeeId;
    });

    persistState();
    uiState.passwordDraft = "";
    uiState.passwordError = "";
    uiState.openModal = null;
    closePanelImmediately();
  }

  function toggleTitleEdit() {
    uiState.editingSubtitle = false;
    uiState.subtitleDraft = "";
    uiState.editingTitle = !uiState.editingTitle;
    uiState.titleDraft = uiState.editingTitle ? state.interfaceMeta.title : "";
    renderSidebar();
    focusPendingInputs();
  }

  function cancelTitleEdit() {
    uiState.editingTitle = false;
    uiState.titleDraft = "";
    renderSidebar();
  }

  function confirmTitleEdit() {
    const trimmed = uiState.titleDraft.trim();

    if (!trimmed) {
      openNotice("介面標題不可為空白。");
      return;
    }

    state.interfaceMeta.title = trimmed;
    persistState();
    uiState.editingTitle = false;
    uiState.titleDraft = "";
    renderSidebar();
  }

  function toggleSubtitleEdit() {
    uiState.editingTitle = false;
    uiState.titleDraft = "";
    uiState.editingSubtitle = !uiState.editingSubtitle;
    uiState.subtitleDraft = uiState.editingSubtitle ? (state.interfaceMeta.subtitle || dataApi.DEFAULT_INTERFACE_SUBTITLE) : "";
    renderSidebar();
    focusPendingInputs();
  }

  function cancelSubtitleEdit() {
    uiState.editingSubtitle = false;
    uiState.subtitleDraft = "";
    renderSidebar();
  }

  function confirmSubtitleEdit() {
    const trimmed = uiState.subtitleDraft.trim();

    if (!trimmed) {
      cancelSubtitleEdit();
      return;
    }

    state.interfaceMeta.subtitle = trimmed;
    persistState();
    uiState.editingSubtitle = false;
    uiState.subtitleDraft = "";
    renderSidebar();
  }

  function toggleMainNoteEdit() {
    uiState.editingMainNote = !uiState.editingMainNote;
    uiState.mainNoteDraft = uiState.editingMainNote ? getMainNote(state.selectedDepartmentId) : "";
    renderMainHeader();
    focusPendingInputs();
  }

  function cancelMainNoteEdit() {
    uiState.editingMainNote = false;
    uiState.mainNoteDraft = "";
    renderMainHeader();
  }

  function confirmMainNoteEdit() {
    const trimmed = uiState.mainNoteDraft.trim();
    state.interfaceMeta.mainNotes = Object.assign({}, state.interfaceMeta.mainNotes || {});

    if (!trimmed) {
      delete state.interfaceMeta.mainNotes[state.selectedDepartmentId];
    } else {
      state.interfaceMeta.mainNotes[state.selectedDepartmentId] = trimmed;
    }

    persistState();
    uiState.editingMainNote = false;
    uiState.mainNoteDraft = "";
    renderMainHeader();
  }

  function startAddDepartment() {
    uiState.editingTitle = false;
    uiState.titleDraft = "";
    uiState.editingSubtitle = false;
    uiState.subtitleDraft = "";
    uiState.editingMainNote = false;
    uiState.mainNoteDraft = "";
    uiState.editingDepartmentId = "";
    uiState.departmentEditDraft = "";
    uiState.openDepartmentMenuId = "";
    uiState.addingDepartment = true;
    uiState.departmentDraft = "";
    renderSidebar();
    focusPendingInputs();
  }

  function cancelAddDepartment() {
    uiState.addingDepartment = false;
    uiState.departmentDraft = "";
    renderSidebar();
  }

  function confirmAddDepartment(options) {
    const trimmed = uiState.departmentDraft.trim();
    const shouldSilentlyCancel = options && options.silentIfEmpty;

    if (!trimmed) {
      if (shouldSilentlyCancel) {
        cancelAddDepartment();
        return;
      }

      openNotice("請輸入部門名稱。");
      return;
    }

    const departmentId = "dept-" + Date.now();

    state.departments.push({
      id: departmentId,
      name: trimmed
    });
    state.tabsByDepartment[departmentId] = [];
    syncDepartmentOptionsWithState();
    persistState();
    uiState.addingDepartment = false;
    uiState.departmentDraft = "";
    renderAll();
  }

  function startEditDepartment(departmentId) {
    const department = state.departments.find(function (item) {
      return item.id === departmentId;
    });

    if (!department) {
      return;
    }

    uiState.editingDepartmentId = departmentId;
    uiState.departmentEditDraft = department.name;
    uiState.openDepartmentMenuId = "";
    renderSidebar();
    focusPendingInputs();
  }

  function cancelEditDepartment() {
    uiState.editingDepartmentId = "";
    uiState.departmentEditDraft = "";
    renderSidebar();
  }

  function confirmEditDepartment(options) {
    const department = state.departments.find(function (item) {
      return item.id === uiState.editingDepartmentId;
    });
    const trimmed = uiState.departmentEditDraft.trim();
    const shouldSilentlyCancel = options && options.silentIfEmpty;

    if (!department || !trimmed) {
      if (shouldSilentlyCancel) {
        cancelEditDepartment();
        return;
      }

      openNotice("請輸入有效的部門名稱。");
      return;
    }

    department.name = trimmed;
    syncDepartmentOptionsWithState();
    persistState();
    uiState.editingDepartmentId = "";
    uiState.departmentEditDraft = "";
    renderAll();
  }

  function deleteDepartment(departmentId) {
    const hasEmployees = state.employees.some(function (employee) {
      return employee.departmentId === departmentId;
    });

    if (hasEmployees) {
      openNotice("此部門仍有員工資料，請先處理員工後再刪除。");
      return;
    }

    state.departments = state.departments.filter(function (department) {
      return department.id !== departmentId;
    });
    delete state.tabsByDepartment[departmentId];
    delete state.activeTabByDepartment[departmentId];
    syncDepartmentOptionsWithState();

    if (state.selectedDepartmentId === departmentId) {
      state.selectedDepartmentId = state.departments[0] ? state.departments[0].id : dataApi.RETIRED_DEPARTMENT.id;
    }

    persistState();
    uiState.openDepartmentMenuId = "";
    renderAll();
  }

  function handleDepartmentDrop(targetDepartmentId) {
    const draggingId = uiState.draggingDepartmentId;

    if (!draggingId || draggingId === targetDepartmentId) {
      return;
    }

    const currentIndex = state.departments.findIndex(function (department) {
      return department.id === draggingId;
    });
    const targetIndex = state.departments.findIndex(function (department) {
      return department.id === targetDepartmentId;
    });

    if (currentIndex < 0 || targetIndex < 0) {
      return;
    }

    const moved = state.departments.splice(currentIndex, 1)[0];
    state.departments.splice(targetIndex, 0, moved);
    persistState();
    renderSidebar();
  }

  function startCreateTab() {
    uiState.creatingTab = true;
    uiState.editingTabId = "";
    uiState.tabDraft = normalizeTab({
      name: "",
      conditions: [createEmptyTabCondition("work.status", state)]
    }, state);
    uiState.openMoreTabs = false;
    renderToolbar();
    focusPendingInputs();
  }

  function cancelTabComposer() {
    uiState.creatingTab = false;
    uiState.editingTabId = "";
    uiState.tabDraft = { name: "", conditions: [] };
    renderToolbar();
  }

  function startEditTab() {
    const activeTab = getActiveTabConfig();

    if (!activeTab) {
      return;
    }

    uiState.creatingTab = true;
    uiState.editingTabId = activeTab.id;
    uiState.tabDraft = normalizeTab(activeTab, state);
    uiState.openMoreTabs = false;
    renderToolbar();
    focusPendingInputs();
  }

  function addTabCondition() {
    if (!uiState.creatingTab) {
      return;
    }

    uiState.tabDraft.conditions.push(createEmptyTabCondition("", state));
    renderToolbar();
  }

  function removeTabCondition(conditionIndex) {
    if (!uiState.creatingTab || uiState.tabDraft.conditions.length <= 1) {
      return;
    }

    uiState.tabDraft.conditions.splice(conditionIndex, 1);
    renderToolbar();
  }

  function deleteActiveTab() {
    const activeTabId = state.activeTabByDepartment[state.selectedDepartmentId];
    const departmentTabs = state.tabsByDepartment[state.selectedDepartmentId] || [];

    if (!activeTabId) {
      return;
    }

    state.tabsByDepartment[state.selectedDepartmentId] = departmentTabs.filter(function (tab) {
      return tab.id !== activeTabId;
    });
    state.activeTabByDepartment[state.selectedDepartmentId] = state.tabsByDepartment[state.selectedDepartmentId][0]
      ? state.tabsByDepartment[state.selectedDepartmentId][0].id
      : "";
    persistState();
    renderToolbar();
    renderCards();
  }

  function confirmCreateTab() {
    const normalizedDraft = normalizeTab(uiState.tabDraft, state);

    if (!normalizedDraft.conditions.length || normalizedDraft.conditions.some(function (condition) {
      return !String(condition.value || "").trim();
    })) {
      openNotice("請先設定分組條件。");
      return;
    }

    const nextTab = {
      id: uiState.editingTabId || "tab-" + Date.now(),
      name: normalizedDraft.name.trim() || formatTabSummary(normalizedDraft),
      conditions: normalizedDraft.conditions
    };
    const departmentTabs = state.tabsByDepartment[state.selectedDepartmentId] || [];

    if (uiState.editingTabId) {
      state.tabsByDepartment[state.selectedDepartmentId] = departmentTabs.map(function (tab) {
        return tab.id === uiState.editingTabId ? nextTab : tab;
      });
    } else {
      departmentTabs.push(nextTab);
      state.tabsByDepartment[state.selectedDepartmentId] = departmentTabs;
    }
    state.activeTabByDepartment[state.selectedDepartmentId] = nextTab.id;
    persistState();
    uiState.creatingTab = false;
    uiState.editingTabId = "";
    uiState.tabDraft = { name: "", conditions: [] };
    renderToolbar();
    renderCards();
  }

  function getDraftAttachments() {
    if (!uiState.draftEmployee) {
      return [];
    }

    uiState.draftEmployee.other.attachments = formApi.normalizeAttachmentList(uiState.draftEmployee.other.attachments, uiState.draftEmployee);
    return uiState.draftEmployee.other.attachments;
  }

  function getPendingAttachments() {
    return Array.isArray(uiState.pendingAttachments) ? uiState.pendingAttachments : [];
  }

  function openAttachmentFileDialog(targetIndex) {
    if (!uiState.draftEmployee) {
      return;
    }

    dom.fileInput.dataset.targetIndex = typeof targetIndex === "number" ? String(targetIndex) : "";
    dom.fileInput.value = "";
    dom.fileInput.click();
  }

  function confirmPendingAttachment(pendingIndex) {
    const pendingAttachments = getPendingAttachments();
    const resolvedIndex = typeof pendingIndex === "number" ? pendingIndex : 0;
    const pendingAttachment = pendingAttachments[resolvedIndex];

    if (!pendingAttachment || !uiState.draftEmployee) {
      return;
    }

    const attachments = getDraftAttachments();

    if (typeof pendingAttachment.targetIndex === "number") {
      attachments.splice(pendingAttachment.targetIndex, 1, {
        id: attachments[pendingAttachment.targetIndex] ? attachments[pendingAttachment.targetIndex].id : "attachment-" + Date.now(),
        name: pendingAttachment.name,
        data: pendingAttachment.data
      });
    } else {
      attachments.push({
        id: "attachment-" + Date.now(),
        name: pendingAttachment.name,
        data: pendingAttachment.data
      });
    }

    pendingAttachments.splice(resolvedIndex, 1);
    renderDetailPanel(true);
  }

  function cancelPendingAttachment(pendingIndex) {
    const pendingAttachments = getPendingAttachments();
    const resolvedIndex = typeof pendingIndex === "number" ? pendingIndex : 0;

    if (resolvedIndex < 0 || resolvedIndex >= pendingAttachments.length) {
      return;
    }

    pendingAttachments.splice(resolvedIndex, 1);
    renderDetailPanel(true);
  }

  function moveAttachment(currentIndex, direction) {
    const attachments = getDraftAttachments();
    const nextIndex = currentIndex + direction;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= attachments.length) {
      return;
    }

    const movedAttachment = attachments.splice(currentIndex, 1)[0];
    attachments.splice(nextIndex, 0, movedAttachment);
    renderDetailPanel(true);
  }

  function openAttachmentPreview(index) {
    const attachment = getDraftAttachments()[index];

    if (!attachment || !attachment.data) {
      return;
    }

    window.open(attachment.data, "_blank", "noopener,noreferrer");
  }

  function deleteSelectedAttachment() {
    if (uiState.passwordDraft !== "09110") {
      uiState.passwordError = "密碼錯誤。";
      renderModal();
      return;
    }

    const attachments = getDraftAttachments();

    if (uiState.attachmentDeleteIndex >= 0) {
      attachments.splice(uiState.attachmentDeleteIndex, 1);
    }

    uiState.passwordDraft = "";
    uiState.passwordError = "";
    uiState.attachmentDeleteIndex = -1;
    uiState.openModal = null;
    renderModal();
    renderDetailPanel(true);
  }

  function updateDraftEmployee(path, value) {
    uiState.draftEmployee = formApi.cloneDraft(uiState.draftEmployee);
    formApi.setValueAtPath(uiState.draftEmployee, path, value);

    if ((path === "contact.emergencyRelationship.preset" || path === "work.department.preset" || path === "work.titleJob.preset") && value !== "其他") {
      formApi.setValueAtPath(uiState.draftEmployee, path.replace(".preset", ".other"), "");
    }

    if ((path === "contact.phoneNumber.countryCode" || path === "contact.emergencyPhone.countryCode") && !value) {
      formApi.setValueAtPath(uiState.draftEmployee, path, dataApi.PHONE_COUNTRY_OPTIONS[0]);
    }

    if (path === "work.status" && value !== "離職") {
      uiState.draftEmployee.work.lastDay = dataApi.createEmptyDateParts();
    }

    uiState.draftEmployee = formApi.applyDerivedFields(uiState.draftEmployee, path);
    renderDetailPanel(true);
  }

  function updateSetting(settingKey, value) {
    if (settingKey === "filter-position") {
      state.filters.position = value;
      renderCards();
      return;
    }

    if (settingKey === "filter-status") {
      state.filters.status = value;
      renderCards();
      return;
    }

    if (settingKey === "sort-mode") {
      state.sortMode = value;
      persistState();
      renderCards();
      return;
    }

    if (settingKey === "card-title") {
      state.cardDisplay.titleField = value;
      persistState();
      renderCards();
      return;
    }

    if (settingKey.indexOf("card-extra-") === 0) {
      const index = Number(settingKey.replace("card-extra-", ""));

      state.cardDisplay.extraFieldIds[index] = value;
      persistState();
      renderCards();
    }
  }

  function clearFilters() {
    state.filters.position = "全部";
    state.filters.status = "全部";
    state.searchQuery = "";
    persistState();
    renderAll();
  }

  function handleAction(action, button) {
    const departmentId = button.getAttribute("data-department-id") || button.closest("[data-department-id]") && button.closest("[data-department-id]").getAttribute("data-department-id");

    if (action === "choose-interface-icon") {
      dom.interfaceIconInput.click();
      return;
    }

    if (action === "reset-interface-icon") {
      state.interfaceMeta.iconSrc = dataApi.DEFAULT_IMAGE_SRC;
      state.interfaceMeta.customIcon = false;
      persistState();
      renderSidebar();
      return;
    }

    if (action === "toggle-title-edit") {
      if (uiState.editingTitle) {
        confirmTitleEdit();
      } else {
        toggleTitleEdit();
      }
      return;
    }

    if (action === "toggle-subtitle-edit") {
      if (uiState.editingSubtitle) {
        confirmSubtitleEdit();
      } else {
        toggleSubtitleEdit();
      }
      return;
    }

    if (action === "toggle-main-note-edit") {
      if (uiState.editingMainNote) {
        confirmMainNoteEdit();
      } else {
        toggleMainNoteEdit();
      }
      return;
    }

    if (action === "select-department") {
      state.selectedDepartmentId = button.getAttribute("data-department-id") || departmentId;
      uiState.openDepartmentMenuId = "";
      uiState.editingMainNote = false;
      uiState.mainNoteDraft = "";
      uiState.creatingTab = false;
      uiState.editingTabId = "";
      uiState.openMoreTabs = false;
      uiState.showDisplayMenu = false;
      uiState.showFilterMenu = false;
      persistState();
      closePanelImmediately();
      return;
    }

    if (action === "toggle-department-menu") {
      const targetId = button.getAttribute("data-department-id");

      uiState.openDepartmentMenuId = uiState.openDepartmentMenuId === targetId ? "" : targetId;
      renderSidebar();
      return;
    }

    if (action === "start-add-department") {
      startAddDepartment();
      return;
    }

    if (action === "start-edit-department") {
      startEditDepartment(button.getAttribute("data-department-id"));
      return;
    }

    if (action === "delete-department") {
      deleteDepartment(button.getAttribute("data-department-id"));
      return;
    }

    if (action === "open-add-panel") {
      startAddEmployee();
      return;
    }

    if (action === "select-employee") {
      selectEmployee(button.getAttribute("data-employee-id"));
      return;
    }

    if (action === "start-edit-employee") {
      startEditEmployee();
      return;
    }

    if (action === "save-employee") {
      saveEmployee();
      return;
    }

    if (action === "request-delete-employee") {
      uiState.openModal = "confirm-delete";
      renderModal();
      return;
    }

    if (action === "open-password-modal") {
      uiState.openModal = "password-delete";
      uiState.passwordDraft = "";
      uiState.passwordError = "";
      renderModal();
      return;
    }

    if (action === "confirm-delete-employee") {
      deleteSelectedEmployee();
      return;
    }

    if (action === "close-modal") {
      uiState.openModal = null;
      uiState.passwordDraft = "";
      uiState.passwordError = "";
      uiState.attachmentDeleteIndex = -1;
      renderModal();
      return;
    }

    if (action === "request-close-panel") {
      requestClosePanel();
      return;
    }

    if (action === "confirm-close-panel") {
      closePanelImmediately();
      return;
    }

    if (action === "start-create-tab") {
      startCreateTab();
      return;
    }

    if (action === "start-edit-tab") {
      startEditTab();
      return;
    }

    if (action === "delete-active-tab") {
      deleteActiveTab();
      return;
    }

    if (action === "add-tab-condition") {
      addTabCondition();
      return;
    }

    if (action === "remove-tab-condition") {
      removeTabCondition(Number(button.getAttribute("data-tab-condition-index")));
      return;
    }

    if (action === "cancel-tab-composer") {
      cancelTabComposer();
      return;
    }

    if (action === "confirm-create-tab") {
      confirmCreateTab();
      return;
    }

    if (action === "toggle-more-tabs") {
      uiState.openMoreTabs = !uiState.openMoreTabs;
      renderToolbar();
      return;
    }

    if (action === "select-tab") {
      state.activeTabByDepartment[state.selectedDepartmentId] = button.getAttribute("data-tab-id");
      persistState();
      uiState.openMoreTabs = false;
      renderToolbar();
      renderCards();
      return;
    }

    if (action === "toggle-search") {
      uiState.showSearchInput = !uiState.showSearchInput;
      renderToolbar();

      if (uiState.showSearchInput) {
        window.requestAnimationFrame(function () {
          const searchInput = dom.toolbarMount.querySelector(".employees-search-box");

          if (searchInput) {
            searchInput.focus();
          }
        });
      }

      return;
    }

    if (action === "toggle-filter-menu") {
      uiState.showFilterMenu = !uiState.showFilterMenu;
      uiState.showDisplayMenu = false;
      renderToolbar();
      return;
    }

    if (action === "toggle-display-menu") {
      uiState.showDisplayMenu = !uiState.showDisplayMenu;
      uiState.showFilterMenu = false;
      renderToolbar();
      return;
    }

    if (action === "clear-filters") {
      clearFilters();
      return;
    }

    if (action === "choose-avatar") {
      dom.avatarInput.click();
      return;
    }

    if (action === "reset-avatar") {
      uiState.draftEmployee.avatarSrc = dataApi.DEFAULT_IMAGE_SRC;
      uiState.draftEmployee.avatarChanged = false;
      uiState.avatarDirty = false;
      uiState.previewImageSrc = dataApi.DEFAULT_IMAGE_SRC;
      renderDetailPanel(true);
      renderModal();
      return;
    }

    if (action === "save-avatar-local") {
      uiState.avatarDirty = false;
      renderDetailPanel(true);
      return;
    }

    if (action === "preview-avatar") {
      uiState.previewImageSrc = (uiState.draftEmployee && uiState.draftEmployee.avatarSrc) || dataApi.DEFAULT_IMAGE_SRC;
      uiState.openModal = "preview-avatar";
      renderModal();
      return;
    }

    if (action === "choose-employee-file") {
      openAttachmentFileDialog();
      return;
    }

    if (action === "replace-attachment") {
      openAttachmentFileDialog(Number(button.getAttribute("data-attachment-index")));
      return;
    }

    if (action === "confirm-pending-attachment") {
      confirmPendingAttachment(Number(button.getAttribute("data-pending-index")));
      return;
    }

    if (action === "cancel-pending-attachment") {
      cancelPendingAttachment(Number(button.getAttribute("data-pending-index")));
      return;
    }

    if (action === "move-attachment-up") {
      moveAttachment(Number(button.getAttribute("data-attachment-index")), -1);
      return;
    }

    if (action === "move-attachment-down") {
      moveAttachment(Number(button.getAttribute("data-attachment-index")), 1);
      return;
    }

    if (action === "preview-attachment") {
      openAttachmentPreview(Number(button.getAttribute("data-attachment-index")));
      return;
    }

    if (action === "request-delete-attachment") {
      uiState.attachmentDeleteIndex = Number(button.getAttribute("data-attachment-index"));
      uiState.passwordDraft = "";
      uiState.passwordError = "";
      uiState.openModal = "password-delete-attachment";
      renderModal();
      return;
    }

    if (action === "confirm-delete-attachment") {
      deleteSelectedAttachment();
    }
  }

  function handleRootClick(event) {
    const actionButton = event.target.closest("[data-action]");

    if (!actionButton) {
      const clickedInsideModal = event.target.closest('[data-modal-body="true"]');
      const clickedInsideEditableInput = event.target.closest("#employeesDepartmentInput")
        || event.target.closest("#employeesTitleInput")
        || event.target.closest("#employeesSubtitleInput")
        || event.target.closest("#employeesMainNoteInput")
        || event.target.closest('[data-role="department-edit-input"]');
      let sidebarChanged = false;
      let toolbarChanged = false;

      if (clickedInsideModal || clickedInsideEditableInput) {
        return;
      }

      if (uiState.openDepartmentMenuId && !event.target.closest(".employees-department__menu")) {
        uiState.openDepartmentMenuId = "";
        sidebarChanged = true;
      }

      if (uiState.showFilterMenu && !event.target.closest('[data-tool-group="filter"]')) {
        uiState.showFilterMenu = false;
        toolbarChanged = true;
      }

      if (uiState.showDisplayMenu && !event.target.closest('[data-tool-group="display"]')) {
        uiState.showDisplayMenu = false;
        toolbarChanged = true;
      }

      if (uiState.openMoreTabs && !event.target.closest('[data-tool-group="more-tabs"]')) {
        uiState.openMoreTabs = false;
        toolbarChanged = true;
      }

      if (sidebarChanged) {
        renderSidebar();
      }

      if (toolbarChanged) {
        renderToolbar();
      }

      return;
    }

    handleAction(actionButton.getAttribute("data-action"), actionButton);
  }

  function handleRootInput(event) {
    const target = event.target;

    if (target.id === "employeesTitleInput") {
      uiState.titleDraft = target.value;
      return;
    }

    if (target.id === "employeesSubtitleInput") {
      uiState.subtitleDraft = target.value;
      return;
    }

    if (target.id === "employeesMainNoteInput") {
      uiState.mainNoteDraft = target.value;
      return;
    }

    if (target.id === "employeesDepartmentInput") {
      uiState.departmentDraft = target.value;
      return;
    }

    if (target.getAttribute("data-role") === "department-edit-input") {
      uiState.departmentEditDraft = target.value;
      return;
    }

    if (target.id === "employeesTabNameInput") {
      uiState.tabDraft.name = target.value;
      return;
    }

    if (target.hasAttribute("data-tab-condition-index")) {
      const conditionIndex = Number(target.getAttribute("data-tab-condition-index"));
      const conditionKey = target.getAttribute("data-tab-condition-key");
      const draftCondition = uiState.tabDraft.conditions[conditionIndex];

      if (!draftCondition) {
        return;
      }

      if (conditionKey === "fieldId") {
        const field = getTabFieldConfig(target.value);
        const operators = getTabOperators(field.id);

        draftCondition.fieldId = field.id;
        draftCondition.operator = operators[0] ? operators[0].id : "is";
        draftCondition.value = field.type === "select" ? (getFieldOptionList(field.id)[0] || "") : "";

        renderToolbar();
        window.requestAnimationFrame(function () {
          const nextTarget = dom.toolbarMount.querySelector('[data-tab-condition-index="' + String(conditionIndex) + '"][data-tab-condition-key="fieldId"]');
          if (nextTarget) {
            nextTarget.focus();
          }
        });
        return;
      } else {
        draftCondition[conditionKey] = target.value;
      }
      return;
    }

    if (target.id === "employeesPasswordInput") {
      uiState.passwordDraft = target.value;
      return;
    }

    if (target.getAttribute("data-path") === "searchQuery") {
      state.searchQuery = target.value;
      renderCards();
      return;
    }

    if (target.getAttribute("data-setting")) {
      updateSetting(target.getAttribute("data-setting"), target.value);
      return;
    }

    if (target.getAttribute("data-path") && uiState.draftEmployee) {
      updateDraftEmployee(target.getAttribute("data-path"), target.value);
      return;
    }
  }

  function handleRootFocusOut(event) {
    const target = event.target;

    if (target.id === "employeesDepartmentInput") {
      window.setTimeout(function () {
        if (!uiState.addingDepartment || document.activeElement === target) {
          return;
        }

        confirmAddDepartment({ silentIfEmpty: true });
      }, 0);
      return;
    }

    if (target.getAttribute("data-role") === "department-edit-input") {
      window.setTimeout(function () {
        if (!uiState.editingDepartmentId || document.activeElement === target) {
          return;
        }

        confirmEditDepartment({ silentIfEmpty: true });
      }, 0);
      return;
    }

    if (target.id === "employeesTitleInput") {
      window.setTimeout(function () {
        if (!uiState.editingTitle || document.activeElement === target) {
          return;
        }

        if (uiState.titleDraft.trim()) {
          confirmTitleEdit();
          return;
        }

        cancelTitleEdit();
      }, 0);
      return;
    }

    if (target.id === "employeesSubtitleInput") {
      window.setTimeout(function () {
        if (!uiState.editingSubtitle || document.activeElement === target) {
          return;
        }

        if (uiState.subtitleDraft.trim()) {
          confirmSubtitleEdit();
          return;
        }

        cancelSubtitleEdit();
      }, 0);
      return;
    }

    if (target.id === "employeesMainNoteInput") {
      window.setTimeout(function () {
        if (!uiState.editingMainNote || document.activeElement === target) {
          return;
        }

        if (uiState.mainNoteDraft.trim()) {
          confirmMainNoteEdit();
          return;
        }

        cancelMainNoteEdit();
      }, 0);
    }
  }

  function handleRootKeydown(event) {
    if (event.key === "Escape") {
      if (event.target.id === "employeesDepartmentInput") {
        event.preventDefault();
        cancelAddDepartment();
        return;
      }

      if (event.target.getAttribute("data-role") === "department-edit-input") {
        event.preventDefault();
        cancelEditDepartment();
        return;
      }

      if (event.target.id === "employeesTitleInput") {
        event.preventDefault();
        cancelTitleEdit();
        return;
      }

      if (event.target.id === "employeesSubtitleInput") {
        event.preventDefault();
        cancelSubtitleEdit();
        return;
      }

      if (event.target.id === "employeesMainNoteInput") {
        event.preventDefault();
        cancelMainNoteEdit();
        return;
      }

      if (event.target.id === "employeesTabNameInput" || event.target.hasAttribute("data-tab-condition-index")) {
        event.preventDefault();
        cancelTabComposer();
        return;
      }
    }

    if (event.key !== "Enter") {
      return;
    }

    if (event.target.id === "employeesTitleInput") {
      event.preventDefault();
      confirmTitleEdit();
      return;
    }

    if (event.target.id === "employeesSubtitleInput") {
      event.preventDefault();
      confirmSubtitleEdit();
      return;
    }

    if (event.target.id === "employeesMainNoteInput") {
      event.preventDefault();
      confirmMainNoteEdit();
      return;
    }

    if (event.target.id === "employeesDepartmentInput") {
      event.preventDefault();
      confirmAddDepartment();
      return;
    }

    if (event.target.getAttribute("data-role") === "department-edit-input") {
      event.preventDefault();
      confirmEditDepartment();
      return;
    }

    if (event.target.id === "employeesTabNameInput" || event.target.hasAttribute("data-tab-condition-index")) {
      event.preventDefault();
      confirmCreateTab();
      return;
    }

    if (event.target.id === "employeesPasswordInput") {
      event.preventDefault();
      if (uiState.openModal === "password-delete-attachment") {
        deleteSelectedAttachment();
        return;
      }

      deleteSelectedEmployee();
      return;
    }

    if (uiState.pendingAttachments.length) {
      event.preventDefault();
      confirmPendingAttachment(0);
    }
  }

  function handleDragStart(event) {
    const row = event.target.closest("[data-department-id]");

    if (!row || row.getAttribute("data-department-id") === dataApi.RETIRED_DEPARTMENT.id) {
      return;
    }

    uiState.draggingDepartmentId = row.getAttribute("data-department-id");
    row.classList.add("employees-department--dragging");
  }

  function handleDragEnd(event) {
    const row = event.target.closest(".employees-department");

    if (row) {
      row.classList.remove("employees-department--dragging");
    }

    uiState.draggingDepartmentId = "";
  }

  function handleDragOver(event) {
    if (!uiState.draggingDepartmentId) {
      return;
    }

    const row = event.target.closest("[data-department-id]");

    if (!row || row.getAttribute("data-department-id") === dataApi.RETIRED_DEPARTMENT.id) {
      return;
    }

    event.preventDefault();
  }

  function handleDrop(event) {
    const row = event.target.closest("[data-department-id]");

    if (!row || row.getAttribute("data-department-id") === dataApi.RETIRED_DEPARTMENT.id) {
      return;
    }

    event.preventDefault();
    handleDepartmentDrop(row.getAttribute("data-department-id"));
  }

  function readFileAsDataUrl(file, callback) {
    const reader = new FileReader();

    reader.onload = function () {
      callback(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function attachStaticListeners() {
    root.addEventListener("click", handleRootClick);
    root.addEventListener("input", handleRootInput);
    root.addEventListener("change", handleRootInput);
    root.addEventListener("keydown", handleRootKeydown);
    root.addEventListener("focusout", handleRootFocusOut);
    root.addEventListener("dragstart", handleDragStart);
    root.addEventListener("dragend", handleDragEnd);
    root.addEventListener("dragover", handleDragOver);
    root.addEventListener("drop", handleDrop);

    dom.interfaceIconInput.addEventListener("change", function () {
      const file = dom.interfaceIconInput.files[0];

      if (!file) {
        return;
      }

      readFileAsDataUrl(file, function (result) {
        state.interfaceMeta.iconSrc = result;
        state.interfaceMeta.customIcon = true;
        persistState();
        renderSidebar();
      });
    });

    dom.avatarInput.addEventListener("change", function () {
      const file = dom.avatarInput.files[0];

      if (!file || !uiState.draftEmployee) {
        return;
      }

      readFileAsDataUrl(file, function (result) {
        uiState.draftEmployee.avatarSrc = result;
        uiState.draftEmployee.avatarChanged = true;
        uiState.avatarDirty = true;
        uiState.previewImageSrc = result;
        renderDetailPanel(true);
        renderModal();
      });
    });

    dom.fileInput.addEventListener("change", function () {
      const selectedFiles = Array.prototype.slice.call(dom.fileInput.files || []);
      const targetIndex = dom.fileInput.dataset.targetIndex === "" ? null : Number(dom.fileInput.dataset.targetIndex);

      if (!selectedFiles.length || !uiState.draftEmployee) {
        return;
      }

      const filesToRead = targetIndex === null ? selectedFiles : selectedFiles.slice(0, 1);
      const pendingItems = new Array(filesToRead.length);
      let remaining = filesToRead.length;

      filesToRead.forEach(function (file, index) {
        readFileAsDataUrl(file, function (result) {
          pendingItems[index] = {
            name: file.name,
            data: result,
            targetIndex: targetIndex
          };
          remaining -= 1;

          if (remaining > 0) {
            return;
          }

          if (targetIndex !== null) {
            uiState.pendingAttachments = getPendingAttachments().filter(function (attachment) {
              return attachment.targetIndex !== targetIndex;
            });
          }

          uiState.pendingAttachments = getPendingAttachments().concat(pendingItems);
          dom.fileInput.dataset.targetIndex = "";
          renderDetailPanel(true);
        });
      });
    });
  }

  buildShell();
  syncDepartmentOptionsWithState();
  attachStaticListeners();
  renderAll();
})();
