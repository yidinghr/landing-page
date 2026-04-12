(function () {
  const planetOrbits = Array.from(document.querySelectorAll(".login-system__planet-orbit"));
  const markWrap = document.querySelector(".login-system__mark-wrap");

  if (planetOrbits.length === 0 || !markWrap) {
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
    const orbitDiagonal = -0.42;
    const axisX = Math.cos(orbitDiagonal);
    const axisY = Math.sin(orbitDiagonal);
    const minorAxisX = -Math.sin(orbitDiagonal);
    const minorAxisY = Math.cos(orbitDiagonal);

    planetOrbits.forEach(function (planetOrbit, index) {
      const radiusX = parseFloat(planetOrbit.dataset.radiusX || "180");
      const radiusY = parseFloat(planetOrbit.dataset.radiusY || "120");
      const speed = parseFloat(planetOrbit.dataset.speed || "0.4");
      const phase = parseFloat(planetOrbit.dataset.phase || "0");
      const depth = parseFloat(planetOrbit.dataset.depth || "60");
      const angle = time * speed + phase;
      const major = Math.cos(angle) * radiusX;
      const minor = Math.sin(angle) * radiusY;
      const x = axisX * major + minorAxisX * minor;
      const y = axisY * major + minorAxisY * minor;
      const z = Math.sin(angle) * depth;
      const zMix = clamp((z + depth) / (depth * 2), 0, 1);
      const scale = 0.16 + zMix * 0.94;
      const rotation = angle * 28 + zMix * 12;
      const layer = Math.round(2 + zMix * 6 + index * 0.1);
      const brightness = 0.68 + zMix * 0.48;
      const opacity = 0.26 + zMix * 0.74;

      planetOrbit.style.transform = "translate3d(" + x.toFixed(2) + "px, " + y.toFixed(2) + "px, " + z.toFixed(2) + "px)";
      planetOrbit.style.zIndex = String(layer);

      const planet = planetOrbit.firstElementChild;
      if (planet) {
        setStyle(planet, "--planet-scale", scale.toFixed(3));
        setStyle(planet, "--planet-rotation", rotation.toFixed(2) + "deg");
        planet.style.filter = "brightness(" + brightness.toFixed(3) + ") saturate(" + (1.04 + zMix * 0.26).toFixed(3) + ") drop-shadow(0 0 " + (8 + zMix * 14).toFixed(2) + "px rgba(255, 225, 160, " + (0.08 + zMix * 0.16).toFixed(3) + "))";
        planet.style.opacity = opacity.toFixed(3);
      }
    });

    const logoFloatY = Math.sin(time * 0.96) * 2.8 + 2.4;
    const logoFloatScale = 1.004 + Math.cos(time * 0.54) * 0.01;
    markWrap.style.transform = "translate(-50%, calc(-50% + " + logoFloatY.toFixed(2) + "px)) scale(" + logoFloatScale.toFixed(4) + ")";

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
})();
