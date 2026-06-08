function initPlayer(sourceUrl) {
    var video = document.getElementById("moviePlayer");
    var overlay = document.getElementById("playOverlay");

    if (!video || !sourceUrl) {
        return;
    }

    var hlsInstance = null;

    function bindSource() {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            if (video.src !== sourceUrl) {
                video.src = sourceUrl;
            }
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (!hlsInstance) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
            }
        }
    }

    function beginPlay() {
        bindSource();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.then === "function") {
            playPromise.then(function() {
                if (overlay) {
                    overlay.classList.add("hidden");
                }
            }).catch(function() {
                if (overlay) {
                    overlay.classList.remove("hidden");
                }
            });
        } else if (overlay) {
            overlay.classList.add("hidden");
        }
    }

    bindSource();

    if (overlay) {
        overlay.addEventListener("click", beginPlay);
    }

    video.addEventListener("play", function() {
        if (overlay) {
            overlay.classList.add("hidden");
        }
    });

    video.addEventListener("pause", function() {
        if (overlay && video.currentTime === 0) {
            overlay.classList.remove("hidden");
        }
    });

    video.addEventListener("click", function() {
        if (video.paused) {
            beginPlay();
        }
    });
}
