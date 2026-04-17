import "./employees-data.js";
import "./runtime-seeds.js";

(function () {
  const dataApi = window.YiDingEmployeesData || null;
  const runtimeSeeds = window.YiDingRuntimeSeeds || null;
  const AUTO_MERGE_THRESHOLD = 20;

  if (!dataApi) {
    return;
  }

  const originalCreateInitialState = dataApi.createInitialState.bind(dataApi);
  const cloneValue = dataApi.cloneValue || function (value) {
    return JSON.parse(JSON.stringify(value));
  };
  const defaultImageSrc = String(dataApi.DEFAULT_IMAGE_SRC || "../image/logo.png");
  const seedEmployees = Array.isArray(runtimeSeeds && runtimeSeeds.employees) && runtimeSeeds.employees.length
    ? cloneValue(runtimeSeeds.employees)
    : cloneValue(dataApi.SEED_EMPLOYEES || []);

  function normalizeString(value) {
    return String(value || "").trim();
  }

  function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function hasMeaningfulValue(value) {
    if (value === undefined || value === null) {
      return false;
    }

    if (typeof value === "string") {
      return normalizeString(value) !== "";
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    if (isPlainObject(value)) {
      return Object.keys(value).length > 0;
    }

    return true;
  }

  function fillMissing(savedValue, seedValue) {
    if (Array.isArray(savedValue) || Array.isArray(seedValue)) {
      return hasMeaningfulValue(savedValue) ? cloneValue(savedValue) : cloneValue(seedValue);
    }

    if (isPlainObject(savedValue) || isPlainObject(seedValue)) {
      const result = {};
      const savedObject = isPlainObject(savedValue) ? savedValue : {};
      const seedObject = isPlainObject(seedValue) ? seedValue : {};
      const keys = new Set(Object.keys(seedObject).concat(Object.keys(savedObject)));

      keys.forEach(function (key) {
        result[key] = fillMissing(savedObject[key], seedObject[key]);
      });

      return result;
    }

    return hasMeaningfulValue(savedValue) ? savedValue : seedValue;
  }

  function isMeaningfulEmployee(employee) {
    const basic = employee && employee.basic ? employee.basic : {};
    const work = employee && employee.work ? employee.work : {};
    const contact = employee && employee.contact ? employee.contact : {};

    return [
      basic.ydiId,
      basic.engName,
      basic.vieName,
      work.position,
      contact.phoneNumber && contact.phoneNumber.number
    ].some(hasMeaningfulValue);
  }

  function getEmployeeKey(employee) {
    const basic = employee && employee.basic ? employee.basic : {};
    return normalizeString(basic.ydiId) || normalizeString(employee && employee.id);
  }

  function mergeEmployee(savedEmployee, seedEmployee) {
    if (!savedEmployee) {
      return cloneValue(seedEmployee);
    }

    const mergedEmployee = fillMissing(savedEmployee, seedEmployee);
    const savedAvatar = normalizeString(savedEmployee.avatarSrc);
    const seedAvatar = normalizeString(seedEmployee && seedEmployee.avatarSrc);

    if (savedEmployee.avatarChanged && savedAvatar) {
      mergedEmployee.avatarSrc = savedAvatar;
      mergedEmployee.avatarChanged = true;
    } else if (savedAvatar && savedAvatar !== defaultImageSrc) {
      mergedEmployee.avatarSrc = savedAvatar;
      mergedEmployee.avatarChanged = Boolean(savedEmployee.avatarChanged);
    } else if (seedAvatar) {
      mergedEmployee.avatarSrc = seedAvatar;
      mergedEmployee.avatarChanged = Boolean(seedEmployee && seedEmployee.avatarChanged);
    } else {
      mergedEmployee.avatarSrc = defaultImageSrc;
      mergedEmployee.avatarChanged = Boolean(savedEmployee.avatarChanged || seedEmployee && seedEmployee.avatarChanged);
    }

    mergedEmployee.id = normalizeString(savedEmployee.id) || normalizeString(seedEmployee && seedEmployee.id);
    mergedEmployee.departmentId = normalizeString(savedEmployee.departmentId) || normalizeString(seedEmployee && seedEmployee.departmentId);
    mergedEmployee.createdAt = hasMeaningfulValue(savedEmployee.createdAt) ? savedEmployee.createdAt : seedEmployee && seedEmployee.createdAt;

    return mergedEmployee;
  }

  function mergeEmployees(savedEmployees, nextSeedEmployees) {
    const result = [];
    const savedByKey = new Map();
    const seenKeys = new Set();

    (Array.isArray(savedEmployees) ? savedEmployees : []).forEach(function (employee) {
      if (!employee || !isMeaningfulEmployee(employee)) {
        return;
      }

      const key = getEmployeeKey(employee);
      if (!key) {
        result.push(cloneValue(employee));
        return;
      }

      savedByKey.set(key.toLowerCase(), employee);
    });

    (Array.isArray(nextSeedEmployees) ? nextSeedEmployees : []).forEach(function (employee) {
      if (!employee || !isMeaningfulEmployee(employee)) {
        return;
      }

      const key = getEmployeeKey(employee);
      if (!key) {
        result.push(cloneValue(employee));
        return;
      }

      const loweredKey = key.toLowerCase();
      seenKeys.add(loweredKey);
      result.push(mergeEmployee(savedByKey.get(loweredKey), employee));
    });

    savedByKey.forEach(function (employee, loweredKey) {
      if (seenKeys.has(loweredKey)) {
        return;
      }

      result.push(cloneValue(employee));
    });

    return result;
  }

  function mergeDepartments(savedDepartments, defaultDepartments) {
    const result = [];
    const seenIds = new Set();

    (Array.isArray(savedDepartments) ? savedDepartments : []).forEach(function (department) {
      const departmentId = normalizeString(department && department.id);
      if (!departmentId || seenIds.has(departmentId)) {
        return;
      }

      seenIds.add(departmentId);
      result.push(cloneValue(department));
    });

    (Array.isArray(defaultDepartments) ? defaultDepartments : []).forEach(function (department) {
      const departmentId = normalizeString(department && department.id);
      if (!departmentId || seenIds.has(departmentId)) {
        return;
      }

      seenIds.add(departmentId);
      result.push(cloneValue(department));
    });

    return result;
  }

  function shouldAutoMerge(rawState) {
    return Boolean(rawState && Array.isArray(rawState.employees) && rawState.employees.length >= AUTO_MERGE_THRESHOLD);
  }

  function createInitialState() {
    const initialState = originalCreateInitialState();

    return Object.assign({}, initialState, {
      departments: mergeDepartments(initialState.departments, dataApi.DEFAULT_DEPARTMENTS),
      employees: cloneValue(seedEmployees),
      runtimeSeedGeneratedAt: normalizeString(runtimeSeeds && runtimeSeeds.generatedAt)
    });
  }

  function mergeStateWithSeedData(rawState, options) {
    if (!rawState || typeof rawState !== "object") {
      return createInitialState();
    }

    if (!(options && options.force) && !shouldAutoMerge(rawState)) {
      return rawState;
    }

    const nextState = Object.assign({}, rawState, {
      departments: mergeDepartments(rawState.departments, dataApi.DEFAULT_DEPARTMENTS),
      employees: mergeEmployees(rawState.employees, seedEmployees),
      runtimeSeedGeneratedAt: normalizeString(runtimeSeeds && runtimeSeeds.generatedAt)
    });

    if (!normalizeString(nextState.selectedDepartmentId) && nextState.departments[0]) {
      nextState.selectedDepartmentId = nextState.departments[0].id;
    }

    return nextState;
  }

  function migrateStoredState() {
    try {
      const storageValue = window.localStorage.getItem(dataApi.STORAGE_KEY);
      if (!storageValue) {
        return;
      }

      const parsedState = JSON.parse(storageValue);
      if (!shouldAutoMerge(parsedState)) {
        return;
      }

      const mergedState = mergeStateWithSeedData(parsedState, { force: true });
      if (JSON.stringify(mergedState) !== JSON.stringify(parsedState)) {
        window.localStorage.setItem(dataApi.STORAGE_KEY, JSON.stringify(mergedState));
      }
    } catch (error) {
      return;
    }
  }

  window.YiDingEmployeesData = Object.assign({}, dataApi, {
    SEED_EMPLOYEES: cloneValue(seedEmployees),
    createInitialState: createInitialState,
    createInitialStateOriginal: originalCreateInitialState,
    getRuntimeSeedEmployees: function () {
      return cloneValue(seedEmployees);
    },
    mergeStateWithSeedData: mergeStateWithSeedData
  });

  migrateStoredState();
})();
