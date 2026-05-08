(function () {
  const i18n = window.YiDingI18n || null;
  const authStore = window.YiDingAuthStore || null;
  const LOGIN_REDIRECT_PATH = "home/home.html";
  const SUCCESS_PRIMARY_LINE = "欢迎回来";
  const SUCCESS_DURATION_MS = 3200;

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
  const successOverlay = document.getElementById("loginSuccessOverlay");
  const successCanvas = document.getElementById("loginSuccessCanvas");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let localeMenuOpen = false;
  let currentMessageType = "";
  let currentMessageKey = "";
  let isTransitioning = false;
  let animationCleanup = null;

  if (!loginForm || !accountInput || !passwordInput || !registerButton || !loginMessage || !i18n || !authStore) {
    return;
  }

  renderLanguageControl();
  renderStaticText();
  resetLoginState();
  authStore.getAccounts();

  const unsubscribeI18n = i18n.subscribe(function () {
    renderLanguageControl();
    renderStaticText();
    syncMessageLocale();
  });

  window.addEventListener("pageshow", function () {
    if (!authStore.getSession()) {
      resetLoginState();
    }
  });

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (isTransitioning) {
      return;
    }

    const username = accountInput.value.trim();
    const password = passwordInput.value;
    const account = authStore.authenticate(username, password);

    if (!account) {
      setMessage(i18n.t("login.error"), "error", "login.error");
      passwordInput.value = "";
      passwordInput.focus();
      return;
    }

    authStore.setSession(account);
    setMessage("", "");
    playSuccessSequence(account).then(function () {
      window.location.href = LOGIN_REDIRECT_PATH;
    });
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
    if (animationCleanup) {
      animationCleanup();
    }
  });

  function resetLoginState() {
    isTransitioning = false;
    if (animationCleanup) {
      animationCleanup();
      animationCleanup = null;
    }

    accountInput.value = "";
    passwordInput.value = "";
    accountInput.disabled = false;
    passwordInput.disabled = false;
    if (submitButton) {
      submitButton.disabled = false;
    }
    document.body.classList.remove("login-page--celebrating");
    setMessage("", "");

    if (successOverlay) {
      successOverlay.classList.remove("is-active");
      successOverlay.hidden = true;
    }
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

  function playSuccessSequence(account) {
    isTransitioning = true;
    accountInput.disabled = true;
    passwordInput.disabled = true;
    if (submitButton) {
      submitButton.disabled = true;
    }

    document.body.classList.add("login-page--celebrating");

    if (!successOverlay || !successCanvas) {
      return wait(SUCCESS_DURATION_MS);
    }

    successOverlay.hidden = false;
    requestAnimationFrame(function () {
      successOverlay.classList.add("is-active");
    });

    animationCleanup = runStarTextAnimation(successCanvas, [
      SUCCESS_PRIMARY_LINE,
      account && account.welcomeMessage ? account.welcomeMessage : (account && account.displayName ? account.displayName : "")
    ], SUCCESS_DURATION_MS);

    return wait(SUCCESS_DURATION_MS);
  }

  function runStarTextAnimation(canvas, lines, durationMs) {
    const context = canvas.getContext("2d");
    if (!context) {
      return function () {};
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(viewportWidth * devicePixelRatio);
    canvas.height = Math.round(viewportHeight * devicePixelRatio);
    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

    const textTargets = buildTextTargets(lines, viewportWidth, viewportHeight);
    const particles = buildParticles(textTargets, viewportWidth, viewportHeight);
    const startTime = performance.now();
    let frameId = 0;
    let stopped = false;

    function frame(now) {
      if (stopped) {
        return;
      }

      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const gatherProgress = Math.min(1, elapsed / (durationMs * 0.7));
      const eased = easeOutCubic(gatherProgress);
      context.clearRect(0, 0, viewportWidth, viewportHeight);

      const glow = context.createRadialGradient(
        viewportWidth * 0.5,
        viewportHeight * 0.5,
        0,
        viewportWidth * 0.5,
        viewportHeight * 0.5,
        Math.min(viewportWidth, viewportHeight) * 0.34
      );
      glow.addColorStop(0, "rgba(214, 170, 255, 0.1)");
      glow.addColorStop(0.46, "rgba(124, 88, 255, 0.05)");
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, viewportWidth, viewportHeight);

      particles.forEach(function (particle, index) {
        const x = particle.startX + (particle.targetX - particle.startX) * eased;
        const y = particle.startY + (particle.targetY - particle.startY) * eased;
        const sparkle = 0.72 + Math.sin(now * 0.005 + particle.phase + index * 0.02) * 0.28;
        const radius = particle.radius * sparkle;
        const halo = context.createRadialGradient(x, y, 0, x, y, radius * 5.2);

        halo.addColorStop(0, "rgba(255, 250, 236, 0.96)");
        halo.addColorStop(0.22, "rgba(255, 224, 166, 0.52)");
        halo.addColorStop(0.56, "rgba(196, 132, 255, 0.18)");
        halo.addColorStop(1, "rgba(255, 255, 255, 0)");

        context.fillStyle = halo;
        context.beginPath();
        context.arc(x, y, radius * 5.2, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = particle.color;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      });

      if (progress < 1) {
        frameId = requestAnimationFrame(frame);
      }
    }

    frameId = requestAnimationFrame(frame);

    return function () {
      stopped = true;
      cancelAnimationFrame(frameId);
      context.clearRect(0, 0, viewportWidth, viewportHeight);
    };
  }

  function buildTextTargets(lines, width, height) {
    const buffer = document.createElement("canvas");
    const context = buffer.getContext("2d");
    const step = Math.max(4, Math.round(width / 320));
    const lineOne = String(lines[0] || "");
    const lineTwo = String(lines[1] || "");
    const fontSizePrimary = Math.round(Math.min(width * 0.088, height * 0.14));
    const fontSizeSecondary = Math.round(fontSizePrimary * 0.62);
    const lineGap = Math.round(fontSizePrimary * 0.82);
    const centerY = height * 0.5;

    buffer.width = width;
    buffer.height = height;
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#ffffff";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "700 " + fontSizePrimary + "px \"Noto Serif TC\", \"Microsoft JhengHei\", serif";
    context.fillText(lineOne, width * 0.5, centerY - lineGap * 0.45);
    context.font = "700 " + fontSizeSecondary + "px \"Noto Serif TC\", \"Microsoft JhengHei\", serif";
    context.fillText(lineTwo, width * 0.5, centerY + lineGap * 0.62);

    const imageData = context.getImageData(0, 0, width, height).data;
    const points = [];

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const alpha = imageData[(y * width + x) * 4 + 3];
        if (alpha > 110) {
          points.push({ x: x, y: y });
        }
      }
    }

    if (points.length > 1800) {
      const reduced = [];
      const skip = Math.ceil(points.length / 1800);
      for (let index = 0; index < points.length; index += skip) {
        reduced.push(points[index]);
      }
      return reduced;
    }

    return points;
  }

  function buildParticles(targets, width, height) {
    return targets.map(function (target, index) {
      const edgeSelector = index % 4;
      let startX = 0;
      let startY = 0;

      if (edgeSelector === 0) {
        startX = -40 - Math.random() * width * 0.08;
        startY = Math.random() * height;
      } else if (edgeSelector === 1) {
        startX = width + 40 + Math.random() * width * 0.08;
        startY = Math.random() * height;
      } else if (edgeSelector === 2) {
        startX = Math.random() * width;
        startY = -40 - Math.random() * height * 0.08;
      } else {
        startX = Math.random() * width;
        startY = height + 40 + Math.random() * height * 0.08;
      }

      return {
        startX: startX,
        startY: startY,
        targetX: target.x,
        targetY: target.y,
        radius: 0.8 + Math.random() * 1.6,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.32 ? "rgba(255, 247, 228, 0.96)" : "rgba(214, 164, 255, 0.92)"
      };
    });
  }

  function easeOutCubic(value) {
    return 1 - Math.pow(1 - value, 3);
  }

  function wait(durationMs) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, durationMs);
    });
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
