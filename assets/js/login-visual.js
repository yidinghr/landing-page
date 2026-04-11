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
    const orbitTime = time * 0.22;

    const orbitX =
      42 +
      Math.cos(orbitTime) * 96 +
      Math.sin(orbitTime * 1.86 + 0.5) * 24 +
      Math.sin(orbitTime * 0.58 - 1.4) * 16;
    const orbitY =
      Math.sin(orbitTime * 1.12 - 0.42) * 82 +
      Math.cos(orbitTime * 2.16 + 0.12) * 18;
    const orbitZ =
      Math.sin(orbitTime - 0.72) * 224 +
      Math.cos(orbitTime * 1.46 + 0.5) * 42;

    const depthMix = clamp((orbitZ + 280) / 560, 0, 1);
    const orbitScale = 0.86 + depthMix * 0.26;
    const orbitRotateX = -5 + Math.cos(orbitTime * 1.32) * 6.2 + Math.sin(orbitTime * 3.1) * 1.6;
    const orbitRotateY = -18 + Math.sin(orbitTime * 1.04 + 0.4) * 22 + orbitZ * 0.038;
    const orbitRotateZ = -6 + Math.sin(orbitTime * 1.72 - 0.2) * 9.2;

    const bodyWave = Math.sin(time * 5.6) * 4.2 + Math.sin(time * 2.8 + 0.6) * 2.1;
    const headNod = Math.sin(time * 4.8 + 0.3) * 7.4;
    const headYaw = Math.cos(time * 3.6 - 0.4) * 6.2;
    const headRoll = Math.sin(time * 5.4 + 1.1) * 3.4;
    const tailWave = Math.sin(time * 4.4 - 0.8) * 8.2 + Math.cos(time * 7.6 + 0.4) * 3.2;
    const rearLegA = Math.sin(time * 6.2) * 14;
    const rearLegB = Math.sin(time * 6.2 + Math.PI) * 14;
    const localLift = Math.sin(time * 3.7 + 0.2) * 11;
    const localZ = 46 + Math.sin(time * 2.2 - 0.5) * 18 + depthMix * 16;
    const localScale = 0.96 + Math.sin(time * 4.2) * 0.018 + depthMix * 0.028;
    const localRotateX = 2 + Math.cos(time * 3.7) * 3 + rearLegA * 0.08;
    const localRotateY = -10 + Math.sin(time * 4.2 + 0.2) * 6.4 + orbitZ * 0.01;
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
      const x = Math.cos(angle) * radiusX;
      const y = Math.sin(angle) * radiusY;
      const z = Math.sin(angle * 1.26 + phase) * depth;
      const zMix = clamp((z + depth) / (depth * 2), 0, 1);
      const scale = 0.76 + zMix * 0.34;
      const rotation = angle * 58;
      const layer = Math.round(2 + zMix * 4 + index * 0.1);
      const brightness = 0.9 + zMix * 0.26;

      planetOrbit.style.transform = "translate3d(" + x.toFixed(2) + "px, " + y.toFixed(2) + "px, " + z.toFixed(2) + "px)";
      planetOrbit.style.zIndex = String(layer);

      const planet = planetOrbit.firstElementChild;
      if (planet) {
        setStyle(planet, "--planet-scale", scale.toFixed(3));
        setStyle(planet, "--planet-rotation", rotation.toFixed(2) + "deg");
        planet.style.filter = "brightness(" + brightness.toFixed(3) + ") saturate(" + (0.9 + zMix * 0.22).toFixed(3) + ")";
      }
    });

    const logoFloatY = Math.sin(time * 1.2) * 4;
    markWrap.style.transform = "translate(-50%, calc(-50% + " + logoFloatY.toFixed(2) + "px))";

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
})();
