(function () {
  const orbit = document.querySelector(".login-visual__dragon-orbit");
  const dragonRig = document.querySelector(".login-visual__dragon-rig");
  const planetOrbits = Array.from(document.querySelectorAll(".login-system__planet-orbit"));
  const markWrap = document.querySelector(".login-system__mark-wrap");

  if (!orbit || !dragonRig || planetOrbits.length === 0 || !markWrap) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (prefersReducedMotion.matches) {
    return;
  }

  function setStyle(target, name, value) {
    target.style.setProperty(name, value);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function animate(timestamp) {
    const time = timestamp * 0.001;
    const orbitTime = time * 0.24;
    const orbitDiagonal = -0.46;
    const cosOrbitDiagonal = Math.cos(orbitDiagonal);
    const sinOrbitDiagonal = Math.sin(orbitDiagonal);

    const orbitX =
      -58 +
      Math.cos(orbitTime) * 118 +
      Math.sin(orbitTime * 1.92 + 0.5) * 34 +
      Math.sin(orbitTime * 0.62 - 1.4) * 18;
    const orbitY =
      28 +
      Math.sin(orbitTime * 1.08 - 0.42) * 94 +
      Math.cos(orbitTime * 2.18 + 0.12) * 22;
    const orbitZ =
      Math.sin(orbitTime - 0.72) * 236 +
      Math.cos(orbitTime * 1.48 + 0.5) * 54;

    const depthMix = clamp((orbitZ + 280) / 560, 0, 1);
    const orbitScale = 0.84 + depthMix * 0.3;
    const orbitRotateX = -6 + Math.cos(orbitTime * 1.38) * 7.4 + Math.sin(orbitTime * 3.2) * 2.2;
    const orbitRotateY = -18 + Math.sin(orbitTime * 1.06 + 0.4) * 24 + orbitZ * 0.041;
    const orbitRotateZ = -8 + Math.sin(orbitTime * 1.84 - 0.2) * 11.8;

    const bodyWave = Math.sin(time * 5.9) * 6.6 + Math.sin(time * 3.1 + 0.6) * 2.8;
    const headNod = Math.sin(time * 5.2 + 0.3) * 9.2;
    const headYaw = Math.cos(time * 3.9 - 0.4) * 8.4;
    const headRoll = Math.sin(time * 5.8 + 1.1) * 4.8;
    const tailWave = Math.sin(time * 4.8 - 0.8) * 12.4 + Math.cos(time * 8.2 + 0.4) * 4.4;
    const rearLegA = Math.sin(time * 6.6) * 17;
    const rearLegB = Math.sin(time * 6.6 + Math.PI) * 17;
    const localLift = Math.sin(time * 4 + 0.2) * 14;
    const localZ = 52 + Math.sin(time * 2.4 - 0.5) * 22 + depthMix * 18;
    const localScale = 0.95 + Math.sin(time * 4.6) * 0.026 + depthMix * 0.036;
    const localRotateX = 1.5 + Math.cos(time * 3.9) * 4.4 + rearLegA * 0.09;
    const localRotateY = -10 + Math.sin(time * 4.5 + 0.2) * 7.8 + orbitZ * 0.012;
    const localRotateZ = 1.8 + bodyWave * 0.48;
    const skewX = bodyWave * 0.3;
    const skewY = tailWave * 0.06;
    const eyeOpen = Math.max(0.18, Math.abs(Math.sin(time * 0.86 + 0.5)) > 0.96 ? 0.18 : 1);
    const breathOpen = clamp((Math.sin(time * 3.2 - 0.2) + 1) / 2, 0, 1);
    const glowMix = 0.14 + depthMix * 0.16;
    const shadowAlpha = 0.1 + (1 - depthMix) * 0.18;
    const shadowScale = 0.86 + (1 - depthMix) * 0.28;
    const shadowOffsetX = orbitX * 0.14;
    const shadowOffsetY = 8 + (1 - depthMix) * 14;
    const shadowBlur = 34 + (1 - depthMix) * 28;
    const shadowDropY = 20 + (1 - depthMix) * 20;
    const shadowDropBlur = 40 + (1 - depthMix) * 28;

    setStyle(orbit, "--dragon-orbit-x", orbitX.toFixed(2) + "px");
    setStyle(orbit, "--dragon-orbit-y", orbitY.toFixed(2) + "px");
    setStyle(orbit, "--dragon-orbit-z", orbitZ.toFixed(2) + "px");
    setStyle(orbit, "--dragon-orbit-rx", orbitRotateX.toFixed(2) + "deg");
    setStyle(orbit, "--dragon-orbit-ry", orbitRotateY.toFixed(2) + "deg");
    setStyle(orbit, "--dragon-orbit-rz", orbitRotateZ.toFixed(2) + "deg");
    setStyle(orbit, "--dragon-orbit-scale", orbitScale.toFixed(3));
    setStyle(orbit, "--dragon-shadow-alpha", shadowAlpha.toFixed(3));
    setStyle(orbit, "--dragon-shadow-scale", shadowScale.toFixed(3));
    setStyle(orbit, "--dragon-shadow-x", shadowOffsetX.toFixed(2) + "px");
    setStyle(orbit, "--dragon-shadow-y", shadowOffsetY.toFixed(2) + "px");
    setStyle(orbit, "--dragon-layer", orbitZ > -10 ? "4" : "2");

    setStyle(dragonRig, "--dragon-local-y", localLift.toFixed(2) + "px");
    setStyle(dragonRig, "--dragon-local-z", localZ.toFixed(2) + "px");
    setStyle(dragonRig, "--dragon-local-rx", localRotateX.toFixed(2) + "deg");
    setStyle(dragonRig, "--dragon-local-ry", localRotateY.toFixed(2) + "deg");
    setStyle(dragonRig, "--dragon-local-rz", localRotateZ.toFixed(2) + "deg");
    setStyle(dragonRig, "--dragon-local-scale", localScale.toFixed(3));
    setStyle(dragonRig, "--dragon-skew-x", skewX.toFixed(2) + "deg");
    setStyle(dragonRig, "--dragon-skew-y", skewY.toFixed(2) + "deg");
    setStyle(dragonRig, "--dragon-glow-alpha", glowMix.toFixed(3));
    setStyle(dragonRig, "--dragon-shadow-drop-y", shadowDropY.toFixed(2) + "px");
    setStyle(dragonRig, "--dragon-shadow-drop-blur", shadowDropBlur.toFixed(2) + "px");
    setStyle(dragonRig, "--dragon-shadow-spread", shadowBlur.toFixed(2) + "px");
    setStyle(dragonRig, "--dragon-tail-flex", tailWave.toFixed(2) + "deg");
    setStyle(dragonRig, "--dragon-body-wave", bodyWave.toFixed(2) + "deg");
    setStyle(dragonRig, "--dragon-head-nod", headNod.toFixed(2) + "deg");
    setStyle(dragonRig, "--dragon-head-yaw", headYaw.toFixed(2) + "deg");
    setStyle(dragonRig, "--dragon-head-roll", headRoll.toFixed(2) + "deg");
    setStyle(dragonRig, "--dragon-rear-leg-a", rearLegA.toFixed(2) + "deg");
    setStyle(dragonRig, "--dragon-rear-leg-b", rearLegB.toFixed(2) + "deg");
    setStyle(dragonRig, "--dragon-eye-open", eyeOpen.toFixed(3));
    setStyle(dragonRig, "--dragon-breath-open", breathOpen.toFixed(3));

    planetOrbits.forEach(function (planetOrbit, index) {
      const radiusX = parseFloat(planetOrbit.dataset.radiusX || "180");
      const radiusY = parseFloat(planetOrbit.dataset.radiusY || "120");
      const speed = parseFloat(planetOrbit.dataset.speed || "0.4");
      const phase = parseFloat(planetOrbit.dataset.phase || "0");
      const depth = parseFloat(planetOrbit.dataset.depth || "60");
      const angle = time * speed + phase;
      const baseX = Math.cos(angle) * radiusX;
      const baseY = Math.sin(angle) * radiusY;
      const x = baseX * cosOrbitDiagonal - baseY * sinOrbitDiagonal;
      const diagonalY = baseX * sinOrbitDiagonal + baseY * cosOrbitDiagonal;
      const z = Math.sin(angle + Math.PI / 2) * depth;
      const y = diagonalY + z * 0.09;
      const zMix = clamp((z + depth) / (depth * 2), 0, 1);
      const scale = 0.54 + zMix * 0.98;
      const rotation = angle * 48 + zMix * 18;
      const layer = Math.round(2 + zMix * 4 + index * 0.1);
      const brightness = 0.82 + zMix * 0.5;
      const opacity = 0.34 + zMix * 0.66;

      planetOrbit.style.transform = "translate3d(" + x.toFixed(2) + "px, " + y.toFixed(2) + "px, " + z.toFixed(2) + "px)";
      planetOrbit.style.zIndex = String(layer);

      const planet = planetOrbit.firstElementChild;
      if (planet) {
        setStyle(planet, "--planet-scale", scale.toFixed(3));
        setStyle(planet, "--planet-rotation", rotation.toFixed(2) + "deg");
        planet.style.filter = "brightness(" + brightness.toFixed(3) + ") saturate(" + (1.02 + zMix * 0.28).toFixed(3) + ") drop-shadow(0 0 " + (10 + zMix * 12).toFixed(2) + "px rgba(255, 225, 160, " + (0.1 + zMix * 0.14).toFixed(3) + "))";
        planet.style.opacity = opacity.toFixed(3);
      }
    });

    const logoFloatY = Math.sin(time * 1.08) * 5 + 6;
    markWrap.style.transform = "translate(-50%, calc(-50% + " + logoFloatY.toFixed(2) + "px))";

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
})();
