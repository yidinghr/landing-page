(function () {
  const i18n = window.YiDingI18n || null;
  const TEMP_ADMIN_ACCOUNT = "YiDing Admin";
  const TEMP_ADMIN_PASSWORD = "YDI0006";
  const LOGIN_REDIRECT_PATH = "home/home.html";

  const loginForm = document.getElementById("loginForm");
  const accountInput = document.getElementById("account");
  const passwordInput = document.getElementById("password");
  const registerButton = document.getElementById("registerButton");
  const loginMessage = document.getElementById("loginMessage");
  const loginTitle = document.getElementById("login-title");
  const loginLogo = document.querySelector(".login-logo");
  const loginPageTools = document.getElementById("loginPageTools");
  const accountLabel = document.querySelector('label[for="account"]');
  const passwordLabel = document.querySelector('label[for="password"]');
  const submitButton = loginForm && loginForm.querySelector('button[type="submit"]');
  let localeMenuOpen = false;
  let currentMessageType = "";
  let currentMessageKey = "";

  if (!loginForm || !accountInput || !passwordInput || !registerButton || !loginMessage || !i18n) {
    return;
  }

  renderLanguageControl();
  renderStaticText();
  resetLoginState();
  const unsubscribeI18n = i18n.subscribe(function () {
    renderLanguageControl();
    renderStaticText();
    syncMessageLocale();
  });

  window.addEventListener("pageshow", function () {
    resetLoginState();
  });

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const account = accountInput.value.trim();
    const password = passwordInput.value;

    if (account === TEMP_ADMIN_ACCOUNT && password === TEMP_ADMIN_PASSWORD) {
      setMessage(i18n.t("login.success"), "success", "login.success");
      sessionStorage.setItem("yd_temp_auth", "admin");
      window.location.href = LOGIN_REDIRECT_PATH;
      return;
    }

    setMessage(i18n.t("login.error"), "error", "login.error");
    passwordInput.value = "";
    passwordInput.focus();
  });

  registerButton.addEventListener("click", function () {
    setMessage(i18n.t("login.registerUnavailable"), "error", "login.registerUnavailable");
  });

  if (loginPageTools) {
    loginPageTools.addEventListener("click", function (event) {
      const localeButton = event.target.closest("[data-locale-toggle]");
      const localeOption = event.target.closest("[data-locale-value]");

      if (localeButton) {
        event.stopPropagation();
        localeMenuOpen = !localeMenuOpen;
        renderLanguageControl();
        return;
      }

      if (!localeOption) {
        return;
      }

      event.stopPropagation();
      i18n.setLocale(localeOption.getAttribute("data-locale-value"));
      localeMenuOpen = false;
      renderLanguageControl();
    });
  }

  document.addEventListener("click", function (event) {
    if (!localeMenuOpen || !loginPageTools || loginPageTools.contains(event.target)) {
      return;
    }

    localeMenuOpen = false;
    renderLanguageControl();
  });

  window.addEventListener("beforeunload", function () {
    unsubscribeI18n();
  });

  function resetLoginState() {
    accountInput.value = "";
    passwordInput.value = "";
    setMessage("", "");
    sessionStorage.removeItem("yd_temp_auth");
  }

  function renderStaticText() {
    document.title = i18n.t("login.pageTitle");
    if (loginTitle) {
      loginTitle.textContent = i18n.t("login.title");
    }
    if (loginLogo) {
      loginLogo.alt = i18n.t("login.logoAlt");
    }
    if (accountLabel) {
      accountLabel.textContent = i18n.t("login.account");
    }
    if (passwordLabel) {
      passwordLabel.textContent = i18n.t("login.password");
    }
    if (submitButton) {
      submitButton.textContent = i18n.t("login.login");
    }
    registerButton.textContent = i18n.t("login.register");
  }

  function renderLanguageControl() {
    if (!loginPageTools) {
      return;
    }

    const locale = i18n.getLocale();
    const options = i18n.getLocaleOptions().map(function (option) {
      const activeClass = option.value === locale ? " is-active" : "";

      return [
        '<button type="button" class="yd-locale-option' + activeClass + '" data-locale-value="' + option.value + '">',
        '<span>' + option.label + "</span>",
        '<span class="yd-locale-option__check" aria-hidden="true">●</span>',
        "</button>"
      ].join("");
    }).join("");

    loginPageTools.innerHTML = [
      '<div class="yd-locale-control">',
      '<button type="button" class="yd-locale-button" data-locale-toggle="true" aria-label="' + escapeHtml(i18n.t("common.settings")) + '" aria-expanded="' + String(localeMenuOpen) + '">',
      '<span class="yd-locale-button__icon" aria-hidden="true">⚙</span>',
      "</button>",
      '<div class="yd-locale-popover"' + (localeMenuOpen ? "" : " hidden") + '>',
      '<p class="yd-locale-popover__title">' + escapeHtml(i18n.t("common.language")) + "</p>",
      options,
      "</div>",
      "</div>"
    ].join("");
  }

  function syncMessageLocale() {
    if (!currentMessageKey) {
      return;
    }

    setMessage(i18n.t(currentMessageKey), currentMessageType, currentMessageKey);
  }

  function setMessage(message, type, key) {
    currentMessageType = type || "";
    currentMessageKey = key || "";
    loginMessage.textContent = message;
    loginMessage.classList.remove("is-error", "is-success");

    if (type === "error") {
      loginMessage.classList.add("is-error");
    }

    if (type === "success") {
      loginMessage.classList.add("is-success");
    }
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
