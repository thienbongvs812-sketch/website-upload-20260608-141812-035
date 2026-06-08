(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var video = document.getElementById('movie-player');
    var playButton = document.querySelector('[data-play-button]');

    if (!video) {
      return;
    }

    var source = video.getAttribute('data-src');
    var loaded = false;
    var hlsInstance = null;

    function attachSource() {
      if (loaded || !source) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        loaded = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        loaded = true;
        return;
      }

      video.src = source;
      loaded = true;
    }

    function playVideo() {
      attachSource();
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          video.setAttribute('controls', 'controls');
        });
      }
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
    }

    if (playButton) {
      playButton.addEventListener('click', playVideo);
    }

    video.addEventListener('play', function () {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
