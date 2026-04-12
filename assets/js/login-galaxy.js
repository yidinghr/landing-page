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
    colors: {
      spaceTop: "#090312",
      spaceBottom: "#03020a",
      brownShadow: [24, 12, 36],
      warmDust: [86, 42, 126],
      amber: [203, 106, 255],
      amberSoft: [152, 90, 232],
      gold: [250, 238, 255],
      coolBlue: [118, 148, 255]
    },
    stars: {
      // Random twinkling stars live here:
      // density/size/alpha tune how many stars appear and how bright they get.
      layers: [
        { density: 0.0044, size: [0.22, 0.62], alpha: [0.16, 0.54], speed: [3.0, 5.1], direction: -1, driftY: 5, sparkleChance: 0.04 },
        { density: 0.0034, size: [0.32, 0.92], alpha: [0.22, 0.82], speed: [4.6, 7.0], direction: -1, driftY: 7, sparkleChance: 0.09 },
        { density: 0.0015, size: [0.56, 1.24], alpha: [0.28, 0.94], speed: [6.2, 9.2], direction: -1, driftY: 10, sparkleChance: 0.14 }
      ],
      twinkleSeconds: [0.28, 1.8],
      warmChance: 0.76,
      coolChance: 0.12,
      staticChance: 0.08
    },
    halos: {
      // Drifting halos live here:
      // raise count/radius/alpha for more glow, lower driftSeconds for faster motion.
      count: 5,
      radius: [220, 520],
      alpha: [0.05, 0.16],
      driftSeconds: [34, 62],
      driftDistanceX: [28, 98],
      driftDistanceY: [8, 30]
    },
    nebula: {
      // Nebula movement lives here:
      // opacity/bandPuffs/bandGrains/glowBoost control band intensity and presence.
      overscan: 1.28,
      backgroundDust: 26,
      layers: [
        {
          opacity: 0.44,
          bandPuffs: 1680,
          bandGrains: 3120,
          darkCuts: 68,
          brightKnots: 26,
          bandWidth: [0.12, 0.24],
          glowBoost: 1.28,
          driftSecondsX: [32, 48],
          driftSecondsY: [34, 52],
          driftDistanceX: [38, 116],
          driftDistanceY: [8, 18]
        },
        {
          opacity: 0.28,
          bandPuffs: 1020,
          bandGrains: 1880,
          darkCuts: 38,
          brightKnots: 16,
          bandWidth: [0.08, 0.16],
          glowBoost: 1.32,
          driftSecondsX: [24, 34],
          driftSecondsY: [28, 38],
          driftDistanceX: [54, 132],
          driftDistanceY: [10, 24]
        }
      ]
    }
  };

  let dpr = 1;
  let width = 0;
  let height = 0;
  let starLayers = [];
  let haloLayers = [];
  let nebulaLayers = [];
  let screenBandPath = [];
  let textureBandPath = [];
  let laneBlooms = [];
  let resizeFrame = 0;
  let lastFrameTime = 0;

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

  function createBuffer(bufferWidth, bufferHeight) {
    const buffer = document.createElement("canvas");
    buffer.width = bufferWidth;
    buffer.height = bufferHeight;
    return buffer;
  }

  function drawGlow(targetContext, x, y, radius, color, alpha, innerStop, midStop) {
    const gradient = targetContext.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, rgba(color, alpha));
    gradient.addColorStop(innerStop, rgba(color, alpha * 0.82));
    gradient.addColorStop(midStop, rgba(color, alpha * 0.26));
    gradient.addColorStop(1, rgba(color, 0));

    targetContext.fillStyle = gradient;
    targetContext.beginPath();
    targetContext.arc(x, y, radius, 0, Math.PI * 2);
    targetContext.fill();
  }

  function buildBandPath(rng, targetWidth, targetHeight) {
    return [
      { x: 1.14 * targetWidth, y: randomBetween(0.18, 0.28, rng) * targetHeight },
      { x: 0.82 * targetWidth, y: randomBetween(0.1, 0.22, rng) * targetHeight },
      { x: 0.42 * targetWidth, y: randomBetween(0.56, 0.72, rng) * targetHeight },
      { x: -0.18 * targetWidth, y: randomBetween(0.42, 0.6, rng) * targetHeight }
    ];
  }

  function buildStarLayers() {
    const rng = createPrng(0x7f4a7c15 ^ width ^ (height << 4));
    const area = width * height;

    return SETTINGS.stars.layers.map(function (layer) {
      const count = Math.round(area * layer.density);
      const stars = [];

      for (let index = 0; index < count; index += 1) {
        const warm = rng() < SETTINGS.stars.warmChance;
        const cool = !warm && rng() < SETTINGS.stars.coolChance;
        const staticStar = rng() < SETTINGS.stars.staticChance;
        const sparkle = rng() < layer.sparkleChance;
        let color = SETTINGS.colors.gold;

        if (warm) {
          color = rng() < 0.48 ? SETTINGS.colors.amber : SETTINGS.colors.gold;
        } else if (cool) {
          color = SETTINGS.colors.coolBlue;
        }

        stars.push({
          x: rng() * width,
          y: rng() * height,
          radius: randomBetween(layer.size[0], layer.size[1], rng) * (sparkle ? 1.16 : 1),
          alpha: randomBetween(layer.alpha[0], layer.alpha[1], rng),
          color: color,
          sparkle: sparkle,
          velocityX: randomBetween(layer.speed[0], layer.speed[1], rng) * layer.direction,
          velocityY: randomBetween(layer.driftY * 0.42, layer.driftY, rng),
          wobbleY: randomBetween(layer.driftY * 0.18, layer.driftY * 0.46, rng) * (rng() < 0.5 ? -1 : 1),
          pulseMin: staticStar ? 0.88 : randomBetween(0.38, 0.72, rng),
          pulseMax: staticStar ? 1.04 : randomBetween(1.04, 1.8, rng),
          twinkleSpeed: (Math.PI * 2) / randomBetween(SETTINGS.stars.twinkleSeconds[0], SETTINGS.stars.twinkleSeconds[1], rng),
          phaseA: rng() * Math.PI * 2,
          phaseB: rng() * Math.PI * 2,
          phaseC: rng() * Math.PI * 2
        });
      }

      return {
        direction: layer.direction,
        wrapMargin: 40,
        stars: stars
      };
    });
  }

  function buildHaloLayers(path) {
    const rng = createPrng(0x4bb3ac0e ^ width ^ (height << 2));
    const halos = [];

    for (let index = 0; index < SETTINGS.halos.count; index += 1) {
      const t = randomBetween(0.08, 0.94, rng);
      const point = cubicPoint(path, t);
      const tangent = normalize(cubicTangent(path, t));
      const normal = { x: -tangent.y, y: tangent.x };
      const baseOffset = gaussian(rng) * Math.min(width, height) * 0.06;

      halos.push({
        x: point.x + normal.x * baseOffset,
        y: point.y + normal.y * baseOffset,
        radius: randomBetween(SETTINGS.halos.radius[0], SETTINGS.halos.radius[1], rng),
        alpha: randomBetween(SETTINGS.halos.alpha[0], SETTINGS.halos.alpha[1], rng),
        color: rng() < 0.62 ? SETTINGS.colors.amberSoft : SETTINGS.colors.amber,
        accent: rng() < 0.2 ? SETTINGS.colors.coolBlue : SETTINGS.colors.gold,
        driftX: randomBetween(SETTINGS.halos.driftDistanceX[0], SETTINGS.halos.driftDistanceX[1], rng) * (rng() < 0.5 ? -1 : 1),
        driftY: randomBetween(SETTINGS.halos.driftDistanceY[0], SETTINGS.halos.driftDistanceY[1], rng),
        speedX: (Math.PI * 2) / randomBetween(SETTINGS.halos.driftSeconds[0], SETTINGS.halos.driftSeconds[1], rng),
        speedY: (Math.PI * 2) / randomBetween(SETTINGS.halos.driftSeconds[0], SETTINGS.halos.driftSeconds[1], rng),
        phaseX: rng() * Math.PI * 2,
        phaseY: rng() * Math.PI * 2
      });
    }

    return halos;
  }

  function buildLaneBlooms(path) {
    const rng = createPrng(0x3ea94f21 ^ width ^ (height << 3));
    const blooms = [];

    for (let index = 0; index < 10; index += 1) {
      blooms.push({
        t: randomBetween(0.08, 0.92, rng),
        radius: randomBetween(width * 0.08, width * 0.16, rng),
        alpha: randomBetween(0.018, 0.05, rng),
        normalOffset: gaussian(rng) * height * 0.035,
        tangentOffset: gaussian(rng) * width * 0.022,
        phaseX: rng() * Math.PI * 2,
        phaseY: rng() * Math.PI * 2,
        color: rng() < 0.64 ? SETTINGS.colors.amberSoft : SETTINGS.colors.amber
      });
    }

    return blooms;
  }

  function buildNebulaTexture(layer, seed, path) {
    const rng = createPrng(seed);
    const textureWidth = Math.max(1400, Math.round(width * SETTINGS.nebula.overscan));
    const textureHeight = Math.max(900, Math.round(height * SETTINGS.nebula.overscan));
    const buffer = createBuffer(textureWidth, textureHeight);
    const bufferContext = buffer.getContext("2d");
    const minDimension = Math.min(textureWidth, textureHeight);
    const areaFactor = (textureWidth * textureHeight) / 1200000;

    bufferContext.clearRect(0, 0, textureWidth, textureHeight);

    for (let index = 0; index < SETTINGS.nebula.backgroundDust; index += 1) {
      const x = rng() * textureWidth;
      const y = rng() * textureHeight;
      const radius = randomBetween(textureWidth * 0.04, textureWidth * 0.12, rng);
      const gradient = bufferContext.createRadialGradient(x, y, 0, x, y, radius);

      gradient.addColorStop(0, "rgba(18, 11, 10, 0.08)");
      gradient.addColorStop(0.35, "rgba(10, 7, 8, 0.04)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      bufferContext.fillStyle = gradient;
      bufferContext.beginPath();
      bufferContext.arc(x, y, radius, 0, Math.PI * 2);
      bufferContext.fill();
    }

    bufferContext.globalCompositeOperation = "screen";

    for (let index = 0; index < Math.round(layer.bandPuffs * areaFactor); index += 1) {
      const t = Math.pow(rng(), randomBetween(0.7, 1.3, rng));
      const point = cubicPoint(path, t);
      const tangent = normalize(cubicTangent(path, t));
      const normal = { x: -tangent.y, y: tangent.x };
      const bandWidth = randomBetween(layer.bandWidth[0], layer.bandWidth[1], rng) * minDimension;
      const normalOffset = gaussian(rng) * bandWidth;
      const tangentOffset = gaussian(rng) * bandWidth * 0.14;
      const x = point.x + normal.x * normalOffset + tangent.x * tangentOffset;
      const y = point.y + normal.y * normalOffset + tangent.y * tangentOffset;
      const intensity = 1 - clamp(Math.abs(normalOffset) / bandWidth, 0, 1);
      const alpha = lerp(0.012, 0.08, Math.pow(intensity, 1.35)) * layer.glowBoost;
      const radius = randomBetween(bandWidth * 0.14, bandWidth * 0.62, rng);
      const roll = rng();
      let color = SETTINGS.colors.warmDust;

      if (roll > 0.44) {
        color = SETTINGS.colors.amberSoft;
      }

      if (roll > 0.84) {
        color = SETTINGS.colors.amber;
      }

      if (roll > 0.97) {
        color = SETTINGS.colors.gold;
      }

      drawGlow(bufferContext, x, y, radius, color, alpha, 0.04, 0.32);
    }

    for (let index = 0; index < Math.round(layer.brightKnots * areaFactor); index += 1) {
      const t = randomBetween(0.12, 0.92, rng);
      const point = cubicPoint(path, t);
      const burstRadius = randomBetween(minDimension * 0.02, minDimension * 0.05, rng);
      const burstCount = Math.round(randomBetween(7, 14, rng));

      for (let inner = 0; inner < burstCount; inner += 1) {
        const angle = rng() * Math.PI * 2;
        const distance = randomBetween(0, burstRadius * 0.78, rng);
        drawGlow(
          bufferContext,
          point.x + Math.cos(angle) * distance,
          point.y + Math.sin(angle) * distance,
          randomBetween(burstRadius * 0.24, burstRadius * 1.1, rng),
          rng() < 0.58 ? SETTINGS.colors.amber : SETTINGS.colors.gold,
          randomBetween(0.02, 0.08, rng) * layer.glowBoost,
          0.02,
          0.24
        );
      }
    }

    for (let index = 0; index < Math.round(layer.bandGrains * areaFactor); index += 1) {
      const t = rng();
      const point = cubicPoint(path, t);
      const tangent = normalize(cubicTangent(path, t));
      const normal = { x: -tangent.y, y: tangent.x };
      const bandWidth = randomBetween(layer.bandWidth[0], layer.bandWidth[1], rng) * minDimension * 0.64;
      const normalOffset = gaussian(rng) * bandWidth;
      const tangentOffset = gaussian(rng) * bandWidth * 0.2;
      const intensity = 1 - clamp(Math.abs(normalOffset) / bandWidth, 0, 1);
      const x = point.x + normal.x * normalOffset + tangent.x * tangentOffset;
      const y = point.y + normal.y * normalOffset + tangent.y * tangentOffset;

      bufferContext.fillStyle = rgba(
        rng() < 0.74 ? SETTINGS.colors.amber : SETTINGS.colors.gold,
        randomBetween(0.03, 0.16, rng) * intensity
      );
      bufferContext.beginPath();
      bufferContext.arc(x, y, randomBetween(0.28, 1.1, rng), 0, Math.PI * 2);
      bufferContext.fill();
    }

    bufferContext.globalCompositeOperation = "destination-out";

    for (let index = 0; index < Math.round(layer.darkCuts * areaFactor); index += 1) {
      const x = rng() * textureWidth;
      const y = rng() * textureHeight;
      const radius = randomBetween(textureWidth * 0.04, textureWidth * 0.14, rng);
      const cut = bufferContext.createRadialGradient(x, y, 0, x, y, radius);

      cut.addColorStop(0, "rgba(0, 0, 0, 0.12)");
      cut.addColorStop(0.42, "rgba(0, 0, 0, 0.06)");
      cut.addColorStop(1, "rgba(0, 0, 0, 0)");

      bufferContext.fillStyle = cut;
      bufferContext.beginPath();
      bufferContext.arc(x, y, radius, 0, Math.PI * 2);
      bufferContext.fill();
    }

    return buffer;
  }

  function buildNebulaLayers(path) {
    const baseSeed = 0x31415926 ^ width ^ height;

    return SETTINGS.nebula.layers.map(function (layer, index) {
      const rng = createPrng(baseSeed + index * 1337);
      const texture = buildNebulaTexture(layer, baseSeed + index * 9137, path);

      return {
        texture: texture,
        opacity: layer.opacity,
        phaseX: rng() * Math.PI * 2,
        phaseY: rng() * Math.PI * 2,
        speedX: (Math.PI * 2) / randomBetween(layer.driftSecondsX[0], layer.driftSecondsX[1], rng),
        speedY: (Math.PI * 2) / randomBetween(layer.driftSecondsY[0], layer.driftSecondsY[1], rng),
        driftX: -randomBetween(layer.driftDistanceX[0], layer.driftDistanceX[1], rng),
        driftY: randomBetween(layer.driftDistanceY[0], layer.driftDistanceY[1], rng)
      };
    });
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

      const rng = createPrng(0x19c4d2ab ^ width ^ (height << 1));
      screenBandPath = buildBandPath(rng, width, height);
      textureBandPath = buildBandPath(rng, Math.round(width * SETTINGS.nebula.overscan), Math.round(height * SETTINGS.nebula.overscan));
      laneBlooms = buildLaneBlooms(screenBandPath);
      starLayers = buildStarLayers();
      haloLayers = buildHaloLayers(screenBandPath);
      nebulaLayers = buildNebulaLayers(textureBandPath);
    });
  }

  function update(dt, time) {
    starLayers.forEach(function (layer) {
      layer.stars.forEach(function (star) {
        star.x += star.velocityX * dt;
        star.y += star.velocityY * dt + Math.sin(time * 0.7 + star.phaseA) * star.wobbleY * dt * 0.22;

        if (layer.direction > 0 && star.x > width + layer.wrapMargin) {
          star.x = -layer.wrapMargin;
          star.y = Math.random() * height * 0.78;
        } else if (layer.direction < 0 && star.x < -layer.wrapMargin) {
          star.x = width + layer.wrapMargin;
          star.y = Math.random() * height * 0.72 - height * 0.08;
        }

        if (star.y < -28) {
          star.y = -12;
          star.x = Math.random() * width;
        } else if (star.y > height + 28) {
          star.y = -28;
          star.x = width * 0.42 + Math.random() * width * 0.68;
        }
      });
    });
  }

  function drawBase() {
    const base = context.createLinearGradient(0, 0, 0, height);
    base.addColorStop(0, SETTINGS.colors.spaceTop);
    base.addColorStop(1, SETTINGS.colors.spaceBottom);

    context.fillStyle = base;
    context.fillRect(0, 0, width, height);

    const topVoid = context.createRadialGradient(width * 0.22, height * 0.18, 0, width * 0.22, height * 0.18, width * 0.42);
    topVoid.addColorStop(0, "rgba(34, 18, 54, 0.42)");
    topVoid.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = topVoid;
    context.fillRect(0, 0, width, height);

    const bottomVoid = context.createRadialGradient(width * 0.78, height * 0.8, 0, width * 0.78, height * 0.8, width * 0.5);
    bottomVoid.addColorStop(0, "rgba(44, 18, 72, 0.34)");
    bottomVoid.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = bottomVoid;
    context.fillRect(0, 0, width, height);
  }

  function drawHalos(time) {
    // Drifting halos live here.
    context.save();
    context.globalCompositeOperation = "screen";

    haloLayers.forEach(function (halo) {
      const x = halo.x + Math.sin(time * halo.speedX + halo.phaseX) * halo.driftX;
    const y = halo.y + Math.abs(Math.cos(time * halo.speedY + halo.phaseY)) * halo.driftY;
      const pulse = 0.88 + Math.sin(time * 0.42 + halo.phaseX) * 0.16;

      drawGlow(context, x, y, halo.radius, halo.color, halo.alpha * pulse, 0.04, 0.32);
      drawGlow(context, x + halo.radius * 0.08, y - halo.radius * 0.06, halo.radius * 0.52, halo.accent, halo.alpha * 0.22 * pulse, 0.08, 0.22);
    });

    context.restore();
  }

  function drawNebula(time) {
    // Nebula movement lives here.
    context.save();
    context.globalCompositeOperation = "screen";

    nebulaLayers.forEach(function (layer) {
      const offsetX = Math.sin(time * layer.speedX + layer.phaseX) * layer.driftX;
      const offsetY = Math.abs(Math.cos(time * layer.speedY + layer.phaseY)) * layer.driftY;
      const drawX = (width - layer.texture.width) * 0.5 + offsetX;
      const drawY = (height - layer.texture.height) * 0.5 + offsetY;
      const pulse = 0.92 + Math.sin(time * 0.36 + layer.phaseX) * 0.12;

      context.globalAlpha = layer.opacity * pulse;
      context.drawImage(layer.texture, drawX, drawY, layer.texture.width, layer.texture.height);
    });

    context.restore();
    context.globalAlpha = 1;
  }

  function drawLaneGlow(time) {
    context.save();
    context.globalCompositeOperation = "screen";

    const laneDrift = Math.sin(time * 0.24 + 0.4) * 26 + Math.sin(time * 0.08 + 1.2) * 34;
    const laneShiftX = -36 - laneDrift;
    const laneShiftY = 22 + laneDrift * 0.34 + Math.sin(time * 0.18 + 0.7) * 6;
    const laneWidth = Math.min(width, height);

    context.beginPath();
    context.moveTo(screenBandPath[0].x + laneShiftX, screenBandPath[0].y + laneShiftY);
    context.bezierCurveTo(
      screenBandPath[1].x + laneShiftX,
      screenBandPath[1].y + laneShiftY,
      screenBandPath[2].x + laneShiftX,
      screenBandPath[2].y + laneShiftY,
      screenBandPath[3].x + laneShiftX,
      screenBandPath[3].y + laneShiftY
    );
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = laneWidth * 0.16;
    context.strokeStyle = rgba(SETTINGS.colors.warmDust, 0.032);
    context.shadowBlur = 96;
    context.shadowColor = rgba(SETTINGS.colors.amber, 0.24);
    context.stroke();

    context.beginPath();
    context.moveTo(screenBandPath[0].x + laneShiftX, screenBandPath[0].y + laneShiftY);
    context.bezierCurveTo(
      screenBandPath[1].x + laneShiftX,
      screenBandPath[1].y + laneShiftY,
      screenBandPath[2].x + laneShiftX,
      screenBandPath[2].y + laneShiftY,
      screenBandPath[3].x + laneShiftX,
      screenBandPath[3].y + laneShiftY
    );
    context.lineWidth = laneWidth * 0.068;
    context.strokeStyle = rgba(SETTINGS.colors.amberSoft, 0.028);
    context.shadowBlur = 48;
    context.shadowColor = rgba(SETTINGS.colors.gold, 0.16);
    context.stroke();
    context.shadowBlur = 0;

    laneBlooms.forEach(function (bloom) {
      const point = cubicPoint(screenBandPath, bloom.t);
      const tangent = normalize(cubicTangent(screenBandPath, bloom.t));
      const normal = { x: -tangent.y, y: tangent.x };
      const x =
        point.x +
        normal.x * bloom.normalOffset +
        tangent.x * bloom.tangentOffset +
        Math.sin(time * 0.42 + bloom.phaseX) * 18;
      const y =
        point.y +
        normal.y * bloom.normalOffset +
        tangent.y * bloom.tangentOffset +
        Math.cos(time * 0.38 + bloom.phaseY) * 10;
      const pulse = 0.88 + Math.sin(time * 0.46 + bloom.phaseX) * 0.14;

      drawGlow(context, x, y, bloom.radius, bloom.color, bloom.alpha * pulse, 0.05, 0.3);
    });

    context.restore();
  }

  function drawStars(time) {
    // Random twinkling stars live here.
    context.save();
    context.globalCompositeOperation = "lighter";

    starLayers.forEach(function (layer) {
      layer.stars.forEach(function (star) {
        const waveA = Math.sin(time * star.twinkleSpeed + star.phaseA);
        const waveB = Math.sin(time * star.twinkleSpeed * 0.63 + star.phaseB);
        const waveC = Math.sin(time * star.twinkleSpeed * 1.38 + star.phaseC);
        const blend = clamp(0.5 + 0.5 * (waveA * 0.48 + waveB * 0.22 + waveC * 0.3), 0, 1);
        const alpha = clamp(star.alpha * lerp(star.pulseMin, star.pulseMax, blend), 0, 1);

        if (star.sparkle) {
          const glow = context.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.radius * 2.6);
          glow.addColorStop(0, rgba(star.color, alpha));
          glow.addColorStop(0.16, rgba(star.color, alpha * 0.32));
          glow.addColorStop(0.28, rgba(star.color, alpha * 0.1));
          glow.addColorStop(1, rgba(star.color, 0));

          context.fillStyle = glow;
          context.beginPath();
          context.arc(star.x, star.y, star.radius * 2.6, 0, Math.PI * 2);
          context.fill();

          context.fillStyle = rgba(star.color, alpha);
          context.fillRect(star.x - star.radius * 1.5, star.y - 0.35, star.radius * 3, 0.7);
          context.fillRect(star.x - 0.35, star.y - star.radius * 1.5, 0.7, star.radius * 3);
        }

        context.fillStyle = rgba(star.color, alpha);

        if (star.radius < 0.72) {
          context.fillRect(star.x, star.y, 1, 1);
        } else {
          context.beginPath();
          context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          context.fill();
        }
      });
    });

    context.restore();
  }

  function drawVignette() {
    const vignette = context.createRadialGradient(width * 0.5, height * 0.5, width * 0.12, width * 0.5, height * 0.5, width * 0.82);
    vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
    vignette.addColorStop(1, "rgba(0, 0, 0, 0.64)");

    context.fillStyle = vignette;
    context.fillRect(0, 0, width, height);
  }

  function render(timestamp) {
    const time = timestamp * 0.001;
    const dt = lastFrameTime ? Math.min(0.032, (timestamp - lastFrameTime) / 1000) : 1 / 120;
    lastFrameTime = timestamp;

    update(dt, time);

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawBase();
    drawHalos(time);
    drawNebula(time);
    drawLaneGlow(time);
    drawStars(time);
    drawVignette();

    requestAnimationFrame(render);
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });
  requestAnimationFrame(render);
})();
