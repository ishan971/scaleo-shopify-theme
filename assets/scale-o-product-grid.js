/**
 * Scale-O Shop by Products — optional carousel
 */
(function () {
  function getCols(root) {
    var w = window.innerWidth;
    if (w >= 1024) return parseInt(root.dataset.colsDesktop, 10) || 4;
    if (w >= 768) return parseInt(root.dataset.colsTablet, 10) || 2;
    return parseInt(root.dataset.colsMobile, 10) || 1;
  }

  function initCarousel(root) {
    if (!root || root.dataset.carouselInit === 'true') return;
    if (root.dataset.displayMode !== 'carousel') return;

    var viewport = root.querySelector('[data-product-grid-viewport]');
    var track = root.querySelector('[data-product-grid-track]');
    var slides = track ? track.querySelectorAll('[data-product-grid-slide]') : [];
    var prev = root.querySelector('[data-product-grid-prev]');
    var next = root.querySelector('[data-product-grid-next]');
    var dotsWrap = root.querySelector('[data-product-grid-dots]');

    if (!viewport || !track || slides.length === 0) return;

    root.dataset.carouselInit = 'true';

    var page = 0;
    var cols = getCols(root);
    var totalPages = Math.max(1, Math.ceil(slides.length / cols));

    function updateStaticState() {
      if (slides.length <= cols) {
        root.classList.add('is-static');
        track.style.transform = 'none';
        return true;
      }
      root.classList.remove('is-static');
      return false;
    }

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      for (var i = 0; i < totalPages; i++) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'scale-o-product-grid__dot' + (i === page ? ' is-active' : '');
        dot.setAttribute('aria-label', 'Go to slide group ' + (i + 1));
        (function (idx) {
          dot.addEventListener('click', function () {
            page = idx;
            render();
          });
        })(i);
        dotsWrap.appendChild(dot);
      }
    }

    function render() {
      cols = getCols(root);
      totalPages = Math.max(1, Math.ceil(slides.length / cols));
      if (page >= totalPages) page = totalPages - 1;

      if (updateStaticState()) return;

      var slideWidth = slides[0].getBoundingClientRect().width;
      var gap = parseFloat(getComputedStyle(track).gap) || 0;
      var offset = page * cols * (slideWidth + gap);
      track.style.transform = 'translate3d(-' + offset + 'px, 0, 0)';

      if (dotsWrap) {
        var dots = dotsWrap.querySelectorAll('.scale-o-product-grid__dot');
        dots.forEach(function (dot, idx) {
          dot.classList.toggle('is-active', idx === page);
        });
      }

      if (prev) prev.disabled = page === 0;
      if (next) next.disabled = page >= totalPages - 1;
    }

    function go(delta) {
      page = Math.max(0, Math.min(totalPages - 1, page + delta));
      render();
    }

    if (prev) prev.addEventListener('click', function () { go(-1); });
    if (next) next.addEventListener('click', function () { go(1); });

    buildDots();
    render();

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        buildDots();
        render();
      }, 150);
    });
  }

  function boot() {
    document.querySelectorAll('.scale-o-product-grid').forEach(initCarousel);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('shopify:section:load', function (event) {
    var root = event.target && event.target.querySelector('.scale-o-product-grid');
    if (root) {
      root.dataset.carouselInit = 'false';
      initCarousel(root);
    }
  });
})();
