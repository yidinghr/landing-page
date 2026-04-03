(function () {
  const i18n = window.YiDingI18n || null;
  const homeGreeting = document.getElementById("homeGreeting");
  const homeMenu = document.getElementById("homeMenu");
  const homeTopActions = document.getElementById("homeTopActions");
  let localeMenuOpen = false;

  const mainMenuButtons = [
    { id: "employees", labelKey: "home.menu.employees" },
    { id: "schedule", labelKey: "home.menu.schedule" },
    { id: "attendance", labelKey: "home.menu.attendance" },
    { id: "yidingInfo", labelKey: "home.menu.info" }
  ];

  const topActionIcons = [
    { id: "help", icon: "?", tooltipKey: "common.help" },
    { id: "settings", icon: "⚙", tooltipKey: "common.settings" }
  ];

  const mainMenuPlaceholderActions = {
    employees: function () {
      window.location.href = "employees.html";
    },
    schedule: function () {
      window.location.href = "edit/index.html";
    },
    attendance: function () {},
    yidingInfo: function () {}
  };

  const topActionPlaceholderActions = {
    help: function () {}
  };

  if (!homeGreeting && !homeMenu && !homeTopActions || !i18n) {
    return;
  }

  function renderMainMenu() {
    if (!homeMenu) {
      return;
    }

    document.title = i18n.t("home.pageTitle");
    homeMenu.setAttribute("aria-label", i18n.t("home.menuAria"));
    homeMenu.innerHTML = "";

    mainMenuButtons.forEach(function (buttonConfig) {
      const button = document.createElement("button");

      button.type = "button";
      button.id = "dashboardMainButton-" + buttonConfig.id;
      button.dataset.mainMenuId = buttonConfig.id;
      button.className = "home-menu__item";
      button.textContent = i18n.t(buttonConfig.labelKey);

      homeMenu.appendChild(button);
    });
  }

  function renderTopActionIcons() {
    if (!homeTopActions) {
      return;
    }

    homeTopActions.setAttribute("aria-label", i18n.t("home.topActionsAria"));
    homeTopActions.innerHTML = "";

    topActionIcons.forEach(function (iconConfig) {
      const button = document.createElement("button");
      const icon = document.createElement("span");

      button.type = "button";
      button.id = "dashboardTopAction-" + iconConfig.id;
      button.dataset.topActionId = iconConfig.id;
      button.className = "home-top-action";
      button.setAttribute("aria-label", i18n.t(iconConfig.tooltipKey));
      button.setAttribute("data-tooltip", i18n.t(iconConfig.tooltipKey));
      if (iconConfig.id === "settings") {
        button.setAttribute("aria-expanded", String(localeMenuOpen));
      }

      icon.className = "home-top-action__icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = iconConfig.icon;

      button.appendChild(icon);
      homeTopActions.appendChild(button);
    });

    homeTopActions.insertAdjacentHTML("beforeend", renderLocalePopover());
  }

  function updateGreeting() {
    if (!homeGreeting) {
      return;
    }

    const currentHour = new Date().getHours();

    if (currentHour >= 5 && currentHour < 11) {
      homeGreeting.textContent = i18n.t("home.greeting.morning");
      return;
    }

    if (currentHour >= 11 && currentHour < 13) {
      homeGreeting.textContent = i18n.t("home.greeting.noon");
      return;
    }

    if (currentHour >= 13 && currentHour < 18) {
      homeGreeting.textContent = i18n.t("home.greeting.afternoon");
      return;
    }

    homeGreeting.textContent = i18n.t("home.greeting.evening");
  }

  function renderLocalePopover() {
    const options = i18n.getLocaleOptions().map(function (option) {
      const activeClass = option.value === i18n.getLocale() ? " is-active" : "";

      return [
        '<button type="button" class="yd-locale-option' + activeClass + '" data-locale-value="' + option.value + '">',
        '<span>' + option.label + "</span>",
        '<span class="yd-locale-option__check" aria-hidden="true">●</span>',
        "</button>"
      ].join("");
    }).join("");

    return [
      '<div class="yd-locale-control home-top-actions__locale-control">',
      '<div class="yd-locale-popover"' + (localeMenuOpen ? "" : " hidden") + '>',
      '<p class="yd-locale-popover__title">' + escapeHtml(i18n.t("common.language")) + "</p>",
      options,
      "</div>",
      "</div>"
    ].join("");
  }

  function bindMainMenuClicks() {
    if (!homeMenu) {
      return;
    }

    homeMenu.addEventListener("click", function (event) {
      const button = event.target.closest(".home-menu__item");

      if (!button) {
        return;
      }

      event.preventDefault();

      const buttonId = button.dataset.mainMenuId;
      const action = mainMenuPlaceholderActions[buttonId];

      if (typeof action === "function") {
        action();
      }

      button.blur();
    });
  }

  function bindTopActionClicks() {
    if (!homeTopActions) {
      return;
    }

    homeTopActions.addEventListener("click", function (event) {
      const button = event.target.closest(".home-top-action");
      const localeOption = event.target.closest("[data-locale-value]");

      if (localeOption) {
        event.stopPropagation();
        i18n.setLocale(localeOption.getAttribute("data-locale-value"));
        localeMenuOpen = false;
        renderTopActionIcons();
        renderMainMenu();
        updateGreeting();
        return;
      }

      if (!button) {
        return;
      }

      event.preventDefault();

      const actionId = button.dataset.topActionId;
      if (actionId === "settings") {
        event.stopPropagation();
        localeMenuOpen = !localeMenuOpen;
        renderTopActionIcons();
        return;
      }

      const action = topActionPlaceholderActions[actionId];

      if (typeof action === "function") {
        action();
      }

      button.blur();
    });

    document.addEventListener("click", function (event) {
      if (!localeMenuOpen || !homeTopActions || homeTopActions.contains(event.target)) {
        return;
      }

      localeMenuOpen = false;
      renderTopActionIcons();
    });
  }

  i18n.subscribe(function () {
    renderTopActionIcons();
    renderMainMenu();
    updateGreeting();
  });

  renderTopActionIcons();
  renderMainMenu();
  bindTopActionClicks();
  bindMainMenuClicks();
  updateGreeting();
  window.setInterval(updateGreeting, 60000);

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();
