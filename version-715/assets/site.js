(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector(".nav-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var open = panel.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll(".carousel-dot"));
      var prev = carousel.querySelector("[data-prev]");
      var next = carousel.querySelector("[data-next]");
      var index = Math.max(0, slides.findIndex(function (slide) { return slide.classList.contains("is-active"); }));
      var timer = null;

      function show(target) {
        if (!slides.length) {
          return;
        }
        index = (target + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
          dot.setAttribute("aria-current", i === index ? "true" : "false");
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
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          restart();
        });
      });
      show(index);
      restart();
    });

    document.querySelectorAll("[data-local-filter]").forEach(function (wrap) {
      var input = wrap.querySelector("input[type='search']");
      var chips = Array.prototype.slice.call(wrap.querySelectorAll(".filter-chip"));
      var scope = document.querySelector(wrap.getAttribute("data-local-filter"));
      var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll(".movie-card")) : [];
      var active = "all";

      function apply() {
        var q = normalize(input ? input.value : "");
        cards.forEach(function (card) {
          var body = normalize(card.getAttribute("data-text"));
          var year = normalize(card.getAttribute("data-year"));
          var kind = normalize(card.getAttribute("data-type"));
          var typeMatch = active === "all" || body.indexOf(active) >= 0 || year === active || kind === active;
          var textMatch = !q || body.indexOf(q) >= 0;
          card.classList.toggle("is-hidden", !(typeMatch && textMatch));
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          chips.forEach(function (item) { item.classList.remove("is-active"); });
          chip.classList.add("is-active");
          active = normalize(chip.getAttribute("data-filter") || chip.textContent || "all");
          apply();
        });
      });
      apply();
    });

    var searchGrid = document.querySelector("[data-search-results]");
    if (searchGrid && window.SEARCH_INDEX) {
      var params = new URLSearchParams(window.location.search);
      var q = normalize(params.get("q") || "");
      var input = document.querySelector("[data-search-input]");
      var empty = document.querySelector(".empty-state");
      if (input) {
        input.value = params.get("q") || "";
      }

      function safe(value) {
        return String(value || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");
      }

      function render(query) {
        var words = normalize(query).split(/\s+/).filter(Boolean);
        var list = window.SEARCH_INDEX.filter(function (item) {
          var hay = normalize([item.title, item.region, item.type, item.year, item.genre, item.category, item.tags].join(" "));
          return words.length === 0 ? item.featured : words.every(function (word) { return hay.indexOf(word) >= 0; });
        }).slice(0, 96);

        searchGrid.innerHTML = list.map(function (item) {
          return [
            '<article class="video-card compact-card">',
            '<a class="poster-link" href="' + safe(item.url) + '" aria-label="' + safe(item.title) + '">',
            '<img class="video-card-cover" src="' + safe(item.cover) + '" alt="' + safe(item.title) + '" loading="lazy">',
            '<span class="poster-play">▶</span>',
            '</a>',
            '<div class="video-card-content">',
            '<div class="card-badges"><span class="category-badge">' + safe(item.category) + '</span><span>' + safe(item.year) + '</span></div>',
            '<h2 class="video-card-title"><a href="' + safe(item.url) + '">' + safe(item.title) + '</a></h2>',
            '<p class="video-card-description">' + safe(item.oneLine) + '</p>',
            '<div class="video-card-meta"><span>' + safe(item.region) + '</span><span>' + safe(item.type) + '</span></div>',
            '</div>',
            '</article>'
          ].join("");
        }).join("");

        if (empty) {
          empty.classList.toggle("is-visible", list.length === 0);
        }
      }

      render(q);
      if (input) {
        input.addEventListener("input", function () {
          render(input.value);
        });
      }
    }
  });
})();
