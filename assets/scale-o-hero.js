/**
 * Scale-O Hero — lightweight 1-up slider
 */
(function () {
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)');

  function init(root) {
    if (!root || root.dataset.sohInit === 'true') return;
    root.dataset.sohInit = 'true';

    var track = root.querySelector('[data-soh-track]');
    var viewport = root.querySelector('[data-soh-viewport]');
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-soh-slide]'));
    var prev = root.querySelector('[data-soh-prev]');
    var next = root.querySelector('[data-soh-next]');
    var dotsWrap = root.querySelector('[data-soh-dots]');
    var live = root.querySelector('[data-soh-live]');
    var index = 0;
    var timer = null;
    var hovered = false;
    var interacting = false;

    if (!track || slides.length < 1) return;

    function maxIndex() {
      return Math.max(0, slides.length - 1);
    }

    function renderDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      if (slides.length < 2) {
        dotsWrap.hidden = true;
        return;
      }
      dotsWrap.hidden = false;
      slides.forEach(function (_, i) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'scale-o-hero__dot' + (i === index ? ' is-active' : '');
        btn.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        btn.setAttribute('aria-current', i === index ? 'true' : 'false');
        btn.addEventListener('click', function () {
          interacting = true;
          go(i);
          startTimer();
        });
        dotsWrap.appendChild(btn);
      });
    }

    function go(nextIndex) {
      var max = maxIndex();
      if (nextIndex < 0) nextIndex = max;
      else if (nextIndex > max) nextIndex = 0;
      index = nextIndex;
      track.style.transform = 'translateX(' + (-index * 100) + '%)';
      slides.forEach(function (slide, i) {
        slide.setAttribute('aria-hidden', i === index ? 'false' : 'true');
      });
      if (prev) prev.disabled = slides.length < 2;
      if (next) next.disabled = slides.length < 2;
      if (live) live.textContent = 'Slide ' + (index + 1) + ' of ' + slides.length;
      renderDots();
    }

    function startTimer() {
      stopTimer();
      if (root.dataset.autoplay !== 'true' || REDUCE.matches || slides.length < 2) return;
      timer = window.setInterval(function () {
        if (hovered || interacting) return;
        go(index + 1);
      }, parseInt(root.dataset.interval, 10) || 5000);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) prev.addEventListener('click', function () { interacting = true; go(index - 1); startTimer(); });
    if (next) next.addEventListener('click', function () { interacting = true; go(index + 1); startTimer(); });

    if (viewport) {
      var startX = 0;
      viewport.addEventListener('touchstart', function (event) {
        startX = event.changedTouches[0].clientX;
      }, { passive: true });
      viewport.addEventListener('touchend', function (event) {
        var dx = event.changedTouches[0].clientX - startX;
        if (Math.abs(dx) < 40 || slides.length < 2) return;
        interacting = true;
        if (dx < 0) go(index + 1);
        else go(index - 1);
        startTimer();
      }, { passive: true });
    }

    root.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') { event.preventDefault(); interacting = true; go(index - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); interacting = true; go(index + 1); }
    });

    var designMode = window.Shopify && window.Shopify.designMode;
    if (!designMode) {
      root.addEventListener('mouseenter', function () { hovered = true; });
      root.addEventListener('mouseleave', function () { hovered = false; interacting = false; });
      root.addEventListener('focusin', function () { hovered = true; });
      root.addEventListener('focusout', function () { hovered = false; });
    }

    if (REDUCE.matches) track.style.transition = 'none';

    go(0);
    startTimer();
  }

  function scan() {
    document.querySelectorAll('[data-scale-o-hero]').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scan);
  } else {
    scan();
  }

  document.addEventListener('shopify:section:load', function (event) {
    var root = event.target.querySelector('[data-scale-o-hero]');
    if (root) {
      root.dataset.sohInit = '';
      init(root);
    }
  });

  document.addEventListener('shopify:section:unload', function (event) {
    var root = event.target.querySelector('[data-scale-o-hero]');
    if (root) root.dataset.sohInit = '';
  });
})();
