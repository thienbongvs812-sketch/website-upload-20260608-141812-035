(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !mobileNav) {
            return;
        }
        toggle.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    function setupSearchJump() {
        document.querySelectorAll("[data-search-jump]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                var target = "./search.html";
                if (value) {
                    target += "?q=" + encodeURIComponent(value);
                }
                window.location.href = target;
            });
        });
    }

    function setupFilters() {
        document.querySelectorAll("[data-filter-form]").forEach(function (form) {
            var grid = form.parentElement.querySelector("[data-filter-grid]");
            var empty = form.parentElement.querySelector("[data-empty-state]");
            if (!grid) {
                return;
            }
            var input = form.querySelector("input[name='q']");
            var params = new URLSearchParams(window.location.search);
            if (input && params.get("q")) {
                input.value = params.get("q");
            }
            function apply() {
                var q = (form.querySelector("input[name='q']") || {}).value || "";
                var type = (form.querySelector("select[name='type']") || {}).value || "";
                var year = (form.querySelector("select[name='year']") || {}).value || "";
                var region = (form.querySelector("select[name='region']") || {}).value || "";
                q = q.trim().toLowerCase();
                var shown = 0;
                grid.querySelectorAll(".search-card").forEach(function (card) {
                    var haystack = (card.dataset.search || "").toLowerCase();
                    var matchesText = !q || haystack.indexOf(q) !== -1;
                    var matchesType = !type || card.dataset.type === type;
                    var matchesYear = !year || card.dataset.year === year;
                    var matchesRegion = !region || card.dataset.region === region;
                    var visible = matchesText && matchesType && matchesYear && matchesRegion;
                    card.hidden = !visible;
                    if (visible) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.hidden = shown !== 0;
                }
            }
            form.addEventListener("input", apply);
            form.addEventListener("change", apply);
            apply();
        });
    }

    window.initMoviePlayer = function (source) {
        var video = document.getElementById("movie-video");
        var overlay = document.getElementById("play-overlay");
        if (!video || !source) {
            return;
        }
        var player = null;
        function attach() {
            if (video.dataset.ready === "1") {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                player = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                player.loadSource(source);
                player.attachMedia(video);
            } else {
                video.src = source;
            }
            video.dataset.ready = "1";
        }
        function hideOverlay() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        }
        function showOverlay() {
            if (overlay && video.paused && !video.ended) {
                overlay.classList.remove("is-hidden");
            }
        }
        function play() {
            attach();
            hideOverlay();
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    showOverlay();
                });
            }
        }
        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.dataset.ready !== "1") {
                play();
            }
        });
        video.addEventListener("play", hideOverlay);
        video.addEventListener("pause", showOverlay);
        video.addEventListener("ended", showOverlay);
        window.addEventListener("pagehide", function () {
            if (player) {
                player.destroy();
                player = null;
            }
        });
        attach();
    };

    ready(function () {
        setupNavigation();
        setupSearchJump();
        setupFilters();
    });
})();
