/**
 * Scale-O results gallery — reveal
 */
(function () {
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)');

  function init(root) {
    if (!root || root.dataset.srgInit === 'true') return;
    root.dataset.srgInit = 'true';

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
    if (root) init(root);
  });
})();
