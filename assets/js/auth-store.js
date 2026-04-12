(function () {
  const ACCOUNTS_STORAGE_KEY = "yiding_accounts_v1";
  const SESSION_STORAGE_KEY = "yiding_auth_session_v1";
  const DEFAULT_AVATAR_SRC = "/image/logoweb.png";
  const ADMIN_ACCOUNT = Object.freeze({
    username: "YiDing Admin",
    password: "YDI0006",
    role: "admin",
    displayName: "YiDing Admin",
    welcomeMessage: "燈哥",
    avatarSrc: DEFAULT_AVATAR_SRC,
    createdAt: "2026-04-13T00:00:00.000Z"
  });

  function cloneValue(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeString(value) {
    return String(value || "").trim();
  }

  function normalizeAccount(rawAccount) {
    const username = normalizeString(rawAccount && rawAccount.username);

    if (!username) {
      return null;
    }

    return {
      username: username,
      password: String(rawAccount && rawAccount.password || ""),
      role: rawAccount && rawAccount.role === "admin" ? "admin" : "viewer",
      displayName: normalizeString(rawAccount && rawAccount.displayName) || username,
      welcomeMessage: normalizeString(rawAccount && rawAccount.welcomeMessage) || username,
      avatarSrc: String(rawAccount && rawAccount.avatarSrc || DEFAULT_AVATAR_SRC),
      createdAt: String(rawAccount && rawAccount.createdAt || new Date().toISOString())
    };
  }

  function persistAccounts(accounts) {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    return accounts;
  }

  function ensureAdminAccount(accounts) {
    const nextAccounts = Array.isArray(accounts) ? accounts.slice() : [];
    const adminIndex = nextAccounts.findIndex(function (account) {
      return account && account.username === ADMIN_ACCOUNT.username;
    });

    if (adminIndex === -1) {
      nextAccounts.unshift(cloneValue(ADMIN_ACCOUNT));
      return persistAccounts(nextAccounts);
    }

    const existing = nextAccounts[adminIndex] || {};
    nextAccounts[adminIndex] = {
      username: ADMIN_ACCOUNT.username,
      password: ADMIN_ACCOUNT.password,
      role: "admin",
      displayName: normalizeString(existing.displayName) || ADMIN_ACCOUNT.displayName,
      welcomeMessage: normalizeString(existing.welcomeMessage) || ADMIN_ACCOUNT.welcomeMessage,
      avatarSrc: String(existing.avatarSrc || ADMIN_ACCOUNT.avatarSrc),
      createdAt: String(existing.createdAt || ADMIN_ACCOUNT.createdAt)
    };

    return persistAccounts(nextAccounts);
  }

  function getAccounts() {
    try {
      const parsed = JSON.parse(localStorage.getItem(ACCOUNTS_STORAGE_KEY) || "[]");
      if (!Array.isArray(parsed)) {
        return ensureAdminAccount([]);
      }

      const normalized = parsed
        .map(normalizeAccount)
        .filter(Boolean);

      return ensureAdminAccount(normalized);
    } catch (error) {
      return ensureAdminAccount([]);
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
      avatarSrc: account.avatarSrc
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

    const nextAccount = normalizeAccount({
      username: username,
      password: password,
      role: "viewer",
      displayName: username,
      welcomeMessage: welcomeMessage,
      avatarSrc: DEFAULT_AVATAR_SRC,
      createdAt: new Date().toISOString()
    });

    accounts.push(nextAccount);
    persistAccounts(accounts);

    return {
      ok: true,
      account: nextAccount
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
    updateAvatar: updateAvatar,
    isAdmin: isAdmin
  };
})();
