(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.classList.add('image-missing');
        });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startHero() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                startHero();
            });
        });

        showSlide(0);
        startHero();
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        var section = scope.parentElement;
        var cards = Array.prototype.slice.call(section.querySelectorAll('[data-movie-card]'));
        var searchInput = scope.querySelector('[data-search-input]');
        var yearFilter = scope.querySelector('[data-year-filter]');
        var regionFilter = scope.querySelector('[data-region-filter]');
        var typeFilter = scope.querySelector('[data-type-filter]');
        var emptyState = section.querySelector('[data-empty-state]');

        function applyFilters() {
            var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var year = yearFilter ? yearFilter.value : '';
            var region = regionFilter ? regionFilter.value : '';
            var type = typeFilter ? typeFilter.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchesYear = !year || card.getAttribute('data-year') === year;
                var matchesRegion = !region || card.getAttribute('data-region') === region;
                var matchesType = !type || card.getAttribute('data-type') === type;
                var show = matchesKeyword && matchesYear && matchesRegion && matchesType;

                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        }

        [searchInput, yearFilter, regionFilter, typeFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        applyFilters();
    });

    var globalSearch = document.querySelector('[data-global-search]');
    if (globalSearch) {
        globalSearch.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                var value = encodeURIComponent(globalSearch.value.trim());
                if (value) {
                    window.location.href = 'categories.html?search=' + value;
                }
            }
        });
    }
})();

function setupMoviePlayer(source) {
    var player = document.querySelector('[data-player]');
    if (!player) {
        return;
    }

    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var ready = false;

    function attach() {
        if (ready || !video) {
            return;
        }

        ready = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new Hls();
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
    }

    function play() {
        attach();
        player.classList.add('is-playing');
        video.setAttribute('controls', 'controls');
        var action = video.play();
        if (action && typeof action.catch === 'function') {
            action.catch(function () {});
        }
    }

    if (cover) {
        cover.addEventListener('click', play);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
    }
}
