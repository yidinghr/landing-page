(function () {
  const homeGreeting = document.getElementById("homeGreeting");
  const homeMenu = document.getElementById("homeMenu");

  const dashboardButtons = [
    { id: "employees", label: "弈鼎員工" },
    { id: "schedule", label: "班表" },
    { id: "attendance", label: "打卡" },
    { id: "profile", label: "弈鼎资料" }
  ];

  const dashboardActions = {
    employees: function () {},
    schedule: function () {},
    attendance: function () {},
    profile: function () {}
  };

  if (!homeGreeting && !homeMenu) {
    return;
  }

  function renderDashboardButtons() {
    if (!homeMenu) {
      return;
    }

    homeMenu.innerHTML = "";

    dashboardButtons.forEach(function (buttonConfig) {
      const button = document.createElement("button");

      button.type = "button";
      button.id = "dashboardButton-" + buttonConfig.id;
      button.dataset.buttonId = buttonConfig.id;
      button.className = "home-menu__item";
      button.textContent = buttonConfig.label;

      homeMenu.appendChild(button);
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

  function bindDashboardActions() {
    if (!homeMenu) {
      return;
    }

    homeMenu.addEventListener("click", function (event) {
      const button = event.target.closest(".home-menu__item");

      if (!button) {
        return;
      }

      event.preventDefault();

      const buttonId = button.dataset.buttonId;
      const action = dashboardActions[buttonId];

      if (typeof action === "function") {
        action();
      }

      button.blur();
    });
  }

  renderDashboardButtons();
  bindDashboardActions();
  updateGreeting();
  window.setInterval(updateGreeting, 60000);
})();
