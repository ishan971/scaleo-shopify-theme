/**
 * Scale-O results gallery — infinite marquee + header reveal
 * Seamless loop via duplicated sets + translateX(-50%).
 * Pauses on hover / focus / touch for a clean mobile feel.
 */
(function () {
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)');

  function initReveal(root) {
    var items = root.querySelectorAll('[data-srg-animate]');
    if (!items.length) return;

    if (root.dataset.animate !== 'true' || REDUCE.matches || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    items.forEach(function (el, index) {
      el.style.transitionDelay = Math.min(index * 60, 240) + 'ms';
      observer.observe(el);
    });
  }

  function initMarquee(root) {
    var marquee = root.querySelector('[data-srg-marquee]');
    if (!marquee) return;

    if (root.dataset.marquee !== 'true' || REDUCE.matches) {
      root.classList.add('is-static');
      return;
    }

    var pauseCount = 0;

    function pause() {
      pauseCount += 1;
      root.classList.add('is-paused');
    }

    function resume() {
      pauseCount = Math.max(0, pauseCount - 1);
      if (pauseCount === 0) root.classList.remove('is-paused');
    }

    marquee.addEventListener('mouseenter', pause);
    marquee.addEventListener('mouseleave', resume);
    marquee.addEventListener('focusin', pause);
    marquee.addEventListener('focusout', function (event) {
      if (!marquee.contains(event.relatedTarget)) resume();
    });

    var touchTimer = null;
    marquee.addEventListener('touchstart', function () {
      pause();
      if (touchTimer) clearTimeout(touchTimer);
    }, { passive: true });

    marquee.addEventListener('touchend', function () {
      if (touchTimer) clearTimeout(touchTimer);
      touchTimer = setTimeout(resume, 1200);
    }, { passive: true });

    marquee.addEventListener('touchcancel', function () {
      if (touchTimer) clearTimeout(touchTimer);
      touchTimer = setTimeout(resume, 400);
    }, { passive: true });

    // Pause when tab is hidden to avoid jump on return
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        root.classList.add('is-paused');
      } else if (pauseCount === 0) {
        root.classList.remove('is-paused');
      }
    });
  }

  function init(root) {
    if (!root || root.dataset.srgInit === 'true') return;
    root.dataset.srgInit = 'true';
    initReveal(root);
    initMarquee(root);
  }

  function boot() {
    document.querySelectorAll('.scale-o-results').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('shopify:section:load', function (event) {
    var root = event.target && event.target.querySelector('.scale-o-results');
    if (root) {
      delete root.dataset.srgInit;
      init(root);
    }
  });
})();
