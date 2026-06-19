document.addEventListener("DOMContentLoaded", function() {
    const root = document.body.getAttribute("data-root") || ".";
    const mobileButton = document.querySelector(".mobile-menu-toggle");
    const mobileNav = document.querySelector(".mobile-nav");

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener("click", function() {
            mobileNav.classList.toggle("is-open");
        });
    }

    document.querySelectorAll("[data-hero]").forEach(function(hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const prev = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        let current = 0;
        let timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, itemIndex) {
                slide.classList.toggle("is-active", itemIndex === current);
            });
            dots.forEach(function(dot, itemIndex) {
                dot.classList.toggle("is-active", itemIndex === current);
            });
        }

        function start() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function() {
                show(current + 1);
            }, 5000);
        }

        dots.forEach(function(dot, index) {
            dot.addEventListener("click", function() {
                show(index);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function() {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function() {
                show(current + 1);
                start();
            });
        }

        show(0);
        start();
    });

    const searchLists = document.querySelectorAll("[data-search-list]");
    const forms = document.querySelectorAll("form.site-search");

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function filterCards(query) {
        const text = normalize(query);
        searchLists.forEach(function(list) {
            const cards = list.querySelectorAll("[data-search-item]");
            cards.forEach(function(card) {
                const content = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags"),
                    card.textContent
                ].join(" ").toLowerCase();
                card.classList.toggle("is-hidden", text && content.indexOf(text) === -1);
            });
        });
    }

    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";
    if (query) {
        forms.forEach(function(form) {
            const input = form.querySelector("input[name='q']");
            if (input) {
                input.value = query;
            }
        });
        filterCards(query);
    }

    forms.forEach(function(form) {
        form.addEventListener("submit", function(event) {
            const input = form.querySelector("input[name='q']");
            const value = input ? input.value.trim() : "";
            if (searchLists.length) {
                event.preventDefault();
                filterCards(value);
                return;
            }
            if (!value) {
                return;
            }
            event.preventDefault();
            const path = root === "." ? "movies.html" : root + "/movies.html";
            window.location.href = path + "?q=" + encodeURIComponent(value);
        });
    });
});
