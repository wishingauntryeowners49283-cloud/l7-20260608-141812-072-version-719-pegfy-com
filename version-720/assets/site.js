(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var backTop = document.querySelector('[data-back-top]');

  if (backTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 320) {
        backTop.classList.add('is-visible');
      } else {
        backTop.classList.remove('is-visible');
      }
    });

    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-to]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide-to')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }
  }

  var filterBox = document.querySelector('[data-filter-box]');

  if (filterBox) {
    var filterInput = filterBox.querySelector('[data-filter-input]');
    var yearFilter = filterBox.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-grid] .movie-card'));
    var emptyState = document.querySelector('[data-empty-state]');

    function applyFilter() {
      var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
      var year = yearFilter ? yearFilter.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-tags') || '',
          card.textContent || ''
        ].join(' ').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedYear = !year || cardYear === year;
        var matched = matchedKeyword && matchedYear;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    if (filterInput) {
      filterInput.addEventListener('input', applyFilter);
    }
    if (yearFilter) {
      yearFilter.addEventListener('change', applyFilter);
    }
  }

  var player = document.querySelector('[data-player]');

  if (player) {
    var video = player.querySelector('[data-video]');
    var toggleButtons = Array.prototype.slice.call(player.querySelectorAll('[data-player-toggle]'));
    var loading = player.querySelector('[data-player-loading]');
    var error = player.querySelector('[data-player-error]');
    var source = video ? video.getAttribute('data-src') : '';

    function hideLoading() {
      if (loading) {
        loading.hidden = true;
      }
    }

    function showError() {
      hideLoading();
      if (error) {
        error.hidden = false;
      }
    }

    function togglePlay() {
      if (!video) {
        return;
      }

      if (video.paused) {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            showError();
          });
        }
      } else {
        video.pause();
      }
    }

    if (video && source) {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, hideLoading);
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else {
              showError();
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', hideLoading);
      } else {
        showError();
      }

      toggleButtons.forEach(function (button) {
        button.addEventListener('click', togglePlay);
      });

      video.addEventListener('click', togglePlay);
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
        hideLoading();
      });
      video.addEventListener('pause', function () {
        player.classList.remove('is-playing');
      });
      video.addEventListener('error', showError);
    }
  }

  var searchResults = document.querySelector('[data-search-results]');

  if (searchResults && window.MOVIE_SEARCH_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = document.querySelector('[data-search-page-input]');
    var status = document.querySelector('[data-search-status]');

    if (input) {
      input.value = query;
    }

    function createCard(movie) {
      var anchor = document.createElement('a');
      anchor.className = 'movie-card';
      anchor.href = movie.file;
      anchor.innerHTML = [
        '<span class="cover-wrap">',
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="cover-shade"></span>',
        '<span class="badge badge-rose">' + escapeHtml(movie.region) + '</span>',
        '<span class="duration">' + escapeHtml(movie.duration) + '</span>',
        '</span>',
        '<span class="movie-card-body">',
        '<strong>' + escapeHtml(movie.title) + '</strong>',
        '<span class="movie-desc">' + escapeHtml(movie.oneLine) + '</span>',
        '<span class="movie-meta"><em>' + escapeHtml(movie.year) + '</em><em>' + escapeHtml(movie.genre) + '</em></span>',
        '</span>'
      ].join('');
      return anchor;
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    if (!query) {
      var samples = window.MOVIE_SEARCH_INDEX.slice(0, 24);
      samples.forEach(function (movie) {
        searchResults.appendChild(createCard(movie));
      });
      if (status) {
        status.textContent = '输入关键词可继续筛选影片，当前展示推荐内容。';
      }
    } else {
      var lowerQuery = query.toLowerCase();
      var matched = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
        return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine]
          .join(' ')
          .toLowerCase()
          .indexOf(lowerQuery) !== -1;
      }).slice(0, 120);

      matched.forEach(function (movie) {
        searchResults.appendChild(createCard(movie));
      });

      if (status) {
        status.textContent = matched.length ? '已为你筛选出相关影片。' : '未找到相关影片，请尝试其他关键词。';
      }
    }
  }
})();
