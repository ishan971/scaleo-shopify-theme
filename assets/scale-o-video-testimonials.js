/**
 * Scale-O Video Testimonials — carousel + modal playback
 */
(function () {
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)');

  function visibleCount(root) {
    var w = window.innerWidth;
    if (w >= 1024) return parseInt(root.dataset.desktopCards, 10) || 3;
    if (w >= 768) return parseInt(root.dataset.tabletCards, 10) || 2;
    return 1;
  }

  function stepWidth(track, card) {
    if (!card) return 0;
    var gap = parseFloat(window.getComputedStyle(track).columnGap || window.getComputedStyle(track).gap) || 0;
    return card.getBoundingClientRect().width + gap;
  }

  function mediaHtml(root, card) {
    var kind = card.dataset.mediaKind;
    var src = card.dataset.mediaSrc;
    var title = (card.dataset.mediaTitle || 'Customer story').replace(/"/g, '');
    var muted = root.dataset.videoMuted === 'true' || root.dataset.videoAutoplay === 'true';
    var controls = root.dataset.showControls !== 'false';
    if (!src || kind === 'none') return '';

    if (kind === 'shopify') {
      return '<video src="' + src + '" ' +
        (controls ? 'controls ' : '') +
        (muted ? 'muted ' : '') +
        'playsinline autoplay></video>';
    }

    if (kind === 'youtube') {
      var yt = 'https://www.youtube.com/embed/' + src + '?rel=0&modestbranding=1&playsinline=1&autoplay=1';
      if (muted) yt += '&mute=1';
      if (controls === false) yt += '&controls=0';
      return '<iframe src="' + yt + '" title="' + title + '" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
    }

    if (kind === 'vimeo') {
      var vm = 'https://player.vimeo.com/video/' + src + '?title=0&byline=0&portrait=0&dnt=1&autoplay=1';
      if (muted) vm += '&muted=1';
      return '<iframe src="' + vm + '" title="' + title + '" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
    }

    return '';
  }

  function init(root) {
    if (!root || root.dataset.svtInit === 'true') return;
    root.dataset.svtInit = 'true';

    var track = root.querySelector('[data-svt-track]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-svt-card]'));
    var prev = root.querySelector('[data-svt-prev]');
    var next = root.querySelector('[data-svt-next]');
    var dotsWrap = root.querySelector('[data-svt-dots]');
    var modal = root.querySelector('[data-svt-modal]');
    var modalMount = root.querySelector('[data-svt-modal-mount]');
    var modalClose = root.querySelectorAll('[data-svt-modal-close]');
    var index = 0;
    var timer = null;
    var videoOpen = false;
    var hovered = false;

    var animItems = root.querySelectorAll('[data-svt-animate]');
    if (animItems.length) {
      if (root.dataset.animate !== 'true' || REDUCE.matches || !('IntersectionObserver' in window)) {
        animItems.forEach(function (el) { el.classList.add('is-visible'); });
      } else {
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.12 });
        animItems.forEach(function (el) { observer.observe(el); });
      }
    }

    if (!track || !cards.length) return;

    function maxIndex() {
      return Math.max(0, cards.length - visibleCount(root));
    }

    function featuredIndex() {
      var vis = visibleCount(root);
      return Math.min(cards.length - 1, index + Math.floor((vis - 1) / 2));
    }

    function renderDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      var pages = maxIndex() + 1;
      for (var i = 0; i < pages; i += 1) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'scale-o-vt__dot' + (i === index ? ' is-active' : '');
        btn.setAttribute('aria-label', 'Go to story group ' + (i + 1));
        btn.addEventListener('click', function (page) {
          return function () { go(page); };
        }(i));
        dotsWrap.appendChild(btn);
      }
    }

    function go(nextIndex) {
      index = Math.min(Math.max(nextIndex, 0), maxIndex());
      var first = cards[0];
      var x = stepWidth(track, first) * index;
      track.style.transform = 'translateX(' + (-x) + 'px)';
      var featured = featuredIndex();
      cards.forEach(function (card, i) {
        card.classList.toggle('is-featured', i === featured);
      });
      if (prev) prev.disabled = index <= 0;
      if (next) next.disabled = index >= maxIndex();
      renderDots();
    }

    function startTimer() {
      stopTimer();
      if (root.dataset.autoplay !== 'true' || REDUCE.matches || cards.length <= visibleCount(root)) return;
      timer = window.setInterval(function () {
        if (hovered || videoOpen) return;
        go(index >= maxIndex() ? 0 : index + 1);
      }, parseInt(root.dataset.interval, 10) || 5000);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    function closeModal() {
      if (!modal || !modalMount) return;
      modal.hidden = true;
      modalMount.innerHTML = '';
      document.body.style.overflow = '';
      videoOpen = false;
      startTimer();
    }

    function openModal(card) {
      if (!modal || !modalMount) return;
      var html = mediaHtml(root, card);
      if (!html) return;
      modalMount.innerHTML = html;
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      videoOpen = true;
      if (root.dataset.pauseVideo === 'true') stopTimer();
      var close = modal.querySelector('[data-svt-modal-close]');
      if (close) close.focus();
    }

    function playInline(card) {
      var media = card.querySelector('[data-svt-play]');
      if (!media) return;
      var html = mediaHtml(root, card);
      if (!html) return;
      media.outerHTML = '<div class="scale-o-vt__media is-playing">' + html + '</div>';
      var video = card.querySelector('video');
      if (video && video.play) video.play().catch(function () {});
      videoOpen = true;
      if (root.dataset.pauseVideo === 'true') stopTimer();
    }

    cards.forEach(function (card) {
      var play = card.querySelector('[data-svt-play]');
      if (!play) return;
      play.addEventListener('click', function () {
        if (root.dataset.openModal === 'true') openModal(card);
        else playInline(card);
      });
    });

    if (prev) prev.addEventListener('click', function () { go(index - 1); startTimer(); });
    if (next) next.addEventListener('click', function () { go(index + 1); startTimer(); });

    var viewport = root.querySelector('[data-svt-viewport]');
    var touchStartX = 0;
    if (viewport) {
      viewport.addEventListener('touchstart', function (event) {
        touchStartX = event.changedTouches[0].clientX;
      }, { passive: true });
      viewport.addEventListener('touchend', function (event) {
        var dx = event.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) < 40) return;
        if (dx < 0) go(index + 1);
        else go(index - 1);
        startTimer();
      }, { passive: true });
    }

    root.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') { go(index - 1); }
      if (event.key === 'ArrowRight') { go(index + 1); }
    });

    if (root.dataset.pauseHover === 'true') {
      root.addEventListener('mouseenter', function () { hovered = true; });
      root.addEventListener('mouseleave', function () { hovered = false; });
    }

    modalClose.forEach(function (btn) {
      btn.addEventListener('click', closeModal);
    });
    if (modal) {
      modal.addEventListener('click', function (event) {
        if (event.target === modal) closeModal();
      });
    }
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && modal && !modal.hidden) closeModal();
    });

    window.addEventListener('resize', function () {
      go(index);
    });

    go(0);
    startTimer();
  }

  function boot() {
    document.querySelectorAll('.scale-o-vt').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('shopify:section:load', function (event) {
    var root = event.target && event.target.querySelector('.scale-o-vt');
    if (root) {
      root.dataset.svtInit = 'false';
      init(root);
    }
  });
})();
