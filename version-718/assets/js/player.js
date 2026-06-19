import { H as Hls } from './hls.js';

function bindPlayer(player) {
  const video = player.querySelector('video[data-stream]');
  const trigger = player.querySelector('[data-play-trigger]');
  const message = player.querySelector('[data-player-message]');
  if (!video) {
    return;
  }

  const stream = video.dataset.stream;
  let hls = null;
  let prepared = false;
  let pendingPlay = false;

  const markUnavailable = () => {
    player.classList.add('player-unavailable');
    if (message) {
      message.hidden = false;
    }
  };

  const prepare = () => {
    if (prepared || !stream) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      prepared = true;
      return;
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (pendingPlay) {
          video.play().catch(() => {});
        }
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          markUnavailable();
          hls.destroy();
        }
      });
      prepared = true;
      return;
    }

    markUnavailable();
  };

  const start = () => {
    pendingPlay = true;
    prepare();
    if (trigger) {
      trigger.classList.add('is-hidden');
    }
    video.play().catch(() => {});
  };

  if (trigger) {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      start();
    });
  }

  video.addEventListener('click', () => {
    if (video.paused) {
      start();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', () => {
    if (trigger) {
      trigger.classList.add('is-hidden');
    }
  });

  window.addEventListener('pagehide', () => {
    if (hls) {
      hls.destroy();
    }
  });
}

document.querySelectorAll('[data-player]').forEach(bindPlayer);
