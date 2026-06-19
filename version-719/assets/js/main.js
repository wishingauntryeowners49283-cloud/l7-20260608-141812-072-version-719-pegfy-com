(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });

    restart();
  }

  function setupFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));

    forms.forEach(function (form) {
      var input = form.querySelector("[data-filter-input]");
      var items = Array.prototype.slice.call(document.querySelectorAll("[data-filter-item]"));

      if (!input || items.length === 0) {
        return;
      }

      function applyFilter() {
        var keyword = input.value.trim().toLowerCase();

        items.forEach(function (item) {
          var text = (item.getAttribute("data-filter-text") || "").toLowerCase();
          item.classList.toggle("is-hidden", keyword !== "" && text.indexOf(keyword) === -1);
        });
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        applyFilter();
      });

      input.addEventListener("input", applyFilter);
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
