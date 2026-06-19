(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var wrap = document.querySelector(".nav-wrap");
    var button = document.querySelector(".menu-button");
    if (!wrap || !button) {
      return;
    }
    button.addEventListener("click", function () {
      var opened = wrap.classList.toggle("nav-open");
      button.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    if (slides.length > 1) {
      restart();
    }
  }

  function initFilters() {
    var page = document.querySelector(".filter-page");
    if (!page) {
      return;
    }
    var input = page.querySelector(".filter-input");
    var typeSelect = page.querySelector(".filter-type");
    var regionSelect = page.querySelector(".filter-region");
    var cards = Array.prototype.slice.call(page.querySelectorAll(".movie-card"));
    var empty = page.querySelector(".empty-result");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";

    if (input && initial) {
      input.value = initial;
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function apply() {
      var query = normalize(input ? input.value : "");
      var type = normalize(typeSelect ? typeSelect.value : "");
      var region = normalize(regionSelect ? regionSelect.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags
        ].join(" "));
        var typeValue = normalize(card.dataset.type);
        var regionValue = normalize(card.dataset.region);
        var matched = (!query || haystack.indexOf(query) !== -1) &&
          (!type || typeValue.indexOf(type) !== -1) &&
          (!region || regionValue.indexOf(region) !== -1);
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (typeSelect) {
      typeSelect.addEventListener("change", apply);
    }
    if (regionSelect) {
      regionSelect.addEventListener("change", apply);
    }
    apply();
  }

  function initMoviePlayer(videoId, coverId, videoUrl) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var hls = null;
    var loaded = false;

    if (!video || !videoUrl) {
      return;
    }

    function attach() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else {
        video.src = videoUrl;
      }
    }

    function play() {
      attach();
      if (cover) {
        cover.hidden = true;
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          video.controls = true;
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });

  window.initMoviePlayer = initMoviePlayer;
})();
