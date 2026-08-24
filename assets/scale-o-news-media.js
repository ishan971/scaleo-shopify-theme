/**
 * Scale-O News & Media — infinite logo marquee
 */
(function () {
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)');

  function init(root) {
    if (!root || root.dataset.snmInit === 'true') return;
    root.dataset.snmInit = 'true';

    var track = root.querySelector('[data-snm-track]');
    if (!track) return;

    if (REDUCE.matches || root.dataset.marquee !== 'true') {
      track.style.animation = 'none';
    }
  }

  function scan() {
    document.querySelectorAll('[data-scale-o-nm]').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scan);
  } else {
    scan();
  }

  document.addEventListener('shopify:section:load', function (event) {
    var root = event.target.querySelector('[data-scale-o-nm]');
    if (root) {
      root.dataset.snmInit = '';
      init(root);
    }
  });
})();
