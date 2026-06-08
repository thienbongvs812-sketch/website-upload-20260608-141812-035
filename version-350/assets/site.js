(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-mobile-menu]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
      menuButton.addEventListener('click', function () {
        mobilePanel.classList.toggle('is-open');
      });
    }

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
      var prev = slider.querySelector('[data-hero-prev]');
      var next = slider.querySelector('[data-hero-next]');
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

      function startTimer() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5000);
      }

      if (prev) {
        prev.addEventListener('click', function () {
          showSlide(current - 1);
          startTimer();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          showSlide(current + 1);
          startTimer();
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          showSlide(index);
          startTimer();
        });
      });

      showSlide(0);
      startTimer();
    }

    var searchInput = document.getElementById('search-input');
    var resultRoot = document.getElementById('search-results');
    var searchTitle = document.getElementById('search-title');
    var searchCount = document.getElementById('search-count');

    if (searchInput && resultRoot && window.MOVIE_SEARCH_DATA) {
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get('q') || '';
      searchInput.value = initialQuery;

      function escapeHtml(value) {
        return String(value || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      }

      function movieCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
          return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return [
          '<article class="movie-card">',
          '  <a class="poster-link" href="' + movie.url + '">',
          '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
          '    <span class="play-hover">▶</span>',
          '  </a>',
          '  <div class="movie-card-body">',
          '    <a class="movie-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>',
          '    <p class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.type) + '</p>',
          '    <p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>',
          '    <div class="tag-row">' + tags + '</div>',
          '  </div>',
          '</article>'
        ].join('');
      }

      function performSearch(query) {
        var normalized = String(query || '').trim().toLowerCase();
        var source = window.MOVIE_SEARCH_DATA;
        var results = normalized
          ? source.filter(function (movie) {
              return [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(' '), movie.oneLine]
                .join(' ')
                .toLowerCase()
                .indexOf(normalized) !== -1;
            })
          : source.slice(0, 60);

        if (searchTitle) {
          searchTitle.textContent = normalized ? '搜索：' + query : '全部影片';
        }
        if (searchCount) {
          searchCount.textContent = '找到 ' + results.length + ' 部影片';
        }
        resultRoot.innerHTML = results.slice(0, 120).map(movieCard).join('');
      }

      performSearch(initialQuery);
      searchInput.addEventListener('input', function () {
        performSearch(searchInput.value);
      });
    }
  });
})();
