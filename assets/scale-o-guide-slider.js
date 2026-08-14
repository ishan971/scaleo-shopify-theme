(function () {
  function SwiperCtor() {
    if (window.MinimogLibs && window.MinimogLibs.Swiper) return window.MinimogLibs.Swiper;
    if (window.Swiper) return window.Swiper;
    return null;
  }

  function setActiveTab(root, index) {
    root.querySelectorAll('[data-sogs-tab]').forEach(function (tab, i) {
      var on = i === index;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-current', on ? 'true' : 'false');
    });
    root.querySelectorAll('.scale-o-guide-slider__slide').forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === index);
    });
  }

  function fallbackOffset(root, index, slides) {
    var stage = root.querySelector('[data-sogs-swiper]');
    var slide = slides[index];
    if (!stage || !slide) return 0;
    var stageW = stage.clientWidth;
    var slideW = slide.getBoundingClientRect().width;
    var gap = 48;
    return (stageW - slideW) / 2 - index * (slideW + gap);
  }

  function initFallback(root, slides) {
    root.classList.add('is-fallback');
    var wrapper = root.querySelector('.swiper-wrapper');
    var index = 0;
    var autoplay = root.getAttribute('data-autoplay') === 'true';
    var delay = Number(root.getAttribute('data-interval')) || 5000;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var timer = null;

    function go(next) {
      index = (next + slides.length) % slides.length;
      wrapper.style.transform = 'translate3d(' + fallbackOffset(root, index, slides) + 'px,0,0)';
      setActiveTab(root, index);
    }

    function start() {
      stop();
      if (!autoplay || reduce) return;
      timer = setInterval(function () { go(index + 1); }, delay);
    }

    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    root.querySelectorAll('[data-sogs-prev]').forEach(function (btn) {
      btn.addEventListener('click', function () { go(index - 1); start(); });
    });
    root.querySelectorAll('[data-sogs-next]').forEach(function (btn) {
      btn.addEventListener('click', function () { go(index + 1); start(); });
    });
    root.querySelectorAll('[data-sogs-tab]').forEach(function (tab, i) {
      tab.addEventListener('click', function () { go(i); start(); });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    window.addEventListener('resize', function () { go(index); });
    go(0);
    start();
  }

  function init(root) {
    if (!root || root.dataset.sogsInit === 'true') return;
    var container = root.querySelector('[data-sogs-swiper]');
    var slides = root.querySelectorAll('.swiper-slide');
    if (!container || slides.length < 1) return;
    root.dataset.sogsInit = 'true';

    if (slides.length === 1) {
      slides[0].classList.add('swiper-slide-active', 'is-active');
      setActiveTab(root, 0);
      return;
    }

    var Ctor = SwiperCtor();
    var autoplay = root.getAttribute('data-autoplay') === 'true';
    var delay = Number(root.getAttribute('data-interval')) || 6000;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (Ctor) {
      var slider = new Ctor(container, {
        slidesPerView: 'auto',
        centeredSlides: true,
        spaceBetween: 48,
        loop: true,
        speed: 500,
        watchSlidesProgress: true,
        autoplay: autoplay && !reduce ? { delay: delay, disableOnInteraction: false, pauseOnMouseEnter: true } : false,
        navigation: {
          nextEl: root.querySelector('[data-sogs-next]'),
          prevEl: root.querySelector('[data-sogs-prev]')
        },
        pagination: {
          el: root.querySelector('[data-sogs-pagination]'),
          type: 'progressbar'
        },
        a11y: true,
        keyboard: { enabled: true },
        on: {
          slideChange: function () {
            var real = typeof this.realIndex === 'number' ? this.realIndex : this.activeIndex;
            setActiveTab(root, real);
          }
        }
      });
      root._sogsSlider = slider;
      if (autoplay && !reduce && slider.autoplay) {
        root.addEventListener('mouseenter', function () {
          if (slider.autoplay.stop) slider.autoplay.stop();
        });
        root.addEventListener('mouseleave', function () {
          if (slider.autoplay.start) slider.autoplay.start();
        });
      }
      container.querySelectorAll('img').forEach(function (img) {
        if (img.complete) return;
        img.addEventListener('load', function () {
          if (slider.update) slider.update();
        });
      });
      root.querySelectorAll('[data-sogs-tab]').forEach(function (tab, i) {
        tab.addEventListener('click', function () {
          if (slider.slideToLoop) slider.slideToLoop(i);
          else slider.slideTo(i);
        });
      });
      return;
    }

    initFallback(root, Array.prototype.slice.call(slides));
  }

  function boot() {
    document.querySelectorAll('[data-sogs-root]').forEach(init);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  document.addEventListener('shopify:section:load', function () {
    document.querySelectorAll('[data-sogs-root]').forEach(function (root) {
      delete root.dataset.sogsInit;
    });
    boot();
  });
})();
