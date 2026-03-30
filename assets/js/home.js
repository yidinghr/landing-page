(function () {
  const homeGreeting = document.getElementById("homeGreeting");
  const homeMenu = document.getElementById("homeMenu");
  const homeTopActions = document.getElementById("homeTopActions");

  const mainMenuButtons = [
    { id: "employees", label: "弈鼎員工" },
    { id: "schedule", label: "班表" },
    { id: "attendance", label: "打卡" },
    { id: "yidingInfo", label: "弈鼎资料" }
  ];

  const topActionIcons = [
    { id: "help", icon: "?", tooltip: "說明" },
    { id: "settings", icon: "⚙", tooltip: "設定" }
  ];

  const mainMenuPlaceholderActions = {
    employees: function () {},
    schedule: function () {},
    attendance: function () {},
    yidingInfo: function () {}
  };

  const topActionPlaceholderActions = {
    help: function () {},
    settings: function () {}
  };

  if (!homeGreeting && !homeMenu && !homeTopActions) {
    return;
  }

  function renderMainMenu() {
    if (!homeMenu) {
      return;
    }

    homeMenu.innerHTML = "";

    mainMenuButtons.forEach(function (buttonConfig) {
      const button = document.createElement("button");

      button.type = "button";
      button.id = "dashboardMainButton-" + buttonConfig.id;
      button.dataset.mainMenuId = buttonConfig.id;
      button.className = "home-menu__item";
      button.textContent = buttonConfig.label;

      homeMenu.appendChild(button);
    });
  }

  function renderTopActionIcons() {
    if (!homeTopActions) {
      return;
    }

    homeTopActions.innerHTML = "";

    topActionIcons.forEach(function (iconConfig) {
      const button = document.createElement("button");
      const icon = document.createElement("span");

      button.type = "button";
      button.id = "dashboardTopAction-" + iconConfig.id;
      button.dataset.topActionId = iconConfig.id;
      button.className = "home-top-action";
      button.setAttribute("aria-label", iconConfig.tooltip);
      button.setAttribute("data-tooltip", iconConfig.tooltip);

      icon.className = "home-top-action__icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = iconConfig.icon;

      button.appendChild(icon);
      homeTopActions.appendChild(button);
    });
  }

  function updateGreeting() {
    if (!homeGreeting) {
      return;
    }

    const currentHour = new Date().getHours();

    if (currentHour >= 5 && currentHour < 11) {
      homeGreeting.textContent = "燈哥，早安！";
      return;
    }

    if (currentHour >= 11 && currentHour < 13) {
      homeGreeting.textContent = "燈哥，中午好！";
      return;
    }

    if (currentHour >= 13 && currentHour < 18) {
      homeGreeting.textContent = "燈哥，下午好！";
      return;
    }

    homeGreeting.textContent = "燈哥，晚安！";
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

      if (!button) {
        return;
      }

      event.preventDefault();

      const actionId = button.dataset.topActionId;
      const action = topActionPlaceholderActions[actionId];

      if (typeof action === "function") {
        action();
      }

      button.blur();
    });
  }

  renderTopActionIcons();
  renderMainMenu();
  bindTopActionClicks();
  bindMainMenuClicks();
  updateGreeting();
  window.setInterval(updateGreeting, 60000);
})();
