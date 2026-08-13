/**
 * Scale-O News & Media — lightweight carousel
 */
(function () {
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)');

  function visibleCount(root) {
    var w = window.innerWidth;
    if (w >= 1024) return parseInt(root.dataset.desktopCards, 10) || 4;
    if (w >= 768) return parseInt(root.dataset.tabletCards, 10) || 2;
    return parseInt(root.dataset.mobileCards, 10) || 1;
  }

  function stepWidth(track, card) {
    if (!card) return 0;
    var styles = window.getComputedStyle(track);
    var gap = parseFloat(styles.columnGap || styles.gap) || 0;
    return card.getBoundingClientRect().width + gap;
  }

  function init(root) {
    if (!root || root.dataset.snmInit === 'true') return;
    root.dataset.snmInit = 'true';

    var track = root.querySelector('[data-snm-track]');
    var viewport = root.querySelector('[data-snm-viewport]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-snm-card]'));
    var prev = root.querySelector('[data-snm-prev]');
    var next = root.querySelector('[data-snm-next]');
    var dotsWrap = root.querySelector('[data-snm-dots]');
    var loop = root.dataset.loop === 'true';
    var swipeOn = root.dataset.swipe !== 'false';
    var index = 0;
    var timer = null;
    var hovered = false;

    if (!track || !cards.length) return;

    function maxIndex() {
      return Math.max(0, cards.length - visibleCount(root));
    }

    function renderDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      var pages = maxIndex() + 1;
      if (pages <= 1) {
        dotsWrap.hidden = true;
        return;
      }
      dotsWrap.hidden = false;
      for (var i = 0; i < pages; i += 1) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'scale-o-nm__dot' + (i === index ? ' is-active' : '');
        btn.setAttribute('aria-label', 'Go to media group ' + (i + 1));
        btn.addEventListener('click', function (page) {
          return function () { go(page); startTimer(); };
        }(i));
        dotsWrap.appendChild(btn);
      }
    }

    function go(nextIndex) {
      var max = maxIndex();
      if (loop && cards.length > visibleCount(root)) {
        if (nextIndex < 0) nextIndex = max;
        else if (nextIndex > max) nextIndex = 0;
      }
      index = Math.min(Math.max(nextIndex, 0), max);
      var x = stepWidth(track, cards[0]) * index;
      track.style.transform = 'translateX(' + (-x) + 'px)';
      if (prev) {
        prev.disabled = !loop && index <= 0;
        prev.setAttribute('aria-disabled', prev.disabled ? 'true' : 'false');
      }
      if (next) {
        next.disabled = !loop && index >= max;
        next.setAttribute('aria-disabled', next.disabled ? 'true' : 'false');
      }
      renderDots();
    }

    function startTimer() {
      stopTimer();
      if (root.dataset.autoplay !== 'true' || REDUCE.matches || cards.length <= visibleCount(root)) return;
      timer = window.setInterval(function () {
        if (hovered) return;
        go(index >= maxIndex() ? 0 : index + 1);
      }, parseInt(root.dataset.interval, 10) || 5000);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) prev.addEventListener('click', function () { go(index - 1); startTimer(); });
    if (next) next.addEventListener('click', function () { go(index + 1); startTimer(); });

    if (swipeOn && viewport) {
      var startX = 0;
      var dragging = false;

      viewport.addEventListener('touchstart', function (event) {
        startX = event.changedTouches[0].clientX;
      }, { passive: true });
      viewport.addEventListener('touchend', function (event) {
        var dx = event.changedTouches[0].clientX - startX;
        if (Math.abs(dx) < 40) return;
        if (dx < 0) go(index + 1);
        else go(index - 1);
        startTimer();
      }, { passive: true });

      viewport.addEventListener('pointerdown', function (event) {
        if (event.pointerType === 'touch') return;
        dragging = true;
        startX = event.clientX;
      });
      viewport.addEventListener('pointerup', function (event) {
        if (!dragging) return;
        dragging = false;
        var dx = event.clientX - startX;
        if (Math.abs(dx) < 40) return;
        if (dx < 0) go(index + 1);
        else go(index - 1);
        startTimer();
      });
    }

    root.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') { event.preventDefault(); go(index - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); go(index + 1); }
    });

    root.addEventListener('mouseenter', function () { hovered = true; });
    root.addEventListener('mouseleave', function () { hovered = false; });

    window.addEventListener('resize', function () { go(index); });

    go(0);
    startTimer();
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

  document.addEventListener('shopify:section:unload', function (event) {
    var root = event.target.querySelector('[data-scale-o-nm]');
    if (root) root.dataset.snmInit = '';
  });
})();
