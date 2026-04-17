(function () {
  const canvas = document.querySelector("[data-galaxy-canvas]") ||
    document.getElementById("loginGalaxyCanvas") ||
    document.getElementById("homeGalaxyCanvas");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const isAutomation = Boolean(window.navigator && window.navigator.webdriver);
  const isSchedulePage = Boolean(document.body && document.body.classList.contains("edit-page"));
  const isDashboardPage = Boolean(document.body && document.body.classList.contains("dashboard-page"));
  const isLoginPage = Boolean(document.body && document.body.classList.contains("login-page"));

  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d", {
    alpha: false,
    desynchronized: true
  });

  if (!context) {
    return;
  }

  const pageProfile = isSchedulePage
    ? {
        dprCap: 1.22,
        baseDensity: 0.00048,
        baseMaxCount: 1960,
        twinkleDensity: 0.00027,
        twinkleMaxCount: 860,
        constellationCount: 16,
        glowCount: 16
      }
    : isDashboardPage
    ? {
        dprCap: 1.28,
        baseDensity: 0.00042,
        baseMaxCount: 1720,
        twinkleDensity: 0.00024,
        twinkleMaxCount: 760,
        constellationCount: 12,
        glowCount: 14
      }
    : isLoginPage
    ? {
        dprCap: 1.24,
        baseDensity: 0.0004,
        baseMaxCount: 1560,
        twinkleDensity: 0.00022,
        twinkleMaxCount: 700,
        constellationCount: 12,
        glowCount: 14
      }
    : {
        dprCap: 1.3,
        baseDensity: 0.00022,
        baseMaxCount: 880,
        twinkleDensity: 0.0001,
        twinkleMaxCount: 320,
        constellationCount: 10,
        glowCount: 8
      };

  const SETTINGS = {
    dprCap: pageProfile.dprCap,
    baseStars: {
      density: pageProfile.baseDensity,
      maxCount: pageProfile.baseMaxCount
    },
    twinkleStars: {
      density: pageProfile.twinkleDensity,
      maxCount: pageProfile.twinkleMaxCount
    },
    constellationCount: pageProfile.constellationCount,
    glowCount: pageProfile.glowCount
  };

  const COLORS = Object.freeze({
    spaceTop: "#090313",
    spaceBottom: "#020108",
    warm: [246, 224, 178],
    violet: [194, 130, 255],
    amber: [236, 194, 102],
    cool: [132, 154, 255],
    white: [250, 245, 235]
  });

  let width = 0;
  let height = 0;
  let dpr = 1;
  let resizeFrame = 0;
  let animationFrame = 0;
  let sceneBuffer = null;
  let sceneContext = null;
  let twinkleStars = [];
  let visible = document.visibilityState !== "hidden";

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(start, end, amount) {
    return start + (end - start) * amount;
  }

  function rgba(color, alpha) {
    return "rgba(" + color[0] + ", " + color[1] + ", " + color[2] + ", " + alpha + ")";
  }

  function createPrng(seed) {
    let state = seed >>> 0;

    return function () {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }

  function randomBetween(min, max, rng) {
    return lerp(min, max, rng());
  }

  function buildGradient(targetContext) {
    const background = targetContext.createLinearGradient(0, 0, 0, height);
    background.addColorStop(0, COLORS.spaceTop);
    background.addColorStop(1, COLORS.spaceBottom);
    return background;
  }

  function createBuffer() {
    const buffer = document.createElement("canvas");
    buffer.width = Math.max(1, Math.round(width * dpr));
    buffer.height = Math.max(1, Math.round(height * dpr));
    return buffer;
  }

  function drawGlow(targetContext, x, y, radius, color, alpha) {
    const gradient = targetContext.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, rgba(color, alpha));
    gradient.addColorStop(0.28, rgba(color, alpha * 0.42));
    gradient.addColorStop(0.68, rgba(color, alpha * 0.12));
    gradient.addColorStop(1, rgba(color, 0));

    targetContext.fillStyle = gradient;
    targetContext.beginPath();
    targetContext.arc(x, y, radius, 0, Math.PI * 2);
    targetContext.fill();
  }

  function drawStaticGlowClouds(targetContext, rng) {
    const glows = [];

    for (let index = 0; index < SETTINGS.glowCount; index += 1) {
      glows.push({
        x: randomBetween(width * -0.06, width * 1.06, rng),
        y: randomBetween(height * -0.08, height * 1.04, rng),
        radius: randomBetween(width * 0.14, width * 0.34, rng),
        alpha: randomBetween(0.04, 0.1, rng),
        color: index % 3 === 0 ? COLORS.cool : index % 2 === 0 ? COLORS.amber : COLORS.violet
      });
    }

    targetContext.save();
    targetContext.globalCompositeOperation = "screen";

    glows.forEach(function (glow) {
      drawGlow(targetContext, glow.x, glow.y, glow.radius, glow.color, glow.alpha);
    });

    targetContext.restore();
  }

  function drawStaticConstellations(targetContext, rng) {
    const patterns = [
      [[0.08, 0.22], [0.22, 0.34], [0.38, 0.58], [0.54, 0.36], [0.72, 0.18], [0.92, 0.32]],
      [[0.06, 0.7], [0.18, 0.46], [0.32, 0.32], [0.58, 0.24], [0.8, 0.42], [0.94, 0.2]],
      [[0.1, 0.62], [0.22, 0.42], [0.38, 0.24], [0.56, 0.28], [0.74, 0.5], [0.92, 0.72]],
      [[0.04, 0.26], [0.18, 0.2], [0.34, 0.44], [0.48, 0.3], [0.66, 0.48], [0.82, 0.36], [0.95, 0.54]],
      [[0.08, 0.48], [0.24, 0.58], [0.4, 0.4], [0.54, 0.18], [0.68, 0.24], [0.84, 0.42], [0.94, 0.68]],
      [[0.1, 0.18], [0.26, 0.3], [0.42, 0.24], [0.56, 0.44], [0.68, 0.68], [0.84, 0.56], [0.96, 0.34]]
    ];
    const anchoredPositions = isDashboardPage || isLoginPage
      ? [
          [0.06, 0.12],
          [0.24, 0.09],
          [0.44, 0.11],
          [0.65, 0.08],
          [0.86, 0.13],
          [0.12, 0.31],
          [0.34, 0.28],
          [0.56, 0.33],
          [0.81, 0.29],
          [0.16, 0.58],
          [0.46, 0.69],
          [0.78, 0.62]
        ]
      : null;

    targetContext.save();
    targetContext.globalCompositeOperation = "screen";

    for (let index = 0; index < SETTINGS.constellationCount; index += 1) {
      const pattern = patterns[index % patterns.length];
      const depth = randomBetween(0.72, 1.22, rng);
      const constellationWidth = randomBetween(width * 0.11, width * 0.2, rng) * depth;
      const constellationHeight = constellationWidth * randomBetween(0.32, 0.66, rng);
      const anchor = anchoredPositions ? anchoredPositions[index % anchoredPositions.length] : null;
      const originX = anchor
        ? clamp(
            anchor[0] * width + randomBetween(width * -0.03, width * 0.03, rng),
            width * 0.01,
            width * 0.9
          )
        : randomBetween(width * 0.02, width * 0.88, rng);
      const originY = anchor
        ? clamp(
            anchor[1] * height + randomBetween(height * -0.04, height * 0.04, rng),
            height * 0.02,
            height * 0.86
          )
        : randomBetween(height * 0.04, height * 0.82, rng);
      const alpha = randomBetween(0.08, 0.16, rng);

      targetContext.strokeStyle = rgba(COLORS.violet, alpha);
      targetContext.lineWidth = randomBetween(0.7, 1.55, rng) * (depth > 1 ? 1.05 : 0.95);

      for (let starIndex = 0; starIndex < pattern.length - 1; starIndex += 1) {
        const current = pattern[starIndex];
        const next = pattern[starIndex + 1];

        targetContext.beginPath();
        targetContext.moveTo(originX + current[0] * constellationWidth, originY + current[1] * constellationHeight);
        targetContext.lineTo(originX + next[0] * constellationWidth, originY + next[1] * constellationHeight);
        targetContext.stroke();
      }

      pattern.forEach(function (point) {
        const starX = originX + point[0] * constellationWidth;
        const starY = originY + point[1] * constellationHeight;
        drawGlow(targetContext, starX, starY, randomBetween(4, 11, rng) * depth, COLORS.white, alpha * 0.68);
      });
    }

    targetContext.restore();
  }

  function drawStaticStars(targetContext, rng) {
    const count = Math.min(
      SETTINGS.baseStars.maxCount,
      Math.round(width * height * SETTINGS.baseStars.density)
    );

    targetContext.save();
    targetContext.globalCompositeOperation = "screen";

    for (let index = 0; index < count; index += 1) {
      const x = rng() * width;
      const y = rng() * height;
      const radius = randomBetween(0.22, 1.62, rng);
      const alpha = randomBetween(0.2, 0.86, rng);
      const color = rng() < 0.14 ? COLORS.cool : rng() < 0.36 ? COLORS.violet : COLORS.warm;

      if (radius < 0.7) {
        targetContext.fillStyle = rgba(color, alpha);
        targetContext.fillRect(x, y, 1, 1);
        continue;
      }

      targetContext.fillStyle = rgba(color, alpha);
      targetContext.beginPath();
      targetContext.arc(x, y, radius, 0, Math.PI * 2);
      targetContext.fill();
    }

    targetContext.restore();
  }

  function buildTwinkleStars(rng) {
    const count = Math.min(
      SETTINGS.twinkleStars.maxCount,
      Math.round(width * height * SETTINGS.twinkleStars.density)
    );

    twinkleStars = [];

    for (let index = 0; index < count; index += 1) {
      const sparkle = rng() < 0.24;
      twinkleStars.push({
        x: rng() * width,
        y: rng() * height,
        radius: randomBetween(0.5, sparkle ? 1.8 : 1.2, rng),
        baseAlpha: randomBetween(0.18, 0.92, rng),
        pulseMin: randomBetween(0.3, 0.7, rng),
        pulseMax: randomBetween(0.9, 1.35, rng),
        speed: randomBetween(0.32, 1.24, rng),
        phase: rng() * Math.PI * 2,
        sparkle: sparkle,
        color: rng() < 0.18 ? COLORS.cool : rng() < 0.4 ? COLORS.violet : COLORS.white
      });
    }
  }

  function drawBaseScene() {
    const rng = createPrng(0x18c4d2ab ^ width ^ (height << 2));

    sceneBuffer = createBuffer();
    sceneContext = sceneBuffer.getContext("2d", { alpha: false });

    if (!sceneContext) {
      return;
    }

    sceneContext.setTransform(dpr, 0, 0, dpr, 0, 0);
    sceneContext.fillStyle = buildGradient(sceneContext);
    sceneContext.fillRect(0, 0, width, height);

    drawStaticGlowClouds(sceneContext, rng);
    drawStaticConstellations(sceneContext, rng);
    drawStaticStars(sceneContext, rng);
    buildTwinkleStars(rng);

    const vignette = sceneContext.createRadialGradient(
      width * 0.5,
      height * 0.48,
      width * 0.08,
      width * 0.5,
      height * 0.48,
      width * 0.86
    );
    vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
    vignette.addColorStop(1, "rgba(0, 0, 0, 0.54)");

    sceneContext.fillStyle = vignette;
    sceneContext.fillRect(0, 0, width, height);
  }

  function drawTwinkleLayer(time) {
    context.save();
    context.globalCompositeOperation = "screen";

    twinkleStars.forEach(function (star) {
      const pulse = clamp(
        lerp(star.pulseMin, star.pulseMax, 0.5 + 0.5 * Math.sin(time * star.speed + star.phase)),
        0,
        1.4
      );
      const alpha = clamp(star.baseAlpha * pulse, 0, 1);

      if (star.sparkle) {
        const glowRadius = star.radius * 4.2;
        const glow = context.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowRadius);
        glow.addColorStop(0, rgba(star.color, alpha * 0.9));
        glow.addColorStop(0.22, rgba(star.color, alpha * 0.28));
        glow.addColorStop(1, rgba(star.color, 0));

        context.fillStyle = glow;
        context.beginPath();
        context.arc(star.x, star.y, glowRadius, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = rgba(star.color, alpha * 0.76);
        context.fillRect(star.x - star.radius * 1.8, star.y - 0.45, star.radius * 3.6, 0.9);
        context.fillRect(star.x - 0.45, star.y - star.radius * 1.8, 0.9, star.radius * 3.6);
      }

      context.fillStyle = rgba(star.color, alpha);
      context.beginPath();
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      context.fill();
    });

    context.restore();
  }

  function drawFrame(timestamp) {
    if (!sceneBuffer || !width || !height) {
      return;
    }

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.drawImage(sceneBuffer, 0, 0, width, height);

    if (!prefersReducedMotion.matches) {
      drawTwinkleLayer(timestamp * 0.001);
    }
  }

  function stopAnimation() {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  }

  function renderFrame(timestamp) {
    drawFrame(timestamp);

    if (!prefersReducedMotion.matches && visible) {
      animationFrame = requestAnimationFrame(renderFrame);
    }
  }

  function startAnimation() {
    stopAnimation();

    if (prefersReducedMotion.matches || isAutomation || !visible) {
      drawFrame(0);
      return;
    }

    animationFrame = requestAnimationFrame(renderFrame);
  }

  function resize() {
    cancelAnimationFrame(resizeFrame);

    resizeFrame = requestAnimationFrame(function () {
      dpr = Math.min(window.devicePixelRatio || 1, SETTINGS.dprCap);
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";

      drawBaseScene();
      startAnimation();
    });
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });

  document.addEventListener("visibilitychange", function () {
    visible = document.visibilityState !== "hidden";
    if (visible) {
      startAnimation();
      return;
    }

    stopAnimation();
  });

  if (typeof prefersReducedMotion.addEventListener === "function") {
    prefersReducedMotion.addEventListener("change", function () {
      startAnimation();
    });
  }
})();
