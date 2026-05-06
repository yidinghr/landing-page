import "../../shared/services/auth-store.js";
import { init } from "../../features/training/training-controller.js";

function initLobbyIntro() {
  const intro = document.getElementById("tr-lobby-intro");
  const playButton = document.getElementById("trLobbyPlayBtn");
  const hallButton = document.getElementById("trLobbyHallBtn");
  const lobbyVideo = intro ? intro.querySelector("video") : null;

  if (!intro || !playButton) return;

  document.body.classList.add("tr-lobby-is-open");
  if (lobbyVideo && typeof lobbyVideo.play === "function") {
    const startAtTableAction = function () {
      if (lobbyVideo.duration > 6) {
        lobbyVideo.currentTime = 5;
      }
    };
    if (lobbyVideo.readyState >= 1) {
      startAtTableAction();
    } else {
      lobbyVideo.addEventListener("loadedmetadata", startAtTableAction, { once: true });
    }
    lobbyVideo.play().catch(function () {});
  }

  playButton.addEventListener("click", function () {
    intro.classList.add("is-leaving");
    document.body.classList.remove("tr-lobby-is-open");
    window.setTimeout(function () {
      if (lobbyVideo && typeof lobbyVideo.pause === "function") {
        lobbyVideo.pause();
      }
      intro.hidden = true;
    }, 480);
  });

  if (hallButton) {
    hallButton.addEventListener("click", function () {
      window.location.href = "../home.html";
    });
  }
}

const _auth = window.YiDingAuthStore;
if (_auth && !_auth.getSession()) {
  window.location.replace("../../index.html");
} else {
  init();
  initLobbyIntro();
}
