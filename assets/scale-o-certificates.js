/**
 * Scale-O Certifications — carousel + document lightbox
 */
(function () {
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)');

  function visibleCount(root) {
    var w = window.innerWidth;
    if (w >= 1024) return 99;
    if (w >= 768) return parseInt(root.dataset.tabletCards, 10) || 2;
    return 1;
  }

  function stepWidth(track, card) {
    if (!card) return 0;
    var gap = parseFloat(window.getComputedStyle(track).columnGap || window.getComputedStyle(track).gap) || 0;
    return card.getBoundingClientRect().width + gap;
  }

  function init(root) {
    if (!root || root.dataset.socInit === 'true') return;
    root.dataset.socInit = 'true';

    var track = root.querySelector('[data-soc-track]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-soc-card]'));
    var prev = root.querySelector('[data-soc-prev]');
    var next = root.querySelector('[data-soc-next]');
    var dotsWrap = root.querySelector('[data-soc-dots]');
    var lightbox = root.querySelector('[data-soc-lightbox]');
    var lightboxImg = root.querySelector('[data-soc-lightbox-img]');
    var lightboxCaption = root.querySelector('[data-soc-lightbox-caption]');
    var lightboxClose = root.querySelectorAll('[data-soc-lightbox-close]');
    var lightboxPrev = root.querySelector('[data-soc-lightbox-prev]');
    var lightboxNext = root.querySelector('[data-soc-lightbox-next]');
    var index = 0;
    var lightboxIndex = 0;
    var lastFocus = null;
    var carouselOn = root.dataset.carousel !== 'false';
    var lightboxOn = root.dataset.lightbox !== 'false';

    var animItems = root.querySelectorAll('[data-soc-animate]');
    if (animItems.length) {
      if (root.dataset.animate !== 'true' || REDUCE.matches || !('IntersectionObserver' in window)) {
        animItems.forEach(function (el) { el.classList.add('is-visible'); });
      } else {
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.12 });
        animItems.forEach(function (el) { observer.observe(el); });
      }
    }

    function maxIndex() {
      return Math.max(0, cards.length - visibleCount(root));
    }

    function renderDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      var pages = maxIndex() + 1;
      if (!carouselOn || pages <= 1) {
        dotsWrap.hidden = true;
        return;
      }
      dotsWrap.hidden = false;
      for (var i = 0; i < pages; i++) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'scale-o-cert__dot' + (i === index ? ' is-active' : '');
        btn.setAttribute('aria-label', 'Show certificates group ' + (i + 1));
        btn.addEventListener('click', function (page) {
          return function () { go(page); };
        }(i));
        dotsWrap.appendChild(btn);
      }
    }

    function go(nextIndex) {
      if (!track || !cards.length || !carouselOn) return;
      index = Math.max(0, Math.min(nextIndex, maxIndex()));
      var card = cards[0];
      var x = stepWidth(track, card) * index;
      track.style.transform = 'translateX(' + (-x) + 'px)';
      if (prev) prev.disabled = index <= 0;
      if (next) next.disabled = index >= maxIndex();
      if (dotsWrap) {
        Array.prototype.forEach.call(dotsWrap.children, function (dot, i) {
          dot.classList.toggle('is-active', i === index);
        });
      }
    }

    function previewCards() {
      return cards.filter(function (card) { return card.dataset.fullSrc; });
    }

    function showLightbox(startCard) {
      if (!lightboxOn || !lightbox || !lightboxImg) return;
      var list = previewCards();
      lightboxIndex = Math.max(0, list.indexOf(startCard));
      if (!list.length) return;
      lastFocus = document.activeElement;
      renderLightbox();
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      var closeBtn = lightbox.querySelector('[data-soc-lightbox-close]');
      if (closeBtn) closeBtn.focus();
    }

    function renderLightbox() {
      var list = previewCards();
      var card = list[lightboxIndex];
      if (!card) return;
      lightboxImg.src = card.dataset.fullSrc;
      lightboxImg.alt = card.dataset.fullAlt || 'Certificate';
      if (lightboxCaption) {
        var title = card.dataset.fullTitle || '';
        lightboxCaption.textContent = title;
        lightboxCaption.hidden = !title;
      }
      var many = list.length > 1;
      if (lightboxPrev) lightboxPrev.hidden = !many;
      if (lightboxNext) lightboxNext.hidden = !many;
    }

    function closeLightbox() {
      if (!lightbox || lightbox.hidden) return;
      lightbox.hidden = true;
      if (lightboxImg) lightboxImg.removeAttribute('src');
      document.body.style.overflow = '';
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    }

    function stepLightbox(delta) {
      var list = previewCards();
      if (!list.length) return;
      lightboxIndex = (lightboxIndex + delta + list.length) % list.length;
      renderLightbox();
    }

    cards.forEach(function (card) {
      card.querySelectorAll('[data-soc-open]').forEach(function (trigger) {
        trigger.addEventListener('click', function (event) {
          if (trigger.tagName === 'A' && trigger.getAttribute('href') && trigger.getAttribute('href') !== '#') return;
          event.preventDefault();
          showLightbox(card);
        });
      });
    });

    if (carouselOn) {
      if (prev) prev.addEventListener('click', function () { go(index - 1); });
      if (next) next.addEventListener('click', function () { go(index + 1); });

      var viewport = root.querySelector('[data-soc-viewport]');
      var touchStartX = 0;
      if (viewport) {
        viewport.addEventListener('touchstart', function (event) {
          touchStartX = event.changedTouches[0].clientX;
        }, { passive: true });
        viewport.addEventListener('touchend', function (event) {
          var dx = event.changedTouches[0].clientX - touchStartX;
          if (Math.abs(dx) < 40) return;
          if (dx < 0) go(index + 1);
          else go(index - 1);
        }, { passive: true });
      }

      root.addEventListener('keydown', function (event) {
        if (lightbox && !lightbox.hidden) return;
        if (event.key === 'ArrowLeft') go(index - 1);
        if (event.key === 'ArrowRight') go(index + 1);
      });

      window.addEventListener('resize', function () { go(index); renderDots(); });
      renderDots();
      go(0);
    } else {
      if (prev) prev.hidden = true;
      if (next) next.hidden = true;
      if (dotsWrap) dotsWrap.hidden = true;
    }

    lightboxClose.forEach(function (btn) {
      btn.addEventListener('click', closeLightbox);
    });
    if (lightbox) {
      lightbox.addEventListener('click', function (event) {
        if (event.target === lightbox) closeLightbox();
      });
    }
    if (lightboxPrev) lightboxPrev.addEventListener('click', function () { stepLightbox(-1); });
    if (lightboxNext) lightboxNext.addEventListener('click', function () { stepLightbox(1); });

    document.addEventListener('keydown', function (event) {
      if (!lightbox || lightbox.hidden) return;
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowLeft') stepLightbox(-1);
      if (event.key === 'ArrowRight') stepLightbox(1);
    });
  }

  function boot() {
    document.querySelectorAll('.scale-o-cert').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('shopify:section:load', function (event) {
    var root = event.target && event.target.querySelector('.scale-o-cert');
    if (root) {
      root.dataset.socInit = 'false';
      init(root);
    }
  });

  document.addEventListener('shopify:section:unload', function (event) {
    var root = event.target && event.target.querySelector('.scale-o-cert');
    if (root) document.body.style.overflow = '';
  });
})();
