(function () {
  const canvas = document.getElementById("loginGalaxyCanvas");

  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d", { alpha: false });

  if (!context) {
    return;
  }

  const SETTINGS = {
    dprCap: 2,
    stars: {
      // Adjust these values to change star density, brightness, and twinkle strength.
      layers: [
        { density: 0.00056, size: [0.35, 0.82], alpha: [0.14, 0.42], drift: 0.7 },
        { density: 0.00033, size: [0.45, 1.2], alpha: [0.2, 0.72], drift: 1.4 },
        { density: 0.00015, size: [0.7, 1.75], alpha: [0.28, 0.94], drift: 2.2 }
      ],
      twinkleSeconds: [2.8, 10.5],
      staticChance: 0.2,
      warmChance: 0.84,
      coolChance: 0.04,
      sparkleChance: 0.08
    },
    halos: {
      // Adjust these values to control drifting halo count, size, speed, and brightness.
      count: 6,
      radius: [260, 560],
      alpha: [0.08, 0.22],
      driftSeconds: [96, 220],
      driftDistance: [0.016, 0.056]
    },
    nebula: {
      // Adjust these values to control nebula density, movement speed, and color intensity.
      overscan: 1.34,
      layers: [
        {
          opacity: 0.42,
          fieldPuffs: 520,
          bandPuffs: 1420,
          bandGrains: 2200,
          darkPuffs: 70,
          brightKnots: 22,
          bandWidth: [0.13, 0.24],
          glowBoost: 1.06,
          driftSecondsX: [180, 260],
          driftSecondsY: [210, 300],
          driftDistanceX: [0.012, 0.026],
          driftDistanceY: [0.01, 0.02]
        },
        {
          opacity: 0.31,
          fieldPuffs: 340,
          bandPuffs: 940,
          bandGrains: 1450,
          darkPuffs: 44,
          brightKnots: 13,
          bandWidth: [0.09, 0.17],
          glowBoost: 1.18,
          driftSecondsX: [130, 210],
          driftSecondsY: [160, 240],
          driftDistanceX: [0.018, 0.04],
          driftDistanceY: [0.012, 0.024]
        }
      ]
    },
    colors: {
      backgroundTop: "#09070a",
      backgroundBottom: "#050406",
      amber: [255, 178, 82],
      amberBright: [255, 208, 118],
      gold: [255, 231, 170],
      burntOrange: [198, 100, 34],
      brownDust: [68, 38, 22],
      coolBlue: [74, 98, 146],
      coolViolet: [88, 72, 116]
    }
  };

  let dpr = 1;
  let width = 0;
  let height = 0;
  let sceneSeed = (Math.random() * 0xffffffff) >>> 0;
  let starLayers = [];
  let haloLayers = [];
  let nebulaLayers = [];
  let resizeFrame = 0;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(start, end, amount) {
    return start + (end - start) * amount;
  }

  function randomBetween(min, max, rng) {
    return lerp(min, max, rng());
  }

  function createPrng(seed) {
    let state = seed >>> 0;

    return function () {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }

  function gaussian(rng) {
    let u = 0;
    let v = 0;

    while (u === 0) {
      u = rng();
    }

    while (v === 0) {
      v = rng();
    }

    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function rgba(color, alpha) {
    return "rgba(" + color[0] + ", " + color[1] + ", " + color[2] + ", " + alpha + ")";
  }

  function createBuffer(bufferWidth, bufferHeight) {
    const buffer = document.createElement("canvas");
    buffer.width = bufferWidth;
    buffer.height = bufferHeight;
    return buffer;
  }

  function cubicPoint(path, t) {
    const inverse = 1 - t;
    const inverseSquared = inverse * inverse;
    const inverseCubed = inverseSquared * inverse;
    const tSquared = t * t;
    const tCubed = tSquared * t;

    return {
      x:
        inverseCubed * path[0].x +
        3 * inverseSquared * t * path[1].x +
        3 * inverse * tSquared * path[2].x +
        tCubed * path[3].x,
      y:
        inverseCubed * path[0].y +
        3 * inverseSquared * t * path[1].y +
        3 * inverse * tSquared * path[2].y +
        tCubed * path[3].y
    };
  }

  function cubicTangent(path, t) {
    const inverse = 1 - t;

    return {
      x:
        3 * inverse * inverse * (path[1].x - path[0].x) +
        6 * inverse * t * (path[2].x - path[1].x) +
        3 * t * t * (path[3].x - path[2].x),
      y:
        3 * inverse * inverse * (path[1].y - path[0].y) +
        6 * inverse * t * (path[2].y - path[1].y) +
        3 * t * t * (path[3].y - path[2].y)
    };
  }

  function normalize(vector) {
    const length = Math.hypot(vector.x, vector.y) || 1;
    return { x: vector.x / length, y: vector.y / length };
  }

  function drawGlow(targetContext, x, y, radius, color, alpha, innerStop, midStop) {
    const gradient = targetContext.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, rgba(color, alpha));
    gradient.addColorStop(innerStop, rgba(color, alpha * 0.82));
    gradient.addColorStop(midStop, rgba(color, alpha * 0.28));
    gradient.addColorStop(1, rgba(color, 0));

    targetContext.fillStyle = gradient;
    targetContext.beginPath();
    targetContext.arc(x, y, radius, 0, Math.PI * 2);
    targetContext.fill();
  }

  function buildStarLayers() {
    const baseSeed = sceneSeed ^ 0x91e10da5;
    const area = width * height;

    return SETTINGS.stars.layers.map(function (layer, index) {
      const rng = createPrng(baseSeed + index * 1297);
      const count = Math.round(area * layer.density);
      const stars = [];

      for (let i = 0; i < count; i += 1) {
        const warm = rng() < SETTINGS.stars.warmChance;
        const cool = !warm && rng() < SETTINGS.stars.coolChance;
        const sparkle = rng() < SETTINGS.stars.sparkleChance;
        const staticStar = rng() < SETTINGS.stars.staticChance;
        const alpha = randomBetween(layer.alpha[0], layer.alpha[1], rng);
        let color = SETTINGS.colors.gold;

        if (warm) {
          color = rng() < 0.5 ? SETTINGS.colors.amber : SETTINGS.colors.amberBright;
        } else if (cool) {
          color = rng() < 0.5 ? SETTINGS.colors.coolBlue : SETTINGS.colors.coolViolet;
        }

        stars.push({
          x: rng() * width,
          y: rng() * height,
          radius: randomBetween(layer.size[0], layer.size[1], rng) * (sparkle ? 1.3 : 1),
          alpha: alpha,
          color: color,
          sparkle: sparkle,
          pulseMin: staticStar ? 0.92 : randomBetween(0.48, 0.82, rng),
          pulseMax: staticStar ? 1.04 : randomBetween(1.02, 1.78, rng),
          speed: (Math.PI * 2) / randomBetween(SETTINGS.stars.twinkleSeconds[0], SETTINGS.stars.twinkleSeconds[1], rng),
          phaseA: rng() * Math.PI * 2,
          phaseB: rng() * Math.PI * 2,
          phaseC: rng() * Math.PI * 2
        });
      }

      return {
        drift: layer.drift,
        phaseX: rng() * Math.PI * 2,
        phaseY: rng() * Math.PI * 2,
        speedX: randomBetween(0.14, 0.34, rng),
        speedY: randomBetween(0.12, 0.28, rng),
        stars: stars
      };
    });
  }

  function buildHaloLayers() {
    const rng = createPrng(sceneSeed ^ 0x6d2b79f5);
    const halos = [];

    for (let i = 0; i < SETTINGS.halos.count; i += 1) {
      halos.push({
        x: rng() * width,
        y: rng() * height,
        radius: randomBetween(SETTINGS.halos.radius[0], SETTINGS.halos.radius[1], rng),
        alpha: randomBetween(SETTINGS.halos.alpha[0], SETTINGS.halos.alpha[1], rng),
        color: rng() < 0.58 ? SETTINGS.colors.burntOrange : SETTINGS.colors.amber,
        accent: rng() < 0.18 ? SETTINGS.colors.coolBlue : SETTINGS.colors.gold,
        driftX: randomBetween(SETTINGS.halos.driftDistance[0], SETTINGS.halos.driftDistance[1], rng) * width,
        driftY: randomBetween(SETTINGS.halos.driftDistance[0], SETTINGS.halos.driftDistance[1], rng) * height,
        speedX: (Math.PI * 2) / randomBetween(SETTINGS.halos.driftSeconds[0], SETTINGS.halos.driftSeconds[1], rng),
        speedY: (Math.PI * 2) / randomBetween(SETTINGS.halos.driftSeconds[0], SETTINGS.halos.driftSeconds[1], rng),
        phaseX: rng() * Math.PI * 2,
        phaseY: rng() * Math.PI * 2
      });
    }

    return halos;
  }

  function buildNebulaLayers() {
    const baseSeed = sceneSeed ^ 0x31415926;

    return SETTINGS.nebula.layers.map(function (layer, index) {
      const rng = createPrng(baseSeed + index * 1777);
      const texture = buildNebulaTexture(layer, baseSeed + index * 7331);

      return {
        texture: texture,
        opacity: layer.opacity,
        phaseX: rng() * Math.PI * 2,
        phaseY: rng() * Math.PI * 2,
        speedX: (Math.PI * 2) / randomBetween(layer.driftSecondsX[0], layer.driftSecondsX[1], rng),
        speedY: (Math.PI * 2) / randomBetween(layer.driftSecondsY[0], layer.driftSecondsY[1], rng),
        driftX: randomBetween(layer.driftDistanceX[0], layer.driftDistanceX[1], rng) * width,
        driftY: randomBetween(layer.driftDistanceY[0], layer.driftDistanceY[1], rng) * height
      };
    });
  }

  function buildNebulaTexture(layer, seed) {
    const rng = createPrng(seed);
    const textureWidth = Math.max(1400, Math.round(width * SETTINGS.nebula.overscan));
    const textureHeight = Math.max(900, Math.round(height * SETTINGS.nebula.overscan));
    const buffer = createBuffer(textureWidth, textureHeight);
    const bufferContext = buffer.getContext("2d");
    const bandPath = [
      { x: -0.18 * textureWidth, y: randomBetween(0.66, 0.8, rng) * textureHeight },
      { x: 0.18 * textureWidth, y: randomBetween(0.84, 0.98, rng) * textureHeight },
      { x: 0.58 * textureWidth, y: randomBetween(0.22, 0.42, rng) * textureHeight },
      { x: 1.14 * textureWidth, y: randomBetween(0.28, 0.48, rng) * textureHeight }
    ];
    const minDimension = Math.min(textureWidth, textureHeight);
    const areaFactor = (textureWidth * textureHeight) / 1200000;

    bufferContext.clearRect(0, 0, textureWidth, textureHeight);
    bufferContext.globalCompositeOperation = "screen";

    for (let i = 0; i < Math.round(layer.fieldPuffs * areaFactor); i += 1) {
      const x = rng() * textureWidth;
      const y = rng() * textureHeight;
      const radius = randomBetween(textureWidth * 0.025, textureWidth * 0.12, rng);
      const alpha = randomBetween(0.012, 0.04, rng) * layer.glowBoost;
      const colorRoll = rng();
      let color = SETTINGS.colors.burntOrange;

      if (colorRoll > 0.7) {
        color = SETTINGS.colors.amber;
      }

      if (colorRoll > 0.93) {
        color = SETTINGS.colors.coolBlue;
      }

      drawGlow(bufferContext, x, y, radius, color, alpha, 0.04, 0.28);
    }

    for (let i = 0; i < Math.round(layer.darkPuffs * areaFactor); i += 1) {
      const x = rng() * textureWidth;
      const y = rng() * textureHeight;
      const radius = randomBetween(textureWidth * 0.04, textureWidth * 0.12, rng);
      const darkGradient = bufferContext.createRadialGradient(x, y, 0, x, y, radius);

      darkGradient.addColorStop(0, "rgba(2, 2, 4, 0.16)");
      darkGradient.addColorStop(0.4, "rgba(4, 3, 6, 0.08)");
      darkGradient.addColorStop(1, "rgba(4, 3, 6, 0)");

      bufferContext.globalCompositeOperation = "source-over";
      bufferContext.fillStyle = darkGradient;
      bufferContext.beginPath();
      bufferContext.arc(x, y, radius, 0, Math.PI * 2);
      bufferContext.fill();
      bufferContext.globalCompositeOperation = "screen";
    }

    for (let i = 0; i < Math.round(layer.bandPuffs * areaFactor); i += 1) {
      const t = Math.pow(rng(), randomBetween(0.72, 1.32, rng));
      const point = cubicPoint(bandPath, t);
      const tangent = normalize(cubicTangent(bandPath, t));
      const normal = { x: -tangent.y, y: tangent.x };
      const bandWidth = randomBetween(layer.bandWidth[0], layer.bandWidth[1], rng) * minDimension;
      const normalOffset = gaussian(rng) * bandWidth;
      const tangentOffset = gaussian(rng) * bandWidth * 0.18;
      const x = point.x + normal.x * normalOffset + tangent.x * tangentOffset;
      const y = point.y + normal.y * normalOffset + tangent.y * tangentOffset;
      const coreBias = 1 - clamp(Math.abs(normalOffset) / bandWidth, 0, 1);
      const alpha = lerp(0.018, 0.11, Math.pow(coreBias, 1.3)) * layer.glowBoost;
      const radius = randomBetween(bandWidth * 0.18, bandWidth * 0.68, rng);
      const roll = rng();
      let color = SETTINGS.colors.burntOrange;

      if (roll > 0.48) {
        color = SETTINGS.colors.amber;
      }

      if (roll > 0.86) {
        color = SETTINGS.colors.amberBright;
      }

      if (roll > 0.97) {
        color = SETTINGS.colors.gold;
      }

      drawGlow(bufferContext, x, y, radius, color, alpha, 0.03, 0.34);
    }

    for (let i = 0; i < Math.round(layer.brightKnots * areaFactor); i += 1) {
      const t = randomBetween(0.1, 0.92, rng);
      const point = cubicPoint(bandPath, t);
      const knotRadius = randomBetween(minDimension * 0.025, minDimension * 0.06, rng);
      const burstCount = Math.round(randomBetween(7, 14, rng));

      for (let j = 0; j < burstCount; j += 1) {
        const angle = rng() * Math.PI * 2;
        const distance = randomBetween(0, knotRadius * 0.76, rng);
        const x = point.x + Math.cos(angle) * distance;
        const y = point.y + Math.sin(angle) * distance;
        const radius = randomBetween(knotRadius * 0.3, knotRadius * 1.15, rng);
        const alpha = randomBetween(0.036, 0.11, rng) * layer.glowBoost;

        drawGlow(
          bufferContext,
          x,
          y,
          radius,
          rng() < 0.5 ? SETTINGS.colors.amberBright : SETTINGS.colors.gold,
          alpha,
          0.02,
          0.26
        );
      }
    }

    bufferContext.globalCompositeOperation = "screen";

    for (let i = 0; i < Math.round(layer.bandGrains * areaFactor); i += 1) {
      const t = rng();
      const point = cubicPoint(bandPath, t);
      const tangent = normalize(cubicTangent(bandPath, t));
      const normal = { x: -tangent.y, y: tangent.x };
      const bandWidth = randomBetween(layer.bandWidth[0], layer.bandWidth[1], rng) * minDimension * 0.7;
      const normalOffset = gaussian(rng) * bandWidth;
      const tangentOffset = gaussian(rng) * bandWidth * 0.22;
      const x = point.x + normal.x * normalOffset + tangent.x * tangentOffset;
      const y = point.y + normal.y * normalOffset + tangent.y * tangentOffset;
      const alpha = randomBetween(0.05, 0.2, rng) * (1 - clamp(Math.abs(normalOffset) / bandWidth, 0, 1));
      const radius = randomBetween(0.35, 1.28, rng);
      const color = rng() < 0.72 ? SETTINGS.colors.amber : (rng() < 0.9 ? SETTINGS.colors.amberBright : SETTINGS.colors.gold);

      bufferContext.fillStyle = rgba(color, alpha);
      bufferContext.beginPath();
      bufferContext.arc(x, y, radius, 0, Math.PI * 2);
      bufferContext.fill();
    }

    return buffer;
  }

  function resize() {
    cancelAnimationFrame(resizeFrame);

    resizeFrame = requestAnimationFrame(function () {
      dpr = Math.min(window.devicePixelRatio || 1, SETTINGS.dprCap);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.imageSmoothingEnabled = true;

      starLayers = buildStarLayers();
      haloLayers = buildHaloLayers();
      nebulaLayers = buildNebulaLayers();
    });
  }

  function drawBase() {
    const gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, SETTINGS.colors.backgroundTop);
    gradient.addColorStop(1, SETTINGS.colors.backgroundBottom);

    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    const amberWash = context.createRadialGradient(
      width * 0.72,
      height * 0.46,
      0,
      width * 0.72,
      height * 0.46,
      width * 0.62
    );

    amberWash.addColorStop(0, "rgba(88, 42, 12, 0.14)");
    amberWash.addColorStop(1, "rgba(8, 6, 8, 0)");

    context.fillStyle = amberWash;
    context.fillRect(0, 0, width, height);

    const coolWash = context.createRadialGradient(
      width * 0.1,
      height * 0.18,
      0,
      width * 0.1,
      height * 0.18,
      width * 0.2
    );

    coolWash.addColorStop(0, "rgba(42, 58, 98, 0.08)");
    coolWash.addColorStop(1, "rgba(6, 6, 8, 0)");

    context.fillStyle = coolWash;
    context.fillRect(0, 0, width, height);
  }

  function drawHalos(time) {
    // Drifting halos live here.
    context.save();
    context.globalCompositeOperation = "screen";

    haloLayers.forEach(function (halo) {
      const x = halo.x + Math.sin(time * halo.speedX + halo.phaseX) * halo.driftX;
      const y = halo.y + Math.cos(time * halo.speedY + halo.phaseY) * halo.driftY;

      drawGlow(context, x, y, halo.radius, halo.color, halo.alpha, 0.04, 0.34);
      drawGlow(context, x + halo.radius * 0.08, y - halo.radius * 0.05, halo.radius * 0.56, halo.accent, halo.alpha * 0.28, 0.06, 0.24);
    });

    context.restore();
  }

  function drawNebula(time) {
    // Nebula movement lives here. Each layer drifts slowly at a different speed.
    context.save();
    context.globalCompositeOperation = "screen";

    nebulaLayers.forEach(function (layer) {
      const offsetX = Math.sin(time * layer.speedX + layer.phaseX) * layer.driftX;
      const offsetY = Math.cos(time * layer.speedY + layer.phaseY) * layer.driftY;
      const drawX = (width - layer.texture.width) * 0.5 + offsetX;
      const drawY = (height - layer.texture.height) * 0.5 + offsetY;

      context.globalAlpha = layer.opacity;
      context.drawImage(layer.texture, drawX, drawY, layer.texture.width, layer.texture.height);
    });

    context.restore();
    context.globalAlpha = 1;
  }

  function drawStars(time) {
    // Random twinkling stars live here. Each star has its own speed, phase, and brightness range.
    context.save();
    context.globalCompositeOperation = "lighter";

    starLayers.forEach(function (layer) {
      const offsetX = Math.sin(time * layer.speedX + layer.phaseX) * layer.drift;
      const offsetY = Math.cos(time * layer.speedY + layer.phaseY) * layer.drift;

      layer.stars.forEach(function (star) {
        const waveA = Math.sin(time * star.speed + star.phaseA);
        const waveB = Math.sin(time * star.speed * 0.37 + star.phaseB);
        const waveC = Math.sin(time * star.speed * 0.11 + star.phaseC);
        const blend = clamp(0.5 + 0.5 * (waveA * 0.56 + waveB * 0.29 + waveC * 0.15), 0, 1);
        const alpha = clamp(star.alpha * lerp(star.pulseMin, star.pulseMax, blend), 0, 1);
        const x = star.x + offsetX;
        const y = star.y + offsetY;

        if (star.sparkle) {
          const glow = context.createRadialGradient(x, y, 0, x, y, star.radius * 3.2);
          glow.addColorStop(0, rgba(star.color, alpha));
          glow.addColorStop(0.3, rgba(star.color, alpha * 0.3));
          glow.addColorStop(1, rgba(star.color, 0));

          context.fillStyle = glow;
          context.beginPath();
          context.arc(x, y, star.radius * 3.2, 0, Math.PI * 2);
          context.fill();
        }

        context.fillStyle = rgba(star.color, alpha);
        context.beginPath();
        context.arc(x, y, star.radius, 0, Math.PI * 2);
        context.fill();
      });
    });

    context.restore();
  }

  function drawVignette() {
    const vignette = context.createRadialGradient(
      width * 0.5,
      height * 0.5,
      width * 0.18,
      width * 0.5,
      height * 0.5,
      width * 0.82
    );

    vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
    vignette.addColorStop(1, "rgba(0, 0, 0, 0.46)");

    context.fillStyle = vignette;
    context.fillRect(0, 0, width, height);
  }

  function render(timeMs) {
    const time = timeMs * 0.001;

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawBase();
    drawHalos(time);
    drawNebula(time);
    drawStars(time);
    drawVignette();
    requestAnimationFrame(render);
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });
  requestAnimationFrame(render);
})();
