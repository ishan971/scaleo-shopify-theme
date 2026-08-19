/**
 * Scale-O USP Strip — optional mobile auto-scroll
 * Lightweight, no dependencies. Desktop is untouched.
 */
(function () {
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function isMobile() {
    return window.matchMedia('(max-width: 767px)').matches;
  }

  function initStrip(root) {
    if (!root || root.dataset.uspInit === 'true') return;
    if (root.getAttribute('data-auto-scroll') !== 'true') return;
    if (root.getAttribute('data-mobile-layout') !== 'scroll') return;

    var list = root.querySelector('.scale-o-usp-strip__list');
    if (!list) return;

    root.dataset.uspInit = 'true';

    var timer = null;
    var paused = false;
    var resumeTimeout = null;
    var intervalMs = 3200;

    function clearTimer() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function pause() {
      paused = true;
      clearTimer();
      if (resumeTimeout) clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(function () {
        paused = false;
        start();
      }, 5000);
    }

    function next() {
      if (paused || prefersReducedMotion() || !isMobile()) return;

      var items = list.querySelectorAll('.scale-o-usp-strip__item');
      if (items.length < 2) return;

      var maxScroll = list.scrollWidth - list.clientWidth;
      if (maxScroll <= 0) return;

      var itemWidth = items[0].offsetWidth;
      var nextLeft = list.scrollLeft + itemWidth;

      if (nextLeft >= maxScroll - 4) {
        list.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        list.scrollBy({ left: itemWidth, behavior: 'smooth' });
      }
    }

    function start() {
      clearTimer();
      if (prefersReducedMotion() || !isMobile() || paused) return;
      timer = setInterval(next, intervalMs);
    }

    ['touchstart', 'wheel', 'pointerdown', 'keydown'].forEach(function (evt) {
      list.addEventListener(evt, pause, { passive: true });
    });

    window.addEventListener(
      'resize',
      function () {
        if (!isMobile()) {
          clearTimer();
        } else if (!paused) {
          start();
        }
      },
      { passive: true }
    );

    start();
  }

  function boot() {
    document.querySelectorAll('.scale-o-usp-strip[data-auto-scroll="true"]').forEach(initStrip);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('shopify:section:load', function (event) {
    var section = event.target;
    if (!section) return;
    var strip = section.querySelector('.scale-o-usp-strip');
    if (strip) {
      strip.dataset.uspInit = 'false';
      initStrip(strip);
    }
  });
})();
