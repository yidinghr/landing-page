(function () {
  const authStore = window.YiDingAuthStore || null;
  const body = document.body;

  if (!authStore || !body) {
    return;
  }

  const loginPath = body.getAttribute("data-login-path") || "../index.html";
  const homePath = body.getAttribute("data-home-path") || "home.html";
  const moduleKey = body.getAttribute("data-module-key") || "";
  const currentAccount = authStore.getCurrentAccount();

  if (!currentAccount) {
    window.location.replace(loginPath);
    return;
  }

  if (moduleKey) {
    if (!authStore.canEditModule(currentAccount, moduleKey)) {
      window.location.replace(homePath);
    }
    return;
  }

  if (!authStore.isAdmin(currentAccount)) {
    window.location.replace(homePath);
  }
})();
