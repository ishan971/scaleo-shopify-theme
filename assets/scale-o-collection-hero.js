(function () {
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)');

  function init(root) {
    if (!root || root.dataset.sochInit === 'true') return;
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-soch-slide]'));
    if (!slides.length) slides = Array.prototype.slice.call(root.querySelectorAll('[data-soch-bg]'));
    if (slides.length < 2) return;
    root.dataset.sochInit = 'true';

    var dotsWrap = root.querySelector('[data-soch-dots]');
    var live = root.querySelector('[data-soch-live]');
    var prev = root.querySelector('[data-soch-prev]');
    var next = root.querySelector('[data-soch-next]');
    var index = 0;
    var timer = null;
    var autoplay = root.getAttribute('data-autoplay') === 'true' && !REDUCE.matches;
    var interval = Number(root.getAttribute('data-interval')) || 5000;

    function go(nextIndex) {
      slides[index].classList.remove('is-active');
      slides[index].setAttribute('aria-hidden', 'true');
      if (dotsWrap && dotsWrap.children[index]) {
        dotsWrap.children[index].classList.remove('is-active');
        dotsWrap.children[index].setAttribute('aria-current', 'false');
      }
      index = (nextIndex + slides.length) % slides.length;
      slides[index].classList.add('is-active');
      slides[index].setAttribute('aria-hidden', 'false');
      if (dotsWrap && dotsWrap.children[index]) {
        dotsWrap.children[index].classList.add('is-active');
        dotsWrap.children[index].setAttribute('aria-current', 'true');
      }
      if (live) live.textContent = 'Slide ' + (index + 1) + ' of ' + slides.length;
    }

    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      slides.forEach(function (_, i) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'scale-o-collection-hero__dot' + (i === 0 ? ' is-active' : '');
        btn.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        btn.setAttribute('aria-current', i === 0 ? 'true' : 'false');
        btn.addEventListener('click', function () {
          go(i);
          start();
        });
        dotsWrap.appendChild(btn);
      });
    }

    if (prev) prev.addEventListener('click', function () { go(index - 1); start(); });
    if (next) next.addEventListener('click', function () { go(index + 1); start(); });

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
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', start);
    start();
  }

  function boot() {
    document.querySelectorAll('[data-soch-hero]').forEach(function (el) {
      delete el.dataset.sochInit;
      init(el);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  document.addEventListener('shopify:section:load', boot);
  document.addEventListener('shopify:section:reorder', boot);
  document.addEventListener('shopify:block:select', function (event) {
    var slide = event.target.closest('[data-soch-slide]');
    var root = event.target.closest('[data-soch-hero]');
    if (!slide || !root) return;
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-soch-slide]'));
    var idx = slides.indexOf(slide);
    if (idx < 0) return;
    slides.forEach(function (el, i) {
      el.classList.toggle('is-active', i === idx);
      el.setAttribute('aria-hidden', i === idx ? 'false' : 'true');
    });
  });
})();
