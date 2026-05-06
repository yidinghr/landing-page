(function () {
  const markWrap = document.querySelector(".login-system__mark-wrap");
  const mark = document.querySelector(".login-visual__mark");

  if (!markWrap) {
    return;
  }

  markWrap.style.transform = "translate(-50%, -50%)";

  if (mark) {
    mark.style.filter = [
      "brightness(0.99)",
      "saturate(0.96)",
      "contrast(0.99)",
      "drop-shadow(0 18px 44px rgba(96, 48, 154, 0.14))"
    ].join(" ");
  }
})();
