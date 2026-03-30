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
    addingDepartment: false,
    departmentDraft: "",
    editingDepartmentId: "",
    departmentEditDraft: "",
    openDepartmentMenuId: "",
    draggingDepartmentId: "",
    creatingTab: false,
    tabDraft: { name: "", condition: "" },
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
    previewImageSrc: ""
  };

  let state = loadState();
  const dom = {};

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
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
    nextState.departments = Array.isArray(rawState.departments) && rawState.departments.length ? rawState.departments : dataApi.cloneValue(initialState.departments);
    nextState.tabsByDepartment = Object.assign({}, initialState.tabsByDepartment, rawState.tabsByDepartment || {});
    nextState.activeTabByDepartment = Object.assign({}, initialState.activeTabByDepartment, rawState.activeTabByDepartment || {});
    nextState.cardDisplay = Object.assign({}, initialState.cardDisplay, rawState.cardDisplay || {});
    nextState.filters = Object.assign({}, initialState.filters, rawState.filters || {});
    nextState.employees = (rawState.employees || initialState.employees).map(function (employee) {
      return formApi.applyDerivedFields(employee);
    });

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
      return formApi.hasMeaningfulEmployeeData(currentDraft) || uiState.avatarDirty;
    }

    return JSON.stringify(currentDraft) !== JSON.stringify(getCurrentReferenceEmployee()) || uiState.avatarDirty;
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
      '<input id="employeesFileInput" class="employees-hidden" type="file">',
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

  function getVisibleEmployees() {
    const searchQuery = state.searchQuery.trim().toLowerCase();
    const selectedDepartmentId = state.selectedDepartmentId;
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

      if (!searchQuery) {
        return true;
      }

      return [
        employee.basic.vieName,
        employee.basic.engName,
        employee.basic.ydiId,
        employee.contact.phoneNumber.value,
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

    dom.sidebarMount.innerHTML = [
      '<div class="employees-sidebar__header">',
      '<div class="employees-sidebar__icon-wrap">',
      '<button type="button" class="employees-sidebar__icon-button" data-action="choose-interface-icon" data-tooltip="點擊更換介面圖片">',
      '<img class="employees-sidebar__icon-preview" src="' + escapeHtml(state.interfaceMeta.iconSrc) + '" alt="介面圖示">',
      "</button>",
      '<div class="employees-sidebar__icon-tools">',
      '<button type="button" class="employees-icon-button" data-action="choose-interface-icon" aria-label="更換介面圖片">' + getIconSvg("edit") + "</button>",
      '<button type="button" class="employees-icon-button employees-icon-button--danger" data-action="reset-interface-icon" ' + (state.interfaceMeta.customIcon ? "" : "disabled") + ' aria-label="還原介面圖片">' + getIconSvg("trash") + "</button>",
      "</div>",
      "</div>",
      '<div class="employees-sidebar__text">',
      '<div class="employees-sidebar__title-row">',
      uiState.editingTitle
        ? '<input id="employeesTitleInput" class="employees-sidebar__title-input" type="text" value="' + escapeHtml(uiState.titleDraft) + '">'
        : '<h1 class="employees-sidebar__title">' + escapeHtml(state.interfaceMeta.title) + "</h1>",
      '<button type="button" class="employees-icon-button" data-action="toggle-title-edit" aria-label="編輯標題">' + getIconSvg("edit") + "</button>",
      "</div>",
      '<div class="employees-sidebar__caption">點擊部門切換名單，拖曳可以重排順序。</div>',
      "</div>",
      "</div>",
      '<div class="employees-sidebar__body">',
      '<h2 class="employees-sidebar__section-title">Departments</h2>',
      '<div class="employees-sidebar__list" id="employeesDepartmentList">',
      state.departments.map(function (department) {
        const isEditing = uiState.editingDepartmentId === department.id;
        const isActive = selectedDepartmentId === department.id;
        const isMenuOpen = uiState.openDepartmentMenuId === department.id;

        return [
          '<div class="employees-department' + (isActive ? " employees-department--active" : "") + '" draggable="true" data-department-id="' + escapeHtml(department.id) + '" data-action="select-department">',
          '<div class="employees-department__grip" aria-hidden="true">' + escapeHtml(getIconSvg("grip")) + "</div>",
          isEditing
            ? '<input class="employees-sidebar__title-input" data-role="department-edit-input" type="text" value="' + escapeHtml(uiState.departmentEditDraft) + '">'
            : '<div class="employees-department__name">' + escapeHtml(department.name) + "</div>",
          '<div class="employees-department__menu">',
          '<button type="button" class="employees-icon-button" data-action="toggle-department-menu" data-department-id="' + escapeHtml(department.id) + '" aria-label="部門選單">' + getIconSvg("more") + "</button>",
          isMenuOpen
            ? '<div class="employees-department__menu-panel"><button type="button" data-action="start-edit-department" data-department-id="' + escapeHtml(department.id) + '">Edit</button><button type="button" data-action="delete-department" data-department-id="' + escapeHtml(department.id) + '">Delete</button></div>'
            : "",
          "</div>",
          "</div>"
        ].join("");
      }).join(""),
      '<div class="employees-department-add">',
      uiState.addingDepartment
        ? '<input id="employeesDepartmentInput" class="employees-department-add__input" type="text" value="' + escapeHtml(uiState.departmentDraft) + '" placeholder="請輸入部門名稱">'
        : '<button type="button" class="employees-department-add__button" data-action="start-add-department"><span>' + getIconSvg("plus") + '</span><strong>Add department</strong></button>',
      "</div>",
      '<div class="employees-department-fixed">',
      '<button type="button" class="employees-department' + (selectedDepartmentId === dataApi.RETIRED_DEPARTMENT.id ? " employees-department--active" : "") + '" data-action="select-department" data-department-id="' + escapeHtml(dataApi.RETIRED_DEPARTMENT.id) + '"><div class="employees-department__name" style="text-align:center;">' + escapeHtml(dataApi.RETIRED_DEPARTMENT.name) + "</div></button>",
      "</div>",
      "</div>",
      "</div>"
    ].join("");
  }

  function renderMainHeader() {
    const selectedDepartment = getSelectedDepartment();
    const isRetired = isRetiredView();
    const selectedEmployee = getEmployeeById(uiState.selectedEmployeeId);
    const normalActions = [
      selectedEmployee && uiState.detailMode !== "add"
        ? '<button type="button" class="employees-secondary-button employees-primary-button--danger" data-action="request-delete-employee">Delete</button>'
        : "",
      '<button type="button" class="employees-primary-button" data-action="open-add-panel">' + getIconSvg("plus") + '<span>Add</span></button>'
    ].join("");

    const retiredActions = selectedEmployee
      ? [
          '<button type="button" class="employees-secondary-button employees-primary-button--danger" data-action="request-delete-employee">Delete</button>',
          '<button type="button" class="employees-secondary-button" data-action="start-edit-employee"' + (uiState.detailMode === "edit" ? " disabled" : "") + ">Edit</button>",
          '<button type="button" class="employees-primary-button" data-action="save-employee"' + (uiState.detailMode !== "edit" ? " disabled" : "") + ">Save</button>"
        ].join("")
      : "";

    dom.mainHeaderMount.innerHTML = [
      '<div class="employees-main__title-row">',
      '<div class="employees-main__title-wrap">',
      '<h1>' + escapeHtml(selectedDepartment.name) + "</h1>",
      '<div class="employees-main__title-note">' + (isRetired ? "離職名單預設依離職日期排序。" : "點擊員工卡片可展開右側詳細資料。") + "</div>",
      "</div>",
      '<div class="employees-main__actions">' + (isRetired ? retiredActions : normalActions) + "</div>",
      "</div>"
    ].join("");
  }

  function renderFilterPopover() {
    return [
      '<div class="employees-popover">',
      '<div class="employees-popover__section-title">Filter</div>',
      '<div class="employees-popover__field"><label>Position</label><select data-setting="filter-position"><option value="全部">全部</option>' + dataApi.POSITION_OPTIONS.map(function (option) {
        return '<option value="' + escapeHtml(option) + '"' + (state.filters.position === option ? " selected" : "") + ">" + escapeHtml(option) + "</option>";
      }).join("") + "</select></div>",
      '<div class="employees-popover__field"><label>Status</label><select data-setting="filter-status">' +
      ['全部'].concat(dataApi.STATUS_OPTIONS).map(function (option) {
        return '<option value="' + escapeHtml(option) + '"' + (state.filters.status === option ? " selected" : "") + ">" + escapeHtml(option) + "</option>";
      }).join("") +
      "</select></div>",
      '<button type="button" class="employees-inline-action" data-action="clear-filters">Clear filters</button>',
      "</div>"
    ].join("");
  }

  function renderDisplayPopover() {
    const selectedSort = isRetiredView() ? "retiredSoonest" : state.sortMode;

    return [
      '<div class="employees-popover">',
      '<div class="employees-popover__section-title">Card display</div>',
      '<div class="employees-popover__field"><label>Title</label><select data-setting="card-title">' + dataApi.CARD_FIELD_OPTIONS.map(function (field) {
        return '<option value="' + escapeHtml(field.id) + '"' + (state.cardDisplay.titleField === field.id ? " selected" : "") + ">" + escapeHtml(field.label) + "</option>";
      }).join("") + "</select></div>",
      state.cardDisplay.extraFieldIds.map(function (fieldId, index) {
        return '<div class="employees-popover__field"><label>Field ' + String(index + 1) + '</label><select data-setting="card-extra-' + String(index) + '">' + dataApi.CARD_FIELD_OPTIONS.map(function (field) {
          return '<option value="' + escapeHtml(field.id) + '"' + (fieldId === field.id ? " selected" : "") + ">" + escapeHtml(field.label) + "</option>";
        }).join("") + "</select></div>";
      }).join(""),
      '<div class="employees-popover__section-title">Sort</div>',
      '<div class="employees-popover__field"><label>Sort mode</label><select data-setting="sort-mode">' + dataApi.SORT_OPTIONS.filter(function (option) {
        return !isRetiredView() || option.id === "retiredSoonest";
      }).map(function (option) {
        return '<option value="' + escapeHtml(option.id) + '"' + (selectedSort === option.id ? " selected" : "") + ">" + escapeHtml(option.label) + "</option>";
      }).join("") + "</select></div>",
      "</div>"
    ].join("");
  }

  function renderToolbar() {
    const visibleTabsData = getVisibleTabs();
    const activeTabId = state.activeTabByDepartment[state.selectedDepartmentId] || "";
    const tabs = state.tabsByDepartment[state.selectedDepartmentId] || [];

    if (isRetiredView()) {
      dom.toolbarMount.innerHTML = [
        '<div class="employees-toolbar">',
        '<div class="employees-toolbar__left"></div>',
        '<div class="employees-toolbar__right">',
        uiState.showSearchInput ? '<input class="employees-search-box" data-path="searchQuery" value="' + escapeHtml(state.searchQuery) + '" placeholder="Search employee">' : "",
        '<button type="button" class="employees-tool-icon" data-action="toggle-search" data-tooltip="Search">' + getIconSvg("search") + "</button>",
        '<div style="position:relative;">',
        '<button type="button" class="employees-tool-icon" data-action="toggle-filter-menu" data-tooltip="Filter">' + getIconSvg("filter") + "</button>",
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
        return '<button type="button" class="employees-tab' + (activeTabId === tab.id ? " employees-tab--active" : "") + '" data-action="select-tab" data-tab-id="' + escapeHtml(tab.id) + '" title="' + escapeHtml(tab.condition || "") + '">' + escapeHtml(tab.name) + (tab.condition ? '<span class="employees-tab__condition">' + escapeHtml(tab.condition) + "</span>" : "") + "</button>";
      }).join(""),
      visibleTabsData.hiddenTabs.length
        ? '<div style="position:relative;"><button type="button" class="employees-tab" data-action="toggle-more-tabs">More</button>' +
          (uiState.openMoreTabs ? '<div class="employees-popover">' + visibleTabsData.hiddenTabs.map(function (tab) {
            return '<button type="button" class="employees-inline-action" data-action="select-tab" data-tab-id="' + escapeHtml(tab.id) + '">' + escapeHtml(tab.name) + "</button>";
          }).join("") + "</div>" : "") +
          "</div>"
        : "",
      '<button type="button" class="employees-tab" data-action="start-create-tab">' + getIconSvg("plus") + "</button>",
      "</div>",
      uiState.creatingTab
        ? '<div class="employees-toolbar__composer"><input type="text" id="employeesTabNameInput" value="' + escapeHtml(uiState.tabDraft.name) + '" placeholder="Tab 名稱"><input type="text" id="employeesTabConditionInput" value="' + escapeHtml(uiState.tabDraft.condition) + '" placeholder="條件（選填）"></div>'
        : "",
      "</div>",
      '<div class="employees-toolbar__right">',
      uiState.showSearchInput ? '<input class="employees-search-box" data-path="searchQuery" value="' + escapeHtml(state.searchQuery) + '" placeholder="Search employee">' : "",
      '<button type="button" class="employees-tool-icon" data-action="toggle-search" data-tooltip="Search">' + getIconSvg("search") + "</button>",
      '<div style="position:relative;">',
      '<button type="button" class="employees-tool-icon" data-action="toggle-filter-menu" data-tooltip="Filter">' + getIconSvg("filter") + "</button>",
      uiState.showFilterMenu ? renderFilterPopover() : "",
      "</div>",
      '<div style="position:relative;">',
      '<button type="button" class="employees-tool-icon" data-action="toggle-display-menu" data-tooltip="More">' + getIconSvg("more") + "</button>",
      uiState.showDisplayMenu ? renderDisplayPopover() : "",
      "</div>",
      "</div>",
      "</div>"
    ].join("");
  }

  function renderCards() {
    const employees = getVisibleEmployees();

    if (!employees.length) {
      dom.cardsMount.innerHTML = '<div class="employees-empty">目前沒有符合條件的員工卡片。</div>';
      return;
    }

    dom.cardsMount.innerHTML = '<div class="employees-cards">' + employees.map(function (employee) {
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
    }).join("") + "</div>";
  }

  function autoResizeRemark() {
    const remarkField = dom.detailMount.querySelector('textarea[data-path="other.remark"]');
    if (!remarkField) {
      return;
    }

    remarkField.style.height = "auto";
    remarkField.style.height = String(remarkField.scrollHeight) + "px";
  }

  function renderDetailPanel() {
    const draft = getCurrentDraftEmployee();
    const isPanelOpen = isDetailOpen();
    const isEditable = uiState.detailMode === "add" || uiState.detailMode === "edit";
    const selectedEmployee = getEmployeeById(uiState.selectedEmployeeId);
    const inRetired = isRetiredView();

    dom.workspace.className = "employees-workspace" + (isPanelOpen ? " employees-workspace--panel-open" : "");

    if (!isPanelOpen || !draft) {
      dom.detailMount.innerHTML = "";
      return;
    }

    dom.detailMount.innerHTML = [
      '<div class="employees-detail__actions">',
      '<div>' + (inRetired && selectedEmployee ? '<button type="button" class="employees-secondary-button employees-primary-button--danger" data-action="request-delete-employee">Delete</button>' : "") + "</div>",
      '<div>' + (!inRetired ? '<button type="button" class="employees-primary-button" data-action="open-add-panel">' + getIconSvg("plus") + '<span>Add</span></button>' : "") + "</div>",
      "</div>",
      '<button type="button" class="employees-secondary-button employees-detail__collapse" data-action="request-close-panel">&gt;&gt;</button>',
      '<div class="employees-avatar-box">',
      '<button type="button" class="employees-avatar-box__preview" data-action="preview-avatar" data-tooltip="點擊查看頭像預覽">',
      '<img src="' + escapeHtml(draft.avatarSrc || dataApi.DEFAULT_IMAGE_SRC) + '" alt="員工頭像">',
      "</button>",
      '<div class="employees-avatar-box__actions">',
      '<button type="button" class="employees-secondary-button" data-action="choose-avatar"' + (!isEditable ? " disabled" : "") + ">Edit</button>",
      draft.avatarChanged ? '<button type="button" class="employees-secondary-button employees-primary-button--danger" data-action="reset-avatar"' + (!isEditable ? " disabled" : "") + ">Delete</button>" : "",
      (draft.avatarChanged && uiState.avatarDirty) ? '<button type="button" class="employees-primary-button" data-action="save-avatar-local">Save</button>' : "",
      "</div>",
      "</div>",
      '<div class="employee-form">' + formApi.renderEmployeeFormSections(draft, { isEditable: isEditable, statusLocked: uiState.detailMode === "add" }) + "</div>",
      !inRetired ? [
        '<div class="employees-detail__footer">',
        '<button type="button" class="employees-primary-button" data-action="save-employee"' + (uiState.detailMode === "view" ? " disabled" : "") + ">Save</button>",
        '<button type="button" class="employees-secondary-button" data-action="start-edit-employee"' + (uiState.detailMode !== "view" ? " disabled" : "") + ">Edit</button>",
        "</div>"
      ].join("") : ""
    ].join("");

    autoResizeRemark();
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
        '<div class="employees-modal"><div class="employees-modal__card">',
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
        '<div class="employees-modal"><div class="employees-modal__card">',
        '<h2 class="employees-modal__title">請輸入刪除密碼</h2>',
        '<div class="employees-modal__text">密碼固定為：091100</div>',
        '<input id="employeesPasswordInput" class="employees-modal__input" type="password" value="' + escapeHtml(uiState.passwordDraft) + '">',
        uiState.passwordError ? '<div class="employees-modal__text" style="color:#ff8a80;">' + escapeHtml(uiState.passwordError) + "</div>" : "",
        '<div class="employees-modal__actions">',
        '<button type="button" class="employees-secondary-button" data-action="close-modal">取消</button>',
        '<button type="button" class="employees-primary-button employees-primary-button--danger" data-action="confirm-delete-employee">Delete</button>',
        "</div></div></div>"
      ].join("");
      return;
    }

    if (uiState.openModal === "confirm-close") {
      dom.modalMount.innerHTML = [
        '<div class="employees-modal"><div class="employees-modal__card">',
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
        '<div class="employees-modal"><div class="employees-modal__card">',
        '<h2 class="employees-modal__title">提示</h2>',
        '<div class="employees-modal__text">' + escapeHtml(uiState.noticeText) + "</div>",
        '<div class="employees-modal__actions"><button type="button" class="employees-primary-button" data-action="close-modal">確認</button></div>',
        "</div></div>"
      ].join("");
      return;
    }

    if (uiState.openModal === "preview-avatar") {
      dom.modalMount.innerHTML = [
        '<div class="employees-modal"><div class="employees-modal__card">',
        '<h2 class="employees-modal__title">頭像預覽</h2>',
        '<div class="employees-avatar-box__preview" style="cursor:default;"><img src="' + escapeHtml(uiState.previewImageSrc) + '" alt="頭像預覽"></div>',
        '<div class="employees-modal__actions"><button type="button" class="employees-primary-button" data-action="close-modal">關閉</button></div>',
        "</div></div>"
      ].join("");
    }
  }

  function focusPendingInputs() {
    if (uiState.editingTitle) {
      const titleInput = document.getElementById("employeesTitleInput");
      if (titleInput) {
        titleInput.focus();
        titleInput.select();
      }
    }

    if (uiState.addingDepartment) {
      const departmentInput = document.getElementById("employeesDepartmentInput");
      if (departmentInput) {
        departmentInput.focus();
      }
    }

    if (uiState.creatingTab) {
      const tabInput = document.getElementById("employeesTabNameInput");
      if (tabInput) {
        tabInput.focus();
      }
    }

    if (uiState.openModal === "password-delete") {
      const passwordInput = document.getElementById("employeesPasswordInput");
      if (passwordInput) {
        passwordInput.focus();
      }
    }

    if (uiState.editingDepartmentId) {
      const editInput = document.querySelector('[data-role="department-edit-input"]');
      if (editInput) {
        editInput.focus();
        editInput.select();
      }
    }
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
    renderAll();
  }

  function closePanelImmediately() {
    uiState.detailMode = "hidden";
    uiState.selectedEmployeeId = "";
    uiState.draftEmployee = null;
    uiState.referenceEmployee = null;
    uiState.avatarDirty = false;
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
    uiState.editingTitle = !uiState.editingTitle;
    uiState.titleDraft = uiState.editingTitle ? state.interfaceMeta.title : "";
    renderSidebar();
    focusPendingInputs();
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

  function startAddDepartment() {
    uiState.addingDepartment = true;
    uiState.departmentDraft = "";
    renderSidebar();
  }

  function confirmAddDepartment() {
    const trimmed = uiState.departmentDraft.trim();

    if (!trimmed) {
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
  }

  function confirmEditDepartment() {
    const department = state.departments.find(function (item) {
      return item.id === uiState.editingDepartmentId;
    });
    const trimmed = uiState.departmentEditDraft.trim();

    if (!department || !trimmed) {
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
    uiState.tabDraft = { name: "", condition: "" };
    uiState.openMoreTabs = false;
    renderToolbar();
  }

  function confirmCreateTab() {
    const trimmedName = uiState.tabDraft.name.trim();

    if (!trimmedName) {
      openNotice("請輸入 tab 名稱。");
      return;
    }

    const nextTab = {
      id: "tab-" + Date.now(),
      name: trimmedName,
      condition: uiState.tabDraft.condition.trim()
    };
    const departmentTabs = state.tabsByDepartment[state.selectedDepartmentId] || [];

    departmentTabs.push(nextTab);
    state.tabsByDepartment[state.selectedDepartmentId] = departmentTabs;
    state.activeTabByDepartment[state.selectedDepartmentId] = nextTab.id;
    persistState();
    uiState.creatingTab = false;
    uiState.tabDraft = { name: "", condition: "" };
    renderToolbar();
  }

  function updateDraftEmployee(path, value) {
    uiState.draftEmployee = formApi.cloneDraft(uiState.draftEmployee);
    formApi.setValueAtPath(uiState.draftEmployee, path, value);
    uiState.draftEmployee = formApi.applyDerivedFields(uiState.draftEmployee);
    renderDetailPanel();
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

    if (action === "select-department") {
      state.selectedDepartmentId = button.getAttribute("data-department-id") || departmentId;
      uiState.openDepartmentMenuId = "";
      uiState.creatingTab = false;
      uiState.showDisplayMenu = false;
      uiState.showFilterMenu = false;
      persistState();
      closePanelImmediately();
      renderAll();
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
      return;
    }

    if (action === "toggle-search") {
      uiState.showSearchInput = !uiState.showSearchInput;
      renderToolbar();
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
      renderDetailPanel();
      return;
    }

    if (action === "save-avatar-local") {
      uiState.avatarDirty = false;
      renderDetailPanel();
      return;
    }

    if (action === "preview-avatar") {
      uiState.previewImageSrc = (uiState.draftEmployee && uiState.draftEmployee.avatarSrc) || dataApi.DEFAULT_IMAGE_SRC;
      uiState.openModal = "preview-avatar";
      renderModal();
      return;
    }

    if (action === "choose-employee-file") {
      dom.fileInput.click();
    }
  }

  function handleRootClick(event) {
    const actionButton = event.target.closest("[data-action]");

    if (!actionButton) {
      if (!event.target.closest(".employees-department__menu")) {
        uiState.openDepartmentMenuId = "";
        renderSidebar();
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

    if (target.id === "employeesTabConditionInput") {
      uiState.tabDraft.condition = target.value;
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

  function handleRootKeydown(event) {
    if (event.key !== "Enter") {
      return;
    }

    if (event.target.id === "employeesTitleInput") {
      event.preventDefault();
      confirmTitleEdit();
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

    if (event.target.id === "employeesTabNameInput" || event.target.id === "employeesTabConditionInput") {
      event.preventDefault();
      confirmCreateTab();
      return;
    }

    if (event.target.id === "employeesPasswordInput") {
      event.preventDefault();
      deleteSelectedEmployee();
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
        renderDetailPanel();
      });
    });

    dom.fileInput.addEventListener("change", function () {
      const file = dom.fileInput.files[0];

      if (!file || !uiState.draftEmployee) {
        return;
      }

      readFileAsDataUrl(file, function (result) {
        uiState.draftEmployee.other.employeesFileName = file.name;
        uiState.draftEmployee.other.employeesFileData = result;
        renderDetailPanel();
      });
    });
  }

  buildShell();
  syncDepartmentOptionsWithState();
  attachStaticListeners();
  renderAll();
})();
