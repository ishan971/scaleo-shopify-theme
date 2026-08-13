/**
 * Scale-O Solution — subtle reveal on scroll
 */
(function () {
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)');

  function init(root) {
    if (!root || root.dataset.sosInit === 'true') return;
    root.dataset.sosInit = 'true';

    if (root.dataset.animate !== 'true' || REDUCE.matches) {
      root.querySelectorAll('[data-sos-animate]').forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var items = root.querySelectorAll('[data-sos-animate]');
    if (!items.length || !('IntersectionObserver' in window)) {
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
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

    items.forEach(function (el, index) {
      el.style.transitionDelay = Math.min(index * 60, 360) + 'ms';
      observer.observe(el);
    });
  }

  function boot() {
    document.querySelectorAll('.scale-o-solution').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('shopify:section:load', function (event) {
    var root = event.target && event.target.querySelector('.scale-o-solution');
    if (root) {
      root.dataset.sosInit = 'false';
      init(root);
    }
  });
})();
