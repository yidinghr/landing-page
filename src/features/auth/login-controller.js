import { TEMP_ADMIN_CREDENTIALS, TEMP_AUTH_KEY } from "../../app/config/auth.js";
import { APP_ROUTES } from "../../app/config/routes.js";
import { renderLocalePopover } from "../../shared/components/locale-switcher.js";
import { escapeHtml } from "../../shared/utils/escape-html.js";

export function initLoginPage({ i18n }) {
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

    if (
      account === TEMP_ADMIN_CREDENTIALS.account &&
      password === TEMP_ADMIN_CREDENTIALS.password
    ) {
      setMessage(i18n.t("login.success"), "success", "login.success");
      sessionStorage.setItem(TEMP_AUTH_KEY, "admin");
      window.location.href = APP_ROUTES.dashboard;
      return;
    }

    setMessage(i18n.t("login.error"), "error", "login.error");
    passwordInput.value = "";
    passwordInput.focus();
  });

  registerButton.addEventListener("click", function () {
    setMessage(
      i18n.t("login.registerUnavailable"),
      "error",
      "login.registerUnavailable"
    );
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
    sessionStorage.removeItem(TEMP_AUTH_KEY);
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

    const ariaLabel = escapeHtml(i18n.t("common.settings"));

    loginPageTools.innerHTML = [
      '<div class="yd-locale-control">',
      '<button type="button" class="yd-locale-button" data-locale-toggle="true" aria-label="',
      ariaLabel,
      '" aria-expanded="',
      String(localeMenuOpen),
      '">',
      '<span class="yd-locale-button__icon" aria-hidden="true">⚙</span>',
      "</button>",
      renderLocalePopover({
        i18n: i18n,
        isOpen: localeMenuOpen
      }),
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
}
