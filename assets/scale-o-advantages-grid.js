/**
 * Scale-O People & Property grid — reveal only
 */
(function () {
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)');

  function initReveal(root) {
    var items = root.querySelectorAll('[data-sag-animate]');
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
    }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });

    items.forEach(function (el, index) {
      el.style.transitionDelay = Math.min(index * 40, 280) + 'ms';
      observer.observe(el);
    });
  }

  function init(root) {
    if (!root || root.dataset.sagReady === 'true') return;
    root.dataset.sagReady = 'true';
    initReveal(root);
  }

  function boot() {
    document.querySelectorAll('.scale-o-adv-grid').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('shopify:section:load', function (event) {
    var root = event.target && event.target.querySelector('.scale-o-adv-grid');
    if (root) {
      delete root.dataset.sagReady;
      init(root);
    }
  });
})();
