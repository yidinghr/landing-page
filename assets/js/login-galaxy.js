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
        baseDensity: 0.00068,
        baseMaxCount: 2780,
        twinkleDensity: 0.00038,
        twinkleMaxCount: 1240,
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
    warm: isSchedulePage ? [174, 162, 255] : [246, 224, 178],
    violet: [194, 130, 255],
    amber: isSchedulePage ? [112, 134, 235] : [236, 194, 102],
    cool: [132, 154, 255],
    electric: [176, 164, 255],
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
  let flareStars = [];
  let meteors = [];
  let asteroidBelt = [];
  let nextFlareAt = 0;
  let nextMeteorAt = 0;
  let lastMeteorFrameAt = 0;
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
        color: isSchedulePage
          ? (index % 3 === 0 ? COLORS.electric : index % 2 === 0 ? COLORS.cool : COLORS.violet)
          : (index % 3 === 0 ? COLORS.cool : index % 2 === 0 ? COLORS.amber : COLORS.violet)
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
      const radius = randomBetween(isSchedulePage ? 0.28 : 0.22, isSchedulePage ? 1.9 : 1.62, rng);
      const alpha = randomBetween(isSchedulePage ? 0.24 : 0.2, isSchedulePage ? 0.94 : 0.86, rng);
      const color = isSchedulePage
        ? (rng() < 0.34 ? COLORS.cool : rng() < 0.68 ? COLORS.violet : COLORS.electric)
        : (rng() < 0.14 ? COLORS.cool : rng() < 0.36 ? COLORS.violet : COLORS.warm);

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
      const sparkle = rng() < (isSchedulePage ? 0.38 : 0.24);
      twinkleStars.push({
        x: rng() * width,
        y: rng() * height,
        radius: randomBetween(isSchedulePage ? 0.64 : 0.5, sparkle ? (isSchedulePage ? 2.4 : 1.8) : (isSchedulePage ? 1.55 : 1.2), rng),
        baseAlpha: randomBetween(isSchedulePage ? 0.24 : 0.18, isSchedulePage ? 0.98 : 0.92, rng),
        pulseMin: randomBetween(isSchedulePage ? 0.18 : 0.3, 0.7, rng),
        pulseMax: randomBetween(0.9, isSchedulePage ? 1.8 : 1.35, rng),
        speed: randomBetween(isSchedulePage ? 0.58 : 0.32, isSchedulePage ? 2.15 : 1.24, rng),
        phase: rng() * Math.PI * 2,
        sparkle: sparkle,
        color: isSchedulePage
          ? (rng() < 0.42 ? COLORS.cool : rng() < 0.82 ? COLORS.electric : COLORS.violet)
          : (rng() < 0.18 ? COLORS.cool : rng() < 0.4 ? COLORS.violet : COLORS.white)
      });
    }
  }

  function buildAsteroidBelt(rng) {
    const count = isLoginPage ? 42 : 0;
    asteroidBelt = [];

    for (let index = 0; index < count; index += 1) {
      asteroidBelt.push({
        angle: rng() * Math.PI * 2,
        radiusRatio: randomBetween(0.78, 1.18, rng),
        size: randomBetween(1.2, 4.2, rng),
        speed: randomBetween(0.035, 0.1, rng) * (rng() < 0.5 ? -1 : 1),
        depth: randomBetween(0.48, 1.1, rng),
        alpha: randomBetween(0.28, 0.72, rng),
        color: rng() < 0.58 ? COLORS.amber : rng() < 0.82 ? COLORS.violet : COLORS.cool
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
    buildAsteroidBelt(rng);

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

  function drawLoginPlanetLayer(timestamp) {
    if (!isLoginPage) {
      return;
    }

    const centerX = width * 0.5;
    const centerY = height * 0.52;
    const planetRadius = clamp(Math.min(width, height) * 0.105, 64, 138);
    const orbitRadiusX = planetRadius * 2.35;
    const orbitRadiusY = planetRadius * 0.74;
    const time = timestamp * 0.001;

    context.save();
    context.globalCompositeOperation = "screen";

    drawGlow(context, centerX, centerY, planetRadius * 3.4, COLORS.violet, 0.12);
    drawGlow(context, centerX - planetRadius * 0.24, centerY - planetRadius * 0.16, planetRadius * 2.1, COLORS.cool, 0.08);

    context.save();
    context.translate(centerX, centerY);
    context.rotate(-0.23);
    context.strokeStyle = "rgba(236, 194, 102, 0.16)";
    context.lineWidth = Math.max(1, planetRadius * 0.012);
    context.beginPath();
    context.ellipse(0, 0, orbitRadiusX, orbitRadiusY, 0, 0, Math.PI * 2);
    context.stroke();
    context.strokeStyle = "rgba(194, 130, 255, 0.12)";
    context.beginPath();
    context.ellipse(0, 0, orbitRadiusX * 1.24, orbitRadiusY * 1.18, 0, 0, Math.PI * 2);
    context.stroke();
    context.restore();

    asteroidBelt.forEach(function (asteroid) {
      const angle = asteroid.angle + time * asteroid.speed;
      const ellipseX = Math.cos(angle) * orbitRadiusX * asteroid.radiusRatio;
      const ellipseY = Math.sin(angle) * orbitRadiusY * asteroid.radiusRatio;
      const tiltCos = Math.cos(-0.23);
      const tiltSin = Math.sin(-0.23);
      const x = centerX + ellipseX * tiltCos - ellipseY * tiltSin;
      const y = centerY + ellipseX * tiltSin + ellipseY * tiltCos;
      const farSide = Math.sin(angle) < 0;
      const radius = asteroid.size * asteroid.depth * (farSide ? 0.72 : 1);
      const alpha = asteroid.alpha * (farSide ? 0.45 : 1);

      context.fillStyle = rgba(asteroid.color, alpha);
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();

      if (!farSide && radius > 2.4) {
        drawGlow(context, x, y, radius * 4.2, asteroid.color, alpha * 0.12);
      }
    });

    const planetGradient = context.createRadialGradient(
      centerX - planetRadius * 0.38,
      centerY - planetRadius * 0.42,
      planetRadius * 0.06,
      centerX,
      centerY,
      planetRadius
    );
    planetGradient.addColorStop(0, "rgba(255, 248, 212, 0.98)");
    planetGradient.addColorStop(0.18, "rgba(238, 184, 88, 0.92)");
    planetGradient.addColorStop(0.48, "rgba(114, 70, 184, 0.9)");
    planetGradient.addColorStop(0.78, "rgba(30, 18, 74, 0.96)");
    planetGradient.addColorStop(1, "rgba(4, 3, 18, 0.98)");

    context.shadowColor = "rgba(236, 194, 102, 0.24)";
    context.shadowBlur = planetRadius * 0.34;
    context.fillStyle = planetGradient;
    context.beginPath();
    context.arc(centerX, centerY, planetRadius, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;

    context.globalCompositeOperation = "source-atop";
    context.fillStyle = "rgba(255, 235, 174, 0.12)";
    for (let band = -2; band <= 2; band += 1) {
      context.beginPath();
      context.ellipse(
        centerX,
        centerY + band * planetRadius * 0.2 + Math.sin(time * 0.16 + band) * 2,
        planetRadius * (0.78 + Math.abs(band) * 0.08),
        planetRadius * 0.055,
        -0.18,
        0,
        Math.PI * 2
      );
      context.fill();
    }

    context.restore();
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

  function resetFlares() {
    flareStars = [];
    nextFlareAt = 0;
  }

  function queueNextFlare(timestamp) {
    nextFlareAt = timestamp + randomBetween(isSchedulePage ? 260 : 880, isSchedulePage ? 980 : 2600, Math.random);
  }

  function spawnFlares(timestamp) {
    if (!twinkleStars.length) {
      return;
    }

    const count = isSchedulePage
      ? (Math.random() < 0.58 ? 1 : 2)
      : (Math.random() < 0.68 ? 1 : 2);
    for (let index = 0; index < count; index += 1) {
      const source = twinkleStars[Math.floor(Math.random() * twinkleStars.length)];
      flareStars.push({
        x: source.x,
        y: source.y,
        radius: source.radius * randomBetween(isSchedulePage ? 2.1 : 1.4, isSchedulePage ? 3.4 : 2.4, Math.random),
        color: source.color,
        start: timestamp,
        duration: randomBetween(isSchedulePage ? 780 : 620, isSchedulePage ? 1480 : 1180, Math.random),
        alpha: randomBetween(isSchedulePage ? 0.78 : 0.62, isSchedulePage ? 1 : 0.95, Math.random)
      });
    }
  }

  function updateFlares(timestamp) {
    if (!nextFlareAt) {
      queueNextFlare(timestamp);
    }

    if (timestamp >= nextFlareAt) {
      spawnFlares(timestamp);
      queueNextFlare(timestamp);
    }

    flareStars = flareStars.filter(function (star) {
      return timestamp - star.start < star.duration;
    });
  }

  function drawFlareLayer(timestamp) {
    if (!flareStars.length) {
      return;
    }

    context.save();
    context.globalCompositeOperation = "screen";

    flareStars.forEach(function (star) {
      const progress = clamp((timestamp - star.start) / star.duration, 0, 1);
      const fade = Math.sin(progress * Math.PI);
      const alpha = star.alpha * fade;
      const glowRadius = star.radius * (isSchedulePage ? 12.5 : 8.8);

      drawGlow(context, star.x, star.y, glowRadius, star.color, alpha * 0.42);

      context.fillStyle = rgba(COLORS.white, alpha);
      context.fillRect(star.x - star.radius * 2.4, star.y - 0.55, star.radius * 4.8, 1.1);
      context.fillRect(star.x - 0.55, star.y - star.radius * 2.4, 1.1, star.radius * 4.8);
      context.beginPath();
      context.arc(star.x, star.y, Math.max(1.2, star.radius), 0, Math.PI * 2);
      context.fill();
    });

    context.restore();
  }

  function resetMeteors() {
    meteors = [];
    nextMeteorAt = isSchedulePage ? performance.now() + randomBetween(700, 1500, Math.random) : 0;
    lastMeteorFrameAt = 0;
  }

  function queueNextMeteor(timestamp, quickFollow) {
    const delay = quickFollow
      ? randomBetween(340, 920, Math.random)
      : randomBetween(isSchedulePage ? 1600 : 7000, isSchedulePage ? 5200 : 16000, Math.random);
    nextMeteorAt = timestamp + delay;
  }

  function spawnMeteor() {
    const angle = randomBetween(0.58, 0.82, Math.random);
    const speed = randomBetween(isSchedulePage ? 620 : 520, isSchedulePage ? 920 : 760, Math.random);
    const startFromTop = Math.random() < 0.72;

    meteors.push({
      x: startFromTop ? randomBetween(width * -0.08, width * 0.82, Math.random) : randomBetween(width * -0.18, width * 0.08, Math.random),
      y: startFromTop ? randomBetween(height * -0.16, height * 0.16, Math.random) : randomBetween(height * 0.04, height * 0.38, Math.random),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      length: randomBetween(isSchedulePage ? 118 : 86, isSchedulePage ? 230 : 168, Math.random),
      radius: randomBetween(0.9, isSchedulePage ? 1.9 : 1.6, Math.random),
      alpha: randomBetween(0.52, 0.88, Math.random),
      life: 0,
      maxLife: randomBetween(1.05, 1.7, Math.random)
    });
  }

  function spawnMeteorBurst() {
    const count = isSchedulePage
      ? Math.floor(randomBetween(1, 4, Math.random))
      : 1;
    for (let index = 0; index < count; index += 1) {
      if (meteors.length >= (isSchedulePage ? 3 : 2)) {
        break;
      }
      spawnMeteor();
    }
  }

  function updateMeteors(timestamp) {
    if (!nextMeteorAt) {
      queueNextMeteor(timestamp, false);
    }

    const maxMeteors = isSchedulePage ? 3 : 2;
    if (timestamp >= nextMeteorAt && meteors.length < maxMeteors) {
      spawnMeteorBurst();
      queueNextMeteor(timestamp, meteors.length < maxMeteors && Math.random() < 0.32);
    }

    const delta = lastMeteorFrameAt ? Math.min(0.05, (timestamp - lastMeteorFrameAt) / 1000) : 0;
    lastMeteorFrameAt = timestamp;

    meteors.forEach(function (meteor) {
      meteor.x += meteor.vx * delta;
      meteor.y += meteor.vy * delta;
      meteor.life += delta;
    });

    meteors = meteors.filter(function (meteor) {
      return meteor.life < meteor.maxLife &&
        meteor.x < width + meteor.length + 40 &&
        meteor.y < height + meteor.length + 40;
    });
  }

  function drawMeteorLayer() {
    if (!meteors.length) {
      return;
    }

    context.save();
    context.globalCompositeOperation = "screen";
    context.lineCap = "round";

    meteors.forEach(function (meteor) {
      const progress = clamp(meteor.life / meteor.maxLife, 0, 1);
      const fade = Math.sin(progress * Math.PI);
      const alpha = meteor.alpha * fade;
      const magnitude = Math.sqrt(meteor.vx * meteor.vx + meteor.vy * meteor.vy) || 1;
      const tailX = meteor.x - (meteor.vx / magnitude) * meteor.length;
      const tailY = meteor.y - (meteor.vy / magnitude) * meteor.length;
      const trail = context.createLinearGradient(tailX, tailY, meteor.x, meteor.y);

      trail.addColorStop(0, "rgba(132, 154, 255, 0)");
      trail.addColorStop(0.58, rgba(COLORS.cool, alpha * 0.18));
      trail.addColorStop(1, rgba(COLORS.white, alpha));

      context.strokeStyle = trail;
      context.lineWidth = meteor.radius;
      context.beginPath();
      context.moveTo(tailX, tailY);
      context.lineTo(meteor.x, meteor.y);
      context.stroke();
      drawGlow(context, meteor.x, meteor.y, meteor.radius * 7.5, COLORS.white, alpha * 0.28);
    });

    context.restore();
  }

  function drawFrame(timestamp) {
    if (!sceneBuffer || !width || !height) {
      return;
    }

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.drawImage(sceneBuffer, 0, 0, width, height);
    drawLoginPlanetLayer(timestamp);

    if (!prefersReducedMotion.matches) {
      drawTwinkleLayer(timestamp * 0.001);
      updateFlares(timestamp);
      drawFlareLayer(timestamp);
      updateMeteors(timestamp);
      drawMeteorLayer();
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
      resetFlares();
      resetMeteors();
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
