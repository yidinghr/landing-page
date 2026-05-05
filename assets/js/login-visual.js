(function () {
  const markWrap = document.querySelector(".login-system__mark-wrap");
  const mark = document.querySelector(".login-visual__mark");

  if (markWrap) {
    markWrap.style.transform = "translate(-50%, -50%)";
  }

  if (mark) {
    mark.style.filter = [
      "brightness(0.99)",
      "saturate(0.96)",
      "contrast(0.99)",
      "drop-shadow(0 18px 44px rgba(96, 48, 154, 0.14))"
    ].join(" ");
  }

  const orbits = document.querySelectorAll(".login-system__planet-orbit");
  if (orbits.length > 0) {
    // Media queries alter sizes, but for simplicity we use base CSS sizes and scale them based on window width if needed.
    // Or we can just calculate them dynamically by reading the track's offsetWidth!
    const tracks = document.querySelectorAll(".login-system__orbit-track");
    
    const orbitData = Array.from(orbits).map((el, i) => {
      // Find the corresponding track to get its actual radius in px
      const track = tracks[i];
      let radius = 200; // fallback
      if (track) {
        radius = track.offsetWidth / 2;
      }
      return {
        element: el,
        planet: el.firstElementChild,
        track: track,
        radius: radius,
        speed: 0.0003 + (Math.random() * 0.0004),
        angle: Math.random() * Math.PI * 2
      };
    });

    let lastTime = 0;
    function animatePlanets(time) {
      if (!lastTime) lastTime = time;
      const dt = time - lastTime;
      lastTime = time;

      orbitData.forEach((data) => {
        // Update radius dynamically in case window resized
        if (data.track && data.track.offsetWidth > 0) {
          data.radius = data.track.offsetWidth / 2;
        }

        data.angle -= data.speed * dt;
        
        const rX = Math.cos(data.angle) * data.radius;
        const rY = Math.sin(data.angle) * data.radius;

        // Apply 3D transform matching the track
        data.element.style.transform = 
          `translate(-50%, -50%) rotateZ(-26deg) rotateX(81deg) translate(${rX}px, ${rY}px)`;
          
        // Counter-rotate the planet so it faces the camera
        // Parent rotation: Z(-26deg), X(81deg).
        // To undo: X(-81deg), Z(26deg)
        if (data.planet) {
           data.planet.style.transform = `rotateX(-81deg) rotateZ(26deg)`;
        }
      });
      
      requestAnimationFrame(animatePlanets);
    }
    
    requestAnimationFrame(animatePlanets);
  }
})();
