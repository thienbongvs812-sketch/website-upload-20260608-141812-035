document.addEventListener("DOMContentLoaded", function() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (toggle && mobileNav) {
        toggle.addEventListener("click", function() {
            mobileNav.classList.toggle("open");
        });
    }

    document.querySelectorAll("[data-search-form]").forEach(function(form) {
        form.addEventListener("submit", function(event) {
            event.preventDefault();
            var input = form.querySelector("input[name='q']");
            var target = form.getAttribute("action") || "all.html";
            var value = input ? input.value.trim() : "";
            window.location.href = value ? target + "?q=" + encodeURIComponent(value) : target;
        });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function() {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function(dot, index) {
            dot.addEventListener("click", function() {
                showSlide(index);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener("click", function() {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function() {
                showSlide(current + 1);
                startTimer();
            });
        }

        showSlide(0);
        startTimer();
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var liveSearch = document.querySelector("[data-live-search]");
    var filterControls = Array.prototype.slice.call(document.querySelectorAll("[data-filter-control]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card-container] .movie-card, [data-card-container] .ranking-row, [data-card-container] .rank-item"));
    var empty = document.querySelector("[data-empty-state]");

    if (liveSearch && query) {
        liveSearch.value = query;
    }

    function includesText(value, needle) {
        return String(value || "").toLowerCase().indexOf(String(needle || "").toLowerCase()) !== -1;
    }

    function applyFilters() {
        var textValue = liveSearch ? liveSearch.value.trim() : "";
        var activeFilters = {};

        filterControls.forEach(function(control) {
            activeFilters[control.getAttribute("data-filter-control")] = control.value;
        });

        var shown = 0;
        cards.forEach(function(card) {
            var searchable = [
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year"),
                card.getAttribute("data-tags")
            ].join(" ");
            var matched = !textValue || includesText(searchable, textValue);

            Object.keys(activeFilters).forEach(function(key) {
                var value = activeFilters[key];
                if (!value) {
                    return;
                }
                var dataValue = card.getAttribute("data-" + key) || "";
                if (!includesText(dataValue, value)) {
                    matched = false;
                }
            });

            card.classList.toggle("hidden-card", !matched);
            if (matched) {
                shown += 1;
            }
        });

        if (empty) {
            empty.classList.toggle("show", cards.length > 0 && shown === 0);
        }
    }

    if (liveSearch || filterControls.length) {
        if (liveSearch) {
            liveSearch.addEventListener("input", applyFilters);
        }
        filterControls.forEach(function(control) {
            control.addEventListener("change", applyFilters);
        });
        applyFilters();
    }
});
