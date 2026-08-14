/**
 * Scale-O Hero — looping 1-up slider (continuous right-to-left)
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
    var position = 0;
    var timer = null;
    var hovered = false;
    var interacting = false;
    var looping = slides.length > 1;

    if (!track || slides.length < 1) return;

    if (looping) {
      var lastClone = slides[slides.length - 1].cloneNode(true);
      var firstClone = slides[0].cloneNode(true);
      [lastClone, firstClone].forEach(function (clone) {
        clone.removeAttribute('data-soh-slide');
        clone.removeAttribute('id');
        clone.setAttribute('aria-hidden', 'true');
        clone.classList.add('is-clone');
        clone.querySelectorAll('[id]').forEach(function (el) { el.removeAttribute('id'); });
      });
      track.insertBefore(lastClone, slides[0]);
      track.appendChild(firstClone);
      position = 1;
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
          if (looping && index === slides.length - 1 && i === 0) go(slides.length);
          else go(i);
          startTimer();
        });
        dotsWrap.appendChild(btn);
      });
    }

    function updateUI() {
      slides.forEach(function (slide, i) {
        slide.setAttribute('aria-hidden', i === index ? 'false' : 'true');
      });
      if (prev) prev.disabled = slides.length < 2;
      if (next) next.disabled = slides.length < 2;
      if (live) live.textContent = 'Slide ' + (index + 1) + ' of ' + slides.length;
      renderDots();
    }

    function apply(instant) {
      var none = REDUCE.matches || instant;
      track.style.transition = none ? 'none' : 'transform 0.55s ease';
      track.style.transform = 'translateX(' + (-position * 100) + '%)';
      if (instant) {
        track.offsetHeight;
        if (!REDUCE.matches) track.style.transition = 'transform 0.55s ease';
      }
    }

    function go(nextIndex, instant) {
      if (slides.length < 2) {
        index = 0;
        position = 0;
        apply(true);
        updateUI();
        return;
      }

      if (looping && nextIndex > slides.length - 1) {
        index = 0;
        position = slides.length + 1;
        apply(false);
        updateUI();
        return;
      }

      if (looping && nextIndex < 0) {
        index = slides.length - 1;
        position = 0;
        apply(false);
        updateUI();
        return;
      }

      if (nextIndex < 0) nextIndex = slides.length - 1;
      else if (nextIndex > slides.length - 1) nextIndex = 0;

      index = nextIndex;
      position = looping ? nextIndex + 1 : nextIndex;
      apply(!!instant);
      updateUI();
    }

    track.addEventListener('transitionend', function (event) {
      if (event.target !== track) return;
      if (event.propertyName && event.propertyName !== 'transform') return;
      if (!looping) return;
      if (position === slides.length + 1) {
        position = 1;
        apply(true);
      } else if (position === 0) {
        position = slides.length;
        apply(true);
      }
    });

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

    go(0, true);
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
