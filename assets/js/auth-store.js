(function () {
  const ACCOUNTS_STORAGE_KEY = "yiding_accounts_v1";
  const SESSION_STORAGE_KEY = "yiding_auth_session_v1";
  const DEFAULT_AVATAR_SRC = "/image/logoweb.png";
  const MODULE_KEYS = Object.freeze(["employees", "schedule"]);
  const ADMIN_ACCOUNT = Object.freeze({
    username: "YiDing Admin",
    password: "YDI0006",
    role: "admin",
    displayName: "YiDing Admin",
    welcomeMessage: "燈哥",
    avatarSrc: DEFAULT_AVATAR_SRC,
    createdAt: "2026-04-13T00:00:00.000Z",
    phoneNumber: "",
    permissions: {
      employees: {
        access: "edit",
        scope: "all",
        departmentIds: []
      },
      schedule: {
        access: "edit",
        scope: "all",
        departmentIds: []
      }
    }
  });

  function cloneValue(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeString(value) {
    return String(value || "").trim();
  }

  function normalizeDepartmentIds(value) {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map(function (departmentId) {
        return normalizeString(departmentId);
      })
      .filter(Boolean);
  }

  function normalizeModulePermission(rawPermission, defaultAccess) {
    const access = rawPermission && rawPermission.access === "edit" ? "edit" : (defaultAccess || "view");
    const scope = rawPermission && rawPermission.scope === "selected" ? "selected" : "all";

    return {
      access: access,
      scope: scope,
      departmentIds: normalizeDepartmentIds(rawPermission && rawPermission.departmentIds)
    };
  }

  function buildDefaultPermissions(role) {
    const defaultAccess = role === "admin" ? "edit" : "view";

    return {
      employees: normalizeModulePermission({ access: defaultAccess, scope: "all", departmentIds: [] }, defaultAccess),
      schedule: normalizeModulePermission({ access: defaultAccess, scope: "all", departmentIds: [] }, defaultAccess)
    };
  }

  function normalizePermissions(rawPermissions, role) {
    const defaults = buildDefaultPermissions(role);
    const source = rawPermissions && typeof rawPermissions === "object" ? rawPermissions : {};

    return {
      employees: normalizeModulePermission(source.employees, defaults.employees.access),
      schedule: normalizeModulePermission(source.schedule, defaults.schedule.access)
    };
  }

  function normalizeRole(rawRole) {
    return rawRole === "admin" ? "admin" : "viewer";
  }

  function normalizeAccount(rawAccount) {
    const username = normalizeString(rawAccount && rawAccount.username);

    if (!username) {
      return null;
    }

    const role = normalizeRole(rawAccount && rawAccount.role);

    return {
      username: username,
      password: String(rawAccount && rawAccount.password || ""),
      role: role,
      displayName: normalizeString(rawAccount && rawAccount.displayName) || username,
      welcomeMessage: normalizeString(rawAccount && rawAccount.welcomeMessage) || username,
      avatarSrc: String(rawAccount && rawAccount.avatarSrc || DEFAULT_AVATAR_SRC),
      createdAt: String(rawAccount && rawAccount.createdAt || new Date().toISOString()),
      phoneNumber: normalizeString(rawAccount && rawAccount.phoneNumber),
      permissions: normalizePermissions(rawAccount && rawAccount.permissions, role)
    };
  }

  function writeAccounts(accounts) {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    return accounts;
  }

  function getRuntimeSeedAccounts() {
    const runtimeSeeds = window.YiDingRuntimeSeeds || null;
    if (!runtimeSeeds || !Array.isArray(runtimeSeeds.accounts)) {
      return [];
    }

    return runtimeSeeds.accounts
      .map(normalizeAccount)
      .filter(Boolean);
  }

  function mergeAccountsWithSeeds(accounts) {
    const mergedByUsername = new Map();

    getRuntimeSeedAccounts().forEach(function (account) {
      mergedByUsername.set(account.username.toLowerCase(), account);
    });

    (Array.isArray(accounts) ? accounts : []).forEach(function (account) {
      const normalizedAccount = normalizeAccount(account);
      if (!normalizedAccount) {
        return;
      }

      mergedByUsername.set(normalizedAccount.username.toLowerCase(), normalizedAccount);
    });

    return Array.from(mergedByUsername.values());
  }

  function persistAccounts(accounts) {
    return ensureAdminAccount(mergeAccountsWithSeeds(accounts));
  }

  function ensureAdminAccount(accounts) {
    const nextAccounts = Array.isArray(accounts) ? accounts.slice() : [];
    const adminIndex = nextAccounts.findIndex(function (account) {
      return account && account.username === ADMIN_ACCOUNT.username;
    });

    if (adminIndex === -1) {
      nextAccounts.unshift(cloneValue(ADMIN_ACCOUNT));
      return writeAccounts(nextAccounts);
    }

    const existing = nextAccounts[adminIndex] || {};
    nextAccounts[adminIndex] = {
      username: ADMIN_ACCOUNT.username,
      password: ADMIN_ACCOUNT.password,
      role: "admin",
      displayName: normalizeString(existing.displayName) || ADMIN_ACCOUNT.displayName,
      welcomeMessage: normalizeString(existing.welcomeMessage) || ADMIN_ACCOUNT.welcomeMessage,
      avatarSrc: String(existing.avatarSrc || ADMIN_ACCOUNT.avatarSrc),
      createdAt: String(existing.createdAt || ADMIN_ACCOUNT.createdAt),
      phoneNumber: normalizeString(existing.phoneNumber || ADMIN_ACCOUNT.phoneNumber),
      permissions: normalizePermissions(existing.permissions || ADMIN_ACCOUNT.permissions, "admin")
    };

    return writeAccounts(nextAccounts);
  }

  function getAccounts() {
    try {
      const parsed = JSON.parse(localStorage.getItem(ACCOUNTS_STORAGE_KEY) || "[]");
      if (!Array.isArray(parsed)) {
        return ensureAdminAccount(getRuntimeSeedAccounts());
      }

      const normalized = parsed
        .map(normalizeAccount)
        .filter(Boolean);

      return ensureAdminAccount(mergeAccountsWithSeeds(normalized));
    } catch (error) {
      return ensureAdminAccount(getRuntimeSeedAccounts());
    }
  }

  function getAccountByUsername(username) {
    const target = normalizeString(username);
    return getAccounts().find(function (account) {
      return account.username === target;
    }) || null;
  }

  function buildSession(account) {
    return {
      username: account.username,
      role: account.role,
      displayName: account.displayName,
      welcomeMessage: account.welcomeMessage,
      avatarSrc: account.avatarSrc,
      phoneNumber: account.phoneNumber,
      permissions: cloneValue(account.permissions)
    };
  }

  function setSession(account) {
    const session = buildSession(account);
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    return session;
  }

  function getSession() {
    try {
      const parsed = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY) || "null");
      if (!parsed || typeof parsed !== "object") {
        return null;
      }

      const account = getAccountByUsername(parsed.username);
      if (!account) {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        return null;
      }

      const freshSession = buildSession(account);
      if (JSON.stringify(freshSession) !== JSON.stringify(parsed)) {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(freshSession));
      }
      return freshSession;
    } catch (error) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
  }

  function getCurrentAccount() {
    const session = getSession();
    return session ? getAccountByUsername(session.username) : null;
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }

  function authenticate(username, password) {
    const account = getAccountByUsername(username);
    if (!account) {
      return null;
    }
    return account.password === String(password || "") ? account : null;
  }

  function buildAccountFromPayload(payload, role) {
    const normalizedRole = normalizeRole(role);

    return normalizeAccount({
      username: normalizeString(payload && payload.username),
      password: String(payload && payload.password || "").trim(),
      role: normalizedRole,
      displayName: normalizeString(payload && payload.displayName) || normalizeString(payload && payload.username),
      welcomeMessage: normalizeString(payload && payload.welcomeMessage),
      avatarSrc: String(payload && payload.avatarSrc || DEFAULT_AVATAR_SRC),
      createdAt: payload && payload.createdAt ? payload.createdAt : new Date().toISOString(),
      phoneNumber: normalizeString(payload && payload.phoneNumber),
      permissions: normalizePermissions(payload && payload.permissions, normalizedRole)
    });
  }

  function createAccount(payload) {
    const username = normalizeString(payload && payload.username);
    const password = String(payload && payload.password || "").trim();
    const welcomeMessage = normalizeString(payload && payload.welcomeMessage);

    if (!username || !password || !welcomeMessage) {
      return {
        ok: false,
        error: "missing-fields"
      };
    }

    const accounts = getAccounts();
    const duplicate = accounts.some(function (account) {
      return account.username.toLowerCase() === username.toLowerCase();
    });

    if (duplicate) {
      return {
        ok: false,
        error: "duplicate-account"
      };
    }

    const nextAccount = buildAccountFromPayload({
      username: username,
      password: password,
      role: "viewer",
      displayName: username,
      welcomeMessage: welcomeMessage,
      avatarSrc: DEFAULT_AVATAR_SRC,
      createdAt: new Date().toISOString(),
      phoneNumber: normalizeString(payload && payload.phoneNumber),
      permissions: payload && payload.permissions
    }, "viewer");

    accounts.push(nextAccount);
    persistAccounts(accounts);

    return {
      ok: true,
      account: nextAccount
    };
  }

  function updateAccount(targetUsername, payload) {
    const target = normalizeString(targetUsername);
    const accounts = getAccounts();
    const existing = accounts.find(function (account) {
      return account.username === target;
    });

    if (!existing) {
      return {
        ok: false,
        error: "missing-account"
      };
    }

    const nextUsername = normalizeString(payload && payload.username) || existing.username;
    const nextPassword = normalizeString(payload && payload.password) || existing.password;
    const nextWelcomeMessage = normalizeString(payload && payload.welcomeMessage) || existing.welcomeMessage;

    if (!nextUsername || !nextPassword || !nextWelcomeMessage) {
      return {
        ok: false,
        error: "missing-fields"
      };
    }

    const duplicate = accounts.some(function (account) {
      return account.username.toLowerCase() === nextUsername.toLowerCase() && account.username !== existing.username;
    });

    if (duplicate) {
      return {
        ok: false,
        error: "duplicate-account"
      };
    }

    const nextRole = existing.role === "admin" ? "admin" : normalizeRole(payload && payload.role || existing.role);
    const updatedAccount = buildAccountFromPayload({
      username: nextUsername,
      password: nextPassword,
      displayName: normalizeString(payload && payload.displayName) || nextUsername,
      welcomeMessage: nextWelcomeMessage,
      avatarSrc: String(payload && payload.avatarSrc || existing.avatarSrc || DEFAULT_AVATAR_SRC),
      createdAt: existing.createdAt,
      phoneNumber: normalizeString(payload && payload.phoneNumber),
      permissions: payload && payload.permissions ? payload.permissions : existing.permissions
    }, nextRole);

    const nextAccounts = accounts.map(function (account) {
      return account.username === existing.username ? updatedAccount : account;
    });

    persistAccounts(nextAccounts);

    const session = getSession();
    if (session && session.username === existing.username) {
      setSession(updatedAccount);
    }

    return {
      ok: true,
      account: updatedAccount
    };
  }

  function updateAvatar(username, avatarSrc) {
    const target = normalizeString(username);
    if (!target || !avatarSrc) {
      return null;
    }

    const accounts = getAccounts();
    const nextAccounts = accounts.map(function (account) {
      if (account.username !== target) {
        return account;
      }
      return Object.assign({}, account, {
        avatarSrc: String(avatarSrc)
      });
    });

    persistAccounts(nextAccounts);

    const updated = nextAccounts.find(function (account) {
      return account.username === target;
    }) || null;

    const session = getSession();
    if (updated && session && session.username === updated.username) {
      setSession(updated);
    }

    return updated;
  }

  function isAdmin(accountOrSession) {
    return Boolean(accountOrSession && accountOrSession.role === "admin");
  }

  function getModulePermission(accountOrSession, moduleKey) {
    const normalizedKey = MODULE_KEYS.indexOf(moduleKey) >= 0 ? moduleKey : "employees";
    const role = normalizeRole(accountOrSession && accountOrSession.role);
    const permissions = normalizePermissions(accountOrSession && accountOrSession.permissions, role);

    return permissions[normalizedKey];
  }

  function canEditModule(accountOrSession, moduleKey) {
    return getModulePermission(accountOrSession, moduleKey).access === "edit";
  }

  function canAccessModule(accountOrSession, moduleKey) {
    const permission = getModulePermission(accountOrSession, moduleKey);

    if (permission.scope === "all") {
      return true;
    }

    return permission.departmentIds.length > 0;
  }

  function getAccessibleDepartmentIds(accountOrSession, moduleKey, availableDepartmentIds) {
    const permission = getModulePermission(accountOrSession, moduleKey);
    const normalizedAvailable = normalizeDepartmentIds(availableDepartmentIds);

    if (permission.scope === "all") {
      return normalizedAvailable;
    }

    return normalizedAvailable.filter(function (departmentId) {
      return permission.departmentIds.indexOf(departmentId) >= 0;
    });
  }

  function canAccessDepartment(accountOrSession, moduleKey, departmentId) {
    const permission = getModulePermission(accountOrSession, moduleKey);
    const normalizedDepartmentId = normalizeString(departmentId);

    if (!normalizedDepartmentId) {
      return false;
    }

    if (permission.scope === "all") {
      return true;
    }

    return permission.departmentIds.indexOf(normalizedDepartmentId) >= 0;
  }

  window.YiDingAuthStore = {
    ACCOUNTS_STORAGE_KEY: ACCOUNTS_STORAGE_KEY,
    SESSION_STORAGE_KEY: SESSION_STORAGE_KEY,
    DEFAULT_AVATAR_SRC: DEFAULT_AVATAR_SRC,
    ADMIN_ACCOUNT: cloneValue(ADMIN_ACCOUNT),
    getAccounts: getAccounts,
    getAccountByUsername: getAccountByUsername,
    authenticate: authenticate,
    setSession: setSession,
    getSession: getSession,
    getCurrentAccount: getCurrentAccount,
    clearSession: clearSession,
    createAccount: createAccount,
    updateAccount: updateAccount,
    updateAvatar: updateAvatar,
    isAdmin: isAdmin,
    getModulePermission: getModulePermission,
    canEditModule: canEditModule,
    canAccessModule: canAccessModule,
    getAccessibleDepartmentIds: getAccessibleDepartmentIds,
    canAccessDepartment: canAccessDepartment
  };
})();
