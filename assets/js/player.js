(function () {
  var hlsLoader = null;
  var scriptElement = document.currentScript;
  var localHlsUrl = scriptElement && scriptElement.src
    ? scriptElement.src.replace(/player\.js(?:\?.*)?$/, "hls-local.js")
    : "hls-local.js";

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsLoader) {
      return hlsLoader;
    }

    hlsLoader = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = localHlsUrl;
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return hlsLoader;
  }

  function showError(errorBox) {
    if (errorBox) {
      errorBox.hidden = false;
    }
  }

  function attachSource(video, source, errorBox) {
    if (video.getAttribute("data-ready") === "yes") {
      return Promise.resolve();
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.setAttribute("data-ready", "yes");
      return Promise.resolve();
    }

    return loadHls().then(function (Hls) {
      if (!Hls || !Hls.isSupported()) {
        showError(errorBox);
        return;
      }

      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (eventName, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          return;
        }

        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }

        hls.destroy();
        showError(errorBox);
      });
      video.setAttribute("data-ready", "yes");
    }).catch(function () {
      showError(errorBox);
    });
  }

  window.initMoviePlayer = function (config) {
    var video = document.getElementById(config.videoId);
    var overlay = document.getElementById(config.overlayId);
    var errorBox = document.getElementById(config.errorId);

    if (!video || !overlay || !config.source) {
      return;
    }

    function playVideo() {
      attachSource(video, config.source, errorBox).then(function () {
        video.controls = true;
        overlay.hidden = true;
        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            overlay.hidden = false;
          });
        }
      });
    }

    overlay.addEventListener("click", playVideo);
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        overlay.hidden = false;
      }
    });
    video.addEventListener("play", function () {
      overlay.hidden = true;
    });
  };
})();
