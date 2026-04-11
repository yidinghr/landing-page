(function () {
  const orbit = document.querySelector(".login-visual__dragon-orbit");
  const dragon = document.querySelector(".login-visual__dragon");

  if (!orbit || !dragon) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (prefersReducedMotion.matches) {
    return;
  }

  function setOrbitVariable(name, value) {
    orbit.style.setProperty(name, value);
  }

  function setDragonVariable(name, value) {
    dragon.style.setProperty(name, value);
  }

  function animate(timestamp) {
    const time = timestamp * 0.001;
    const orbitTime = time * 0.34;

    const orbitX =
      Math.cos(orbitTime) * 136 +
      Math.sin(orbitTime * 1.82 + 0.6) * 28 +
      Math.sin(orbitTime * 0.54 - 1.2) * 18;
    const orbitY =
      Math.sin(orbitTime * 1.12 - 0.4) * 104 +
      Math.cos(orbitTime * 2.24 + 0.2) * 24;
    const orbitZ =
      Math.sin(orbitTime - 0.72) * 248 +
      Math.cos(orbitTime * 1.42 + 0.5) * 54;

    const depthMix = (orbitZ + 302) / 604;
    const orbitScale = 0.82 + depthMix * 0.32;
    const orbitRotateX = -4 + Math.cos(orbitTime * 1.42) * 8 + Math.sin(orbitTime * 3.6) * 2.2;
    const orbitRotateY = -16 + Math.sin(orbitTime * 1.06 + 0.5) * 26 + orbitZ * 0.05;
    const orbitRotateZ = -8 + Math.sin(orbitTime * 1.9 - 0.4) * 11;

    const bodyWave = Math.sin(time * 7.4) * 4.8 + Math.sin(time * 3.6 + 0.7) * 2.2;
    const beardSwing = Math.sin(time * 8.6 + 1.1) * 2.4;
    const clawBeat = Math.sin(time * 6.4 - 0.8) * 3.4;
    const tailFlex = Math.cos(time * 5.6 - 0.3) * 2.6;
    const localLift = Math.sin(time * 4.9 + 0.2) * 11;
    const localZ = 44 + Math.sin(time * 2.7 - 0.5) * 22 + depthMix * 20;
    const localScale = 0.94 + Math.sin(time * 6.1) * 0.018 + depthMix * 0.035;
    const localRotateX = 2 + Math.cos(time * 4.2) * 3.6 + clawBeat * 0.22;
    const localRotateY = -12 + Math.sin(time * 5.2 + 0.2) * 7.4 + orbitZ * 0.012;
    const localRotateZ = 3 + bodyWave * 0.58;
    const skewX = bodyWave * 0.42;
    const skewY = beardSwing * 0.34;
    const glowMix = 0.14 + depthMix * 0.12;
    const shadowAlpha = 0.1 + (1 - depthMix) * 0.22;
    const shadowScale = 0.82 + (1 - depthMix) * 0.34;
    const shadowOffsetX = orbitX * 0.18;
    const shadowOffsetY = 6 + (1 - depthMix) * 16;
    const shadowBlur = 40 + (1 - depthMix) * 26;
    const shadowDropY = 18 + (1 - depthMix) * 26;
    const shadowDropBlur = 48 + (1 - depthMix) * 34;

    setOrbitVariable("--dragon-orbit-x", orbitX.toFixed(2) + "px");
    setOrbitVariable("--dragon-orbit-y", orbitY.toFixed(2) + "px");
    setOrbitVariable("--dragon-orbit-z", orbitZ.toFixed(2) + "px");
    setOrbitVariable("--dragon-orbit-rx", orbitRotateX.toFixed(2) + "deg");
    setOrbitVariable("--dragon-orbit-ry", orbitRotateY.toFixed(2) + "deg");
    setOrbitVariable("--dragon-orbit-rz", orbitRotateZ.toFixed(2) + "deg");
    setOrbitVariable("--dragon-orbit-scale", orbitScale.toFixed(3));
    setOrbitVariable("--dragon-shadow-alpha", shadowAlpha.toFixed(3));
    setOrbitVariable("--dragon-shadow-scale", shadowScale.toFixed(3));
    setOrbitVariable("--dragon-shadow-x", shadowOffsetX.toFixed(2) + "px");
    setOrbitVariable("--dragon-shadow-y", shadowOffsetY.toFixed(2) + "px");
    setOrbitVariable("--dragon-layer", orbitZ > -20 ? "4" : "2");

    setDragonVariable("--dragon-local-y", localLift.toFixed(2) + "px");
    setDragonVariable("--dragon-local-z", localZ.toFixed(2) + "px");
    setDragonVariable("--dragon-local-rx", localRotateX.toFixed(2) + "deg");
    setDragonVariable("--dragon-local-ry", localRotateY.toFixed(2) + "deg");
    setDragonVariable("--dragon-local-rz", localRotateZ.toFixed(2) + "deg");
    setDragonVariable("--dragon-local-scale", localScale.toFixed(3));
    setDragonVariable("--dragon-skew-x", skewX.toFixed(2) + "deg");
    setDragonVariable("--dragon-skew-y", skewY.toFixed(2) + "deg");
    setDragonVariable("--dragon-glow-alpha", glowMix.toFixed(3));
    setDragonVariable("--dragon-shadow-drop-y", shadowDropY.toFixed(2) + "px");
    setDragonVariable("--dragon-shadow-drop-blur", shadowDropBlur.toFixed(2) + "px");
    setDragonVariable("--dragon-shadow-spread", shadowBlur.toFixed(2) + "px");
    setDragonVariable("--dragon-tail-flex", tailFlex.toFixed(2) + "deg");
    setDragonVariable("--dragon-claw-lift", clawBeat.toFixed(2) + "deg");

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
})();
