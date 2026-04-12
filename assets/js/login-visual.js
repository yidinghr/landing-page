(function () {
  const markWrap = document.querySelector(".login-system__mark-wrap");
  const mark = document.querySelector(".login-visual__mark");

  if (!markWrap) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (prefersReducedMotion.matches) {
    return;
  }

  function animate(timestamp) {
    const time = timestamp * 0.001;
    const logoFloatX = Math.sin(time * 0.18) * 4.6 + Math.cos(time * 0.08) * 1.2;
    const logoFloatY = Math.sin(time * 0.34) * 5.4 + Math.cos(time * 0.16) * 1.6;
    const logoFloatScale = 1.002 + Math.cos(time * 0.22) * 0.008;
    const logoTilt = Math.sin(time * 0.14) * 0.46;
    markWrap.style.transform = "translate(calc(-50% + " + logoFloatX.toFixed(2) + "px), calc(-50% + " + logoFloatY.toFixed(2) + "px)) scale(" + logoFloatScale.toFixed(4) + ") rotateZ(" + logoTilt.toFixed(2) + "deg)";

    if (mark) {
      const pulse = 0.84 + Math.sin(time * 0.22) * 0.018;
      mark.style.filter = "brightness(" + pulse.toFixed(3) + ") saturate(0.88) contrast(0.94) drop-shadow(0 18px 44px rgba(71, 30, 118, 0.12))";
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
})();
