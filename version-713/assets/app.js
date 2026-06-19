(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
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

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function cardText(card) {
    return [
      card.getAttribute("data-title") || "",
      card.getAttribute("data-year") || "",
      card.getAttribute("data-tags") || "",
      card.getAttribute("data-region") || "",
      card.getAttribute("data-category") || "",
      card.textContent || ""
    ].join(" ").toLowerCase();
  }

  function applyFilter(value) {
    var query = String(value || "").trim().toLowerCase();
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));
    var empty = document.querySelector(".empty-state");
    var visible = 0;
    cards.forEach(function (card) {
      var matched = !query || cardText(card).indexOf(query) !== -1;
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });
    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  function initSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll(".search-form"));
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q'], input[type='search']");
        if (!input) {
          return;
        }
        var value = input.value.trim();
        if (!value) {
          event.preventDefault();
          if (form.classList.contains("local-search-form")) {
            applyFilter("");
          }
          return;
        }
        if (form.classList.contains("local-search-form")) {
          event.preventDefault();
          applyFilter(value);
          var url = new URL(window.location.href);
          url.searchParams.set("q", value);
          window.history.replaceState({}, "", url.toString());
        }
      });
    });

    var filterInputs = Array.prototype.slice.call(document.querySelectorAll(".filter-input"));
    filterInputs.forEach(function (input) {
      input.addEventListener("input", function () {
        applyFilter(input.value);
      });
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    if (q) {
      filterInputs.forEach(function (input) {
        input.value = q;
      });
      applyFilter(q);
    }

    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-token]"));
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var token = button.getAttribute("data-filter-token") || "";
        filterInputs.forEach(function (input) {
          input.value = token;
        });
        applyFilter(token);
      });
    });
  }

  function setupPlayer(url) {
    ready(function () {
      var video = document.querySelector("[data-player]");
      var button = document.querySelector("[data-play-button]");
      var shell = document.querySelector("[data-player-shell]");
      if (!video || !button || !url) {
        return;
      }
      var hls = null;
      var loaded = false;

      function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      function begin() {
        button.classList.add("is-hidden");
        video.controls = true;
        if (loaded) {
          playVideo();
          return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
          video.addEventListener("loadedmetadata", playVideo, { once: true });
          playVideo();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
          return;
        }
        video.src = url;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        playVideo();
      }

      button.addEventListener("click", begin);
      video.addEventListener("click", function () {
        if (!loaded) {
          begin();
        }
      });
      if (shell) {
        shell.addEventListener("click", function (event) {
          if (event.target === shell && !loaded) {
            begin();
          }
        });
      }
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initSearch();
  });

  window.MovieSite = {
    player: setupPlayer
  };
})();
