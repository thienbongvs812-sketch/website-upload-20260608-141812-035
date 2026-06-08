(function () {
  function each(list, fn) {
    Array.prototype.forEach.call(list, fn);
  }

  function text(value) {
    return (value || "").toString().toLowerCase();
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHeaderSearch() {
    each(document.querySelectorAll("[data-site-search]"), function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
        }
      });
    });
  }

  function initHero() {
    each(document.querySelectorAll("[data-hero-slider]"), function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      if (slides.length < 2) {
        return;
      }
      var index = 0;
      var timer = null;
      function setSlide(next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }
      function start() {
        timer = window.setInterval(function () {
          setSlide(index + 1);
        }, 5200);
      }
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          window.clearInterval(timer);
          setSlide(dotIndex);
          start();
        });
      });
      start();
    });
  }

  function initFilters() {
    each(document.querySelectorAll("[data-filter-root]"), function (root) {
      var container = root.querySelector("[data-card-container]") || root;
      var cards = Array.prototype.slice.call(root.querySelectorAll("[data-card]"));
      var search = root.querySelector("[data-card-search]");
      var buttons = Array.prototype.slice.call(root.querySelectorAll("[data-filter-type]"));
      var sort = root.querySelector("[data-sort-cards]");
      var empty = root.querySelector("[data-filter-empty]");
      var activeType = "all";

      function queryFromUrl() {
        var params = new URLSearchParams(window.location.search);
        return params.get("q") || "";
      }

      function apply() {
        var keyword = text(search ? search.value : "");
        var visible = 0;
        cards.forEach(function (card) {
          var cardText = text([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          var typeOk = activeType === "all" || text(card.getAttribute("data-type")).indexOf(text(activeType)) !== -1;
          var keywordOk = !keyword || cardText.indexOf(keyword) !== -1;
          var show = typeOk && keywordOk;
          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      function sortCards() {
        if (!sort || !container) {
          return;
        }
        var value = sort.value;
        var sorted = cards.slice().sort(function (a, b) {
          if (value === "title") {
            return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
          }
          var left = parseFloat(a.getAttribute("data-" + value) || "0");
          var right = parseFloat(b.getAttribute("data-" + value) || "0");
          return right - left;
        });
        sorted.forEach(function (card) {
          container.appendChild(card);
        });
        apply();
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          buttons.forEach(function (item) {
            item.classList.remove("is-active");
          });
          button.classList.add("is-active");
          activeType = button.getAttribute("data-filter-type") || "all";
          apply();
        });
      });

      if (search) {
        if (root.hasAttribute("data-search-page")) {
          search.value = queryFromUrl();
        }
        search.addEventListener("input", apply);
      }

      if (sort) {
        sort.addEventListener("change", sortCards);
        sortCards();
      }
      apply();
    });
  }

  function initPlayers() {
    each(document.querySelectorAll("[data-player]"), function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play]");
      if (!video || !button) {
        return;
      }
      function begin() {
        startPlayer(player, video);
      }
      button.addEventListener("click", begin);
      video.addEventListener("click", function () {
        if (video.paused) {
          begin();
        }
      });
    });
  }

  function startPlayer(player, video) {
    var sourceNode = video.querySelector("source");
    var stream = sourceNode ? sourceNode.getAttribute("src") : "";
    if (!stream) {
      return;
    }
    player.classList.add("is-playing");
    video.setAttribute("controls", "controls");
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      video.play().catch(function () {});
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (player.hlsInstance) {
        player.hlsInstance.destroy();
      }
      var hls = new window.Hls({
        lowLatencyMode: true,
        backBufferLength: 90
      });
      player.hlsInstance = hls;
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        }
      });
      return;
    }
    video.src = stream;
    video.play().catch(function () {});
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHeaderSearch();
    initHero();
    initFilters();
    initPlayers();
  });
})();
