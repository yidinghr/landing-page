(function () {
  const planetOrbits = Array.from(document.querySelectorAll(".login-system__planet-orbit"));
  const markWrap = document.querySelector(".login-system__mark-wrap");
  const mark = document.querySelector(".login-visual__mark");

  if (!markWrap) {
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
    const orbitDiagonal = -0.56;
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
      const z = -Math.cos(angle) * depth;
      const zMix = clamp((z + depth) / (depth * 2), 0, 1);
      const frontFactor = Math.pow(zMix, 4.2);
      const scale = 0.06 + frontFactor * 1;
      const rotation = angle * 10 + zMix * 6;
      const layer = Math.round(2 + frontFactor * 6 + index * 0.1);
      const brightness = 0.8 + frontFactor * 0.2;
      const opacity = 0.66 + frontFactor * 0.34;

      planetOrbit.style.transform = "translate3d(" + x.toFixed(2) + "px, " + y.toFixed(2) + "px, " + z.toFixed(2) + "px)";
      planetOrbit.style.zIndex = String(layer);

      const planet = planetOrbit.firstElementChild;
      if (planet) {
        setStyle(planet, "--planet-scale", scale.toFixed(3));
        setStyle(planet, "--planet-rotation", rotation.toFixed(2) + "deg");
        planet.style.filter = "brightness(" + brightness.toFixed(3) + ") saturate(" + (1.04 + frontFactor * 0.12).toFixed(3) + ") drop-shadow(0 0 " + (2 + frontFactor * 4).toFixed(2) + "px rgba(255, 225, 160, " + (0.03 + frontFactor * 0.04).toFixed(3) + "))";
        planet.style.opacity = opacity.toFixed(3);
      }
    });

    const logoFloatX = Math.sin(time * 0.28) * 4.6;
    const logoFloatY = Math.sin(time * 0.52) * 6.2 + 1.6;
    const logoFloatScale = 1.012 + Math.cos(time * 0.34) * 0.009;
    const logoTilt = Math.sin(time * 0.24) * 1.2;
    markWrap.style.transform = "translate(calc(-50% + " + logoFloatX.toFixed(2) + "px), calc(-50% + " + logoFloatY.toFixed(2) + "px)) scale(" + logoFloatScale.toFixed(4) + ") rotateZ(" + logoTilt.toFixed(2) + "deg)";

    if (mark) {
      const pulse = 0.94 + Math.sin(time * 0.42) * 0.03;
      mark.style.filter = "brightness(" + pulse.toFixed(3) + ") saturate(0.94) contrast(0.96)";
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
})();
