(function () {
    const menuButton = document.querySelector('.menu-toggle');
    const mobilePanel = document.querySelector('.mobile-panel');
    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            const open = mobilePanel.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    const slider = document.querySelector('[data-hero-slider]');
    if (slider) {
        const slides = Array.from(slider.querySelectorAll('.hero-slide'));
        const dots = Array.from(slider.querySelectorAll('.hero-dot'));
        const prev = slider.querySelector('[data-hero-prev]');
        const next = slider.querySelector('[data-hero-next]');
        let index = 0;
        let timer = null;

        const show = function (nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        };

        const start = function () {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5000);
        };

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        show(0);
        start();
    }

    const filterRoot = document.querySelector('[data-filter-root]');
    if (filterRoot) {
        const input = filterRoot.querySelector('[data-filter-input]');
        const buttons = Array.from(filterRoot.querySelectorAll('[data-filter-value]'));
        const cards = Array.from(document.querySelectorAll('.movie-card'));
        let selected = 'all';

        const apply = function () {
            const keyword = input ? input.value.trim().toLowerCase() : '';
            cards.forEach(function (card) {
                const haystack = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.year].join(' ').toLowerCase();
                const byKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                const byType = selected === 'all' || card.dataset.type === selected || card.dataset.region === selected || card.dataset.year === selected;
                card.style.display = byKeyword && byType ? '' : 'none';
            });
        };

        if (input) {
            input.addEventListener('input', apply);
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                selected = button.dataset.filterValue;
                buttons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                apply();
            });
        });
    }

    const searchForm = document.querySelector('[data-search-form]');
    const searchInput = document.querySelector('[data-search-input]');
    const results = document.querySelector('[data-search-results]');

    const renderSearch = function (query) {
        if (!results || !window.SEARCH_MOVIES) {
            return;
        }
        const words = query.trim().toLowerCase();
        if (!words) {
            results.innerHTML = '<div class="empty-state">输入片名、类型、地区或标签即可搜索。</div>';
            return;
        }
        const matched = window.SEARCH_MOVIES.filter(function (movie) {
            return movie.search.indexOf(words) !== -1;
        }).slice(0, 80);
        if (!matched.length) {
            results.innerHTML = '<div class="empty-state">暂时没有匹配内容，换个关键词试试。</div>';
            return;
        }
        results.innerHTML = '<div class="movie-grid">' + matched.map(function (movie) {
            return '<article class="movie-card">' +
                '<a class="poster-wrap" href="' + movie.url + '" aria-label="' + movie.title + '">' +
                '<img src="' + movie.cover + '" alt="' + movie.title + '" loading="lazy">' +
                '<span class="poster-mask"></span><span class="play-chip">播放</span></a>' +
                '<div class="movie-card-body"><div class="card-meta"><span>' + movie.year + '</span><span>' + movie.region + '</span><span>' + movie.type + '</span></div>' +
                '<h3><a href="' + movie.url + '">' + movie.title + '</a></h3>' +
                '<p>' + movie.oneLine + '</p><div class="card-tags"><a href="' + movie.categoryUrl + '">' + movie.category + '</a></div></div></article>';
        }).join('') + '</div>';
    };

    if (searchForm && searchInput && results) {
        const params = new URLSearchParams(window.location.search);
        const initial = params.get('q') || '';
        searchInput.value = initial;
        renderSearch(initial);
        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const query = searchInput.value.trim();
            const url = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
            window.history.replaceState(null, '', url);
            renderSearch(query);
        });
        document.querySelectorAll('[data-search-term]').forEach(function (button) {
            button.addEventListener('click', function () {
                const term = button.dataset.searchTerm;
                searchInput.value = term;
                window.history.replaceState(null, '', './search.html?q=' + encodeURIComponent(term));
                renderSearch(term);
            });
        });
    }
})();
