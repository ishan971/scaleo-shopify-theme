(function () {
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)');

  function init(root) {
    if (!root || root.dataset.sochInit === 'true') return;
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-soch-bg]'));
    if (slides.length < 2) return;
    root.dataset.sochInit = 'true';

    var dotsWrap = root.querySelector('[data-soch-dots]');
    var index = 0;
    var timer = null;
    var autoplay = root.getAttribute('data-autoplay') === 'true' && !REDUCE.matches;
    var interval = Number(root.getAttribute('data-interval')) || 5000;

    function go(next) {
      slides[index].classList.remove('is-active');
      if (dotsWrap && dotsWrap.children[index]) dotsWrap.children[index].classList.remove('is-active');
      index = (next + slides.length) % slides.length;
      slides[index].classList.add('is-active');
      if (dotsWrap && dotsWrap.children[index]) dotsWrap.children[index].classList.add('is-active');
    }

    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      slides.forEach(function (_, i) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'scale-o-collection-hero__dot' + (i === 0 ? ' is-active' : '');
        btn.setAttribute('aria-label', 'Show background ' + (i + 1));
        btn.addEventListener('click', function () {
          go(i);
          start();
        });
        dotsWrap.appendChild(btn);
      });
    }

    function start() {
      stop();
      if (!autoplay) return;
      timer = setInterval(function () {
        go(index + 1);
      }, interval);
    }

    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();
  }

  function boot() {
    document.querySelectorAll('[data-soch-hero]').forEach(init);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  document.addEventListener('shopify:section:load', boot);
})();
