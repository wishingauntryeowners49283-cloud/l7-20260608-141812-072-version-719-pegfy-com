import { H as Hls } from "./hls-vendor.js";

export function setupPlayer(source) {
  var shell = document.querySelector("[data-player]");
  if (!shell) {
    return;
  }

  var video = shell.querySelector("video");
  var cover = shell.querySelector(".player-cover");
  var started = false;
  var hls = null;

  function attach() {
    if (started || !video) {
      return;
    }
    started = true;

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    }
  }

  function begin() {
    attach();
    if (cover) {
      cover.classList.add("is-hidden");
    }
    video.controls = true;
    var play = video.play();
    if (play && typeof play.catch === "function") {
      play.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener("click", begin);
  }

  if (video) {
    video.addEventListener("click", function () {
      if (video.paused) {
        begin();
      }
    });
  }

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
