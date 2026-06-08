(function () {
    const players = Array.from(document.querySelectorAll('[data-video-player]'));

    const startVideo = function (shell) {
        const video = shell.querySelector('video');
        const overlay = shell.querySelector('.player-overlay');
        if (!video) {
            return;
        }
        const url = video.dataset.video;
        if (!url) {
            return;
        }
        if (!video.dataset.ready) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                video.hls = hls;
            } else {
                video.src = url;
            }
            video.dataset.ready = 'true';
        }
        video.controls = true;
        if (overlay) {
            overlay.classList.add('hidden');
        }
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    };

    players.forEach(function (shell) {
        const overlay = shell.querySelector('.player-overlay');
        const button = shell.querySelector('.player-button');
        const video = shell.querySelector('video');
        if (button) {
            button.addEventListener('click', function () {
                startVideo(shell);
            });
        }
        if (overlay) {
            overlay.addEventListener('click', function () {
                startVideo(shell);
            });
        }
        if (video) {
            video.addEventListener('click', function () {
                if (!video.dataset.ready) {
                    startVideo(shell);
                }
            });
        }
    });
})();
