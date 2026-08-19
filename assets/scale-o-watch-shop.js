/**
 * Scale-O Watch & Shop — snap carousel + visibility-based video playback
 */
(function () {
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)');

  function getCols(root) {
    var w = window.innerWidth;
    if (w >= 1024) return parseFloat(root.dataset.colsDesktop) || 4;
    if (w >= 768) return parseFloat(root.dataset.colsTablet) || 2.5;
    return 1;
  }

  function pageSize(root) {
    var cols = getCols(root);
    if (cols >= 3) return Math.floor(cols);
    return Math.max(1, Math.round(cols));
  }

  function cardStep(track, slide) {
    if (!slide) return 0;
    if (window.innerWidth < 768) {
      return track.getBoundingClientRect().width;
    }
    var gap = parseFloat(window.getComputedStyle(track).gap) || 0;
    return slide.getBoundingClientRect().width + gap;
  }

  function youtubeCommand(iframe, func) {
    if (!iframe || !iframe.contentWindow) return;
    iframe.contentWindow.postMessage(JSON.stringify({
      event: 'command',
      func: func,
      args: []
    }), '*');
  }

  function vimeoCommand(iframe, method, value) {
    if (!iframe || !iframe.contentWindow) return;
    var payload = { method: method };
    if (value !== undefined) payload.value = value;
    iframe.contentWindow.postMessage(JSON.stringify(payload), '*');
  }

  function isCardMuted(card) {
    return card.dataset.wasMuted !== 'false';
  }

  function updateMuteButton(card) {
    var btn = card.querySelector('[data-was-mute]');
    if (!btn) return;
    var muted = isCardMuted(card);
    btn.setAttribute('aria-pressed', muted ? 'true' : 'false');
    btn.setAttribute('aria-label', muted ? 'Unmute video' : 'Mute video');
    card.classList.toggle('is-muted', muted);
  }

  function applyMuteState(card) {
    var muted = isCardMuted(card);
    var video = card.querySelector('[data-was-video]');
    var iframe = card.querySelector('[data-was-iframe]');

    if (video) video.muted = muted;

    if (iframe && iframe.getAttribute('src')) {
      if (iframe.dataset.provider === 'youtube') {
        youtubeCommand(iframe, muted ? 'mute' : 'unMute');
      }
      if (iframe.dataset.provider === 'vimeo') {
        vimeoCommand(iframe, 'setVolume', muted ? 0 : 1);
      }
    }

    updateMuteButton(card);
  }

  function setCardMuted(card, muted, options) {
    options = options || {};
    card.dataset.wasMuted = muted ? 'true' : 'false';
    applyMuteState(card);
    if (!muted && !options.skipEnforce) {
      enforceSingleUnmuted(card);
    }
  }

  function enforceSingleUnmuted(activeCard) {
    document.querySelectorAll('.scale-o-watch-shop [data-was-card]').forEach(function (other) {
      if (other === activeCard || isCardMuted(other)) return;
      other.dataset.wasMuted = 'true';
      applyMuteState(other);
    });
  }

  function muteAllCards(root) {
    if (!root) return;
    root.querySelectorAll('[data-was-card]').forEach(function (card) {
      if (isCardMuted(card)) return;
      card.dataset.wasMuted = 'true';
      applyMuteState(card);
    });
  }

  function loadMedia(card) {
    if (!card || card.dataset.mediaLoaded === 'true') return;
    var video = card.querySelector('[data-was-video]');
    var iframe = card.querySelector('[data-was-iframe]');

    if (video && video.dataset.src && !video.getAttribute('src')) {
      video.setAttribute('src', video.dataset.src);
      video.load();
    }

    if (iframe && iframe.dataset.src && !iframe.getAttribute('src')) {
      iframe.addEventListener('load', function () {
        applyMuteState(card);
      }, { once: true });
      iframe.setAttribute('src', iframe.dataset.src);
    }

    card.dataset.mediaLoaded = 'true';
  }

  function playCard(card) {
    if (!card) return;
    var video = card.querySelector('[data-was-video]');
    var iframe = card.querySelector('[data-was-iframe]');

    if (video) {
      video.muted = isCardMuted(card);
      var tryPlay = function () {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      };
      if (!video.getAttribute('src') && video.dataset.src) {
        video.addEventListener('canplay', tryPlay, { once: true });
        loadMedia(card);
      } else {
        tryPlay();
      }
    }

    if (iframe) {
      var tryEmbedPlay = function () {
        if (iframe.dataset.provider === 'youtube') youtubeCommand(iframe, 'playVideo');
        if (iframe.dataset.provider === 'vimeo') vimeoCommand(iframe, 'play');
        card.classList.add('is-playing');
        applyMuteState(card);
      };
      if (!iframe.getAttribute('src') && iframe.dataset.src) {
        iframe.addEventListener('load', tryEmbedPlay, { once: true });
        loadMedia(card);
      } else {
        tryEmbedPlay();
      }
    }
  }

  function pauseCard(card) {
    if (!card) return;
    var video = card.querySelector('[data-was-video]');
    var iframe = card.querySelector('[data-was-iframe]');

    if (video && !video.paused) video.pause();

    if (iframe) {
      if (iframe.dataset.provider === 'youtube') youtubeCommand(iframe, 'pauseVideo');
      if (iframe.dataset.provider === 'vimeo') vimeoCommand(iframe, 'pause');
    }

    if (!video || video.paused) card.classList.remove('is-playing');
  }

  function playingCards(root) {
    return Array.prototype.slice.call(root.querySelectorAll('.scale-o-watch-shop__card.is-playing'));
  }

  function enforceLimit(root, nextCard) {
    var max = window.innerWidth < 768 ? 1 : 2;
    var current = playingCards(root).filter(function (card) {
      return card !== nextCard;
    });
    while (current.length >= max) {
      pauseCard(current.shift());
    }
  }

  function initVideos(root) {
    var cards = root.querySelectorAll('[data-was-card]');
    if (!cards.length) return;

    var autoplay = root.dataset.autoplay === 'true' && !REDUCE.matches;
    var pauseOutside = root.dataset.pauseOutside !== 'false';

    cards.forEach(function (card) {
      var video = card.querySelector('[data-was-video]');
      var playBtn = card.querySelector('[data-was-play]');
      var muteBtn = card.querySelector('[data-was-mute]');
      var media = card.querySelector('[data-was-media]');

      updateMuteButton(card);

      if (muteBtn) {
        muteBtn.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          loadMedia(card);
          var wasMuted = isCardMuted(card);
          setCardMuted(card, !wasMuted);
          if (wasMuted) {
            var vid = card.querySelector('[data-was-video]');
            if (vid && vid.paused) {
              enforceLimit(root, card);
              playCard(card);
            }
          }
        });
      }

      if (video) {
        video.addEventListener('play', function () {
          card.classList.add('is-playing');
          if (playBtn) playBtn.setAttribute('aria-pressed', 'true');
        });
        video.addEventListener('pause', function () {
          card.classList.remove('is-playing');
          if (playBtn) playBtn.setAttribute('aria-pressed', 'false');
        });
        video.addEventListener('ended', function () {
          if (!video.loop) {
            card.classList.remove('is-playing');
            if (playBtn) playBtn.setAttribute('aria-pressed', 'false');
          }
        });
      }

      function toggle() {
        var vid = card.querySelector('[data-was-video]');
        loadMedia(card);
        if (vid) {
          if (vid.paused) {
            enforceLimit(root, card);
            vid.muted = isCardMuted(card);
            vid.play().catch(function () {});
          } else {
            vid.pause();
          }
          return;
        }
        if (card.classList.contains('is-playing')) {
          pauseCard(card);
        } else {
          enforceLimit(root, card);
          playCard(card);
        }
      }

      if (playBtn) playBtn.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        toggle();
      });

      if (media) {
        media.addEventListener('click', function (event) {
          if (event.target.closest('[data-was-product], [data-was-play], [data-was-mute]')) return;
          if (card.dataset.controls === 'true') return;
          toggle();
        });
      }
    });

    var lazy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          loadMedia(entry.target);
          lazy.unobserve(entry.target);
        }
      });
    }, { rootMargin: '240px 0px', threshold: 0.01 });

    cards.forEach(function (card) { lazy.observe(card); });

    if (!autoplay && !pauseOutside) return;

    var playObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var card = entry.target;
        var canAutoplay = autoplay && card.dataset.autoplay !== 'false';

        if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
          if (canAutoplay) {
            enforceLimit(root, card);
            playCard(card);
          }
        } else if (pauseOutside && entry.intersectionRatio < 0.2) {
          pauseCard(card);
        }
      });
    }, { threshold: [0, 0.2, 0.55, 0.75] });

    cards.forEach(function (card) { playObserver.observe(card); });
  }

  function initCarousel(root) {
    if (root.dataset.carousel !== 'true') return;

    var viewport = root.querySelector('[data-was-viewport]');
    var track = root.querySelector('[data-was-track]');
    var slides = track ? track.querySelectorAll('[data-was-slide]') : [];
    var prev = root.querySelector('[data-was-prev]');
    var next = root.querySelector('[data-was-next]');
    var dotsWrap = root.querySelector('[data-was-dots]');

    if (!viewport || !track || !slides.length) return;

    var page = 0;
    var lastSlide = -1;

    function onSlideChange() {
      var slide = currentPageFromScroll();
      if (slide === lastSlide) return;
      lastSlide = slide;
      muteAllCards(root);
    }

    function totalPages() {
      return Math.max(1, Math.ceil(slides.length / pageSize(root)));
    }

    function maxScroll() {
      return Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    }

    function isStatic() {
      return maxScroll() <= 4;
    }

    function currentPageFromScroll() {
      var step = cardStep(track, slides[0]);
      if (!step) return 0;
      if (window.innerWidth < 768) {
        return Math.max(0, Math.min(slides.length - 1, Math.round(viewport.scrollLeft / step)));
      }
      var index = Math.round(viewport.scrollLeft / step);
      return Math.max(0, Math.min(totalPages() - 1, Math.floor(index / pageSize(root))));
    }

    function updateUi() {
      if (isStatic()) {
        root.classList.add('is-static');
      } else {
        root.classList.remove('is-static');
      }

      page = currentPageFromScroll();
      var pages = window.innerWidth < 768 ? slides.length : totalPages();

      if (prev) prev.disabled = viewport.scrollLeft <= 4;
      if (next) next.disabled = viewport.scrollLeft >= maxScroll() - 4;

      if (!dotsWrap) return;
      var dots = dotsWrap.querySelectorAll('.scale-o-watch-shop__dot');
      if (dots.length !== pages) {
        buildDots();
        dots = dotsWrap.querySelectorAll('.scale-o-watch-shop__dot');
      }
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('is-active', idx === page);
        dot.setAttribute('aria-current', idx === page ? 'true' : 'false');
      });
    }

    function scrollToPage(idx) {
      var pages = totalPages();
      page = Math.max(0, Math.min(pages - 1, idx));
      var step = cardStep(track, slides[0]);
      var left = page * pageSize(root) * step;
      viewport.scrollTo({
        left: left,
        behavior: REDUCE.matches ? 'auto' : 'smooth'
      });
    }

    function scrollToSlide(idx) {
      var step = cardStep(track, slides[0]);
      if (!step) return;
      var left = Math.max(0, Math.min(idx, slides.length - 1)) * step;
      viewport.scrollTo({
        left: left,
        behavior: REDUCE.matches ? 'auto' : 'smooth'
      });
    }

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      var pages = window.innerWidth < 768 ? slides.length : totalPages();
      for (var i = 0; i < pages; i++) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'scale-o-watch-shop__dot' + (i === page ? ' is-active' : '');
        dot.setAttribute('aria-label', 'Go to video ' + (i + 1));
        (function (idx) {
          dot.addEventListener('click', function () {
            if (window.innerWidth < 768) {
              scrollToSlide(idx);
            } else {
              scrollToPage(idx);
            }
          });
        })(i);
        dotsWrap.appendChild(dot);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        scrollToPage(currentPageFromScroll() - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        scrollToPage(currentPageFromScroll() + 1);
      });
    }

    viewport.addEventListener('scroll', function () {
      window.requestAnimationFrame(function () {
        onSlideChange();
        updateUi();
      });
    }, { passive: true });

    lastSlide = currentPageFromScroll();
    buildDots();
    updateUi();

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        buildDots();
        updateUi();
      }, 150);
    });
  }

  function init(root) {
    if (!root || root.dataset.wasInit === 'true') return;
    root.dataset.wasInit = 'true';
    initCarousel(root);
    initVideos(root);
  }

  function boot() {
    document.querySelectorAll('.scale-o-watch-shop').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('shopify:section:load', function (event) {
    var root = event.target && event.target.querySelector('.scale-o-watch-shop');
    if (root) {
      root.dataset.wasInit = 'false';
      init(root);
    }
  });
})();
