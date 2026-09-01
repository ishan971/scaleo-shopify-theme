/**
 * Scale-O Premium Reviews — custom UI + Judge.me data bridge
 */
(function () {
  var ROOT_SEL = '[data-scale-o-reviews]';
  var PER_PAGE = 3;
  var MAX_WAIT = 12000;
  var POLL = 250;

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  }

  function imgSrc(el) {
    if (!el) return '';
    return (
      el.getAttribute('src') ||
      el.getAttribute('data-src') ||
      el.getAttribute('data-lazy-src') ||
      el.currentSrc ||
      ''
    );
  }

  function pickReviewImage(item) {
    var selectors = [
      'img.jdgm-carousel-item__product-image',
      '.jdgm-carousel-item__product-image',
      'a.jdgm-carousel-item__product img',
      '.jdgm-carousel-item__product img',
      '.jdgm-carousel-item__review-image img',
      'a[href*="/products/"] img'
    ];

    for (var i = 0; i < selectors.length; i++) {
      var el = item.querySelector(selectors[i]);
      var src = imgSrc(el);
      if (src) return src;
    }

    var imgs = item.querySelectorAll('img');
    for (var j = 0; j < imgs.length; j++) {
      var candidate = imgSrc(imgs[j]);
      if (candidate && candidate.indexOf('icons8') === -1) return candidate;
    }

    return '';
  }

  function withDefaultThumb(reviews, defaultThumb) {
    if (!defaultThumb) return reviews;
    return reviews.map(function (review) {
      if (!review.image) review.image = defaultThumb;
      return review;
    });
  }

  function cardHtml(review) {
    var thumb = review.image
      ? '<span class="scale-o-reviews__card-thumb"><img src="' + esc(review.image) + '" alt="" width="40" height="40" loading="lazy" decoding="async"></span>'
      : '<span class="scale-o-reviews__card-thumb scale-o-reviews__card-thumb--placeholder" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 7.5h11v8H4v-8Z" stroke="currentColor" stroke-width="1.6"/><circle cx="7" cy="17" r="1.6" fill="currentColor"/></svg></span>';

    return (
      '<article class="scale-o-reviews__card" data-sor-card>' +
        '<span class="scale-o-reviews__quote" aria-hidden="true">' +
          '<svg width="36" height="28" viewBox="0 0 36 28" fill="none">' +
            '<path d="M0 28V16.8C0 10.08 2.24 5.04 6.72 1.68L10.08 5.6C8.4 7.28 7.28 8.96 6.72 10.64C6.16 12.32 5.88 14.56 5.88 17.36H10.08V28H0ZM22.32 28V16.8C22.32 10.08 24.56 5.04 29.04 1.68L32.4 5.6C30.72 7.28 29.6 8.96 29.04 10.64C28.48 12.32 28.2 14.56 28.2 17.36H32.4V28H22.32Z" fill="currentColor"/>' +
          '</svg>' +
        '</span>' +
        (review.title ? '<h3 class="scale-o-reviews__card-title">' + esc(review.title) + '</h3>' : '') +
        (review.body ? '<p class="scale-o-reviews__card-body">' + esc(review.body) + '</p>' : '') +
        '<div class="scale-o-reviews__card-foot">' +
          thumb +
          '<div class="scale-o-reviews__card-meta">' +
            (review.author ? '<span class="scale-o-reviews__card-author">' + esc(review.author) + '</span>' : '') +
            '<span class="scale-o-reviews__verified">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
                '<circle cx="12" cy="12" r="10" fill="currentColor"/>' +
                '<path d="M8 12.2 10.6 14.8 16.2 9.2" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
              '</svg>Verified Buyer' +
            '</span>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function parseJudgeMe(source) {
    var items = source.querySelectorAll('.jdgm-carousel-item');
    var reviews = [];

    items.forEach(function (item) {
      var titleEl = item.querySelector('.jdgm-carousel-item__review-title');
      var bodyEl = item.querySelector('.jdgm-carousel-item__review-body');
      var authorEl = item.querySelector('.jdgm-carousel-item__reviewer-name');

      var body = bodyEl ? bodyEl.textContent.trim() : '';
      var title = titleEl ? titleEl.textContent.trim() : '';
      var author = authorEl ? authorEl.textContent.trim() : '';
      var image = pickReviewImage(item);

      if (title || body) {
        reviews.push({ title: title, body: body, author: author, image: image });
      }
    });

    return reviews;
  }

  function parseFallback(root) {
    var nodes = root.querySelectorAll('[data-sor-fallback-review]');
    var reviews = [];
    nodes.forEach(function (node) {
      reviews.push({
        title: node.getAttribute('data-title') || '',
        body: node.getAttribute('data-body') || '',
        author: node.getAttribute('data-author') || '',
        image: node.getAttribute('data-image') || ''
      });
    });
    return reviews;
  }

  function buildPages(reviews, perPage) {
    var pages = [];
    for (var i = 0; i < reviews.length; i += perPage) {
      pages.push(reviews.slice(i, i + perPage));
    }
    return pages;
  }

  function initSlider(root) {
    if (root.dataset.scaleOReviewsInit === 'true') return;
    root.dataset.scaleOReviewsInit = 'true';

    var track = root.querySelector('[data-sor-track]');
    var dotsWrap = root.querySelector('[data-sor-dots]');
    var prevBtn = root.querySelector('[data-sor-prev]');
    var nextBtn = root.querySelector('[data-sor-next]');
    var source = root.querySelector('[data-sor-jm-source]');
    var perPage = parseInt(root.getAttribute('data-per-page'), 10) || PER_PAGE;
    var defaultThumb = root.getAttribute('data-default-thumb') || '';

    if (!track) return;

    function mount(reviews) {
      reviews = withDefaultThumb(reviews, defaultThumb);
      if (!reviews.length) {
        root.classList.add('scale-o-reviews--empty');
        return;
      }

      var pages = buildPages(reviews, perPage);
      var pageIndex = 0;

      function render() {
        var html = pages[pageIndex].map(cardHtml).join('');
        track.innerHTML = html;
        track.setAttribute('data-page', String(pageIndex + 1));

        if (dotsWrap) {
          dotsWrap.innerHTML = pages.map(function (_, i) {
            return '<button type="button" class="scale-o-reviews__dot' + (i === pageIndex ? ' is-active' : '') + '" data-sor-dot="' + i + '" aria-label="Go to review page ' + (i + 1) + '"></button>';
          }).join('');
        }

        if (prevBtn) prevBtn.disabled = pageIndex === 0;
        if (nextBtn) nextBtn.disabled = pageIndex >= pages.length - 1;
      }

      function goTo(i) {
        pageIndex = Math.max(0, Math.min(pages.length - 1, i));
        render();
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', function () { goTo(pageIndex - 1); });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', function () { goTo(pageIndex + 1); });
      }
      if (dotsWrap) {
        dotsWrap.addEventListener('click', function (e) {
          var dot = e.target.closest('[data-sor-dot]');
          if (!dot) return;
          goTo(parseInt(dot.getAttribute('data-sor-dot'), 10));
        });
      }

      render();
      root.classList.add('scale-o-reviews--ready');
    }

    function tryMount() {
      var reviews = [];
      if (source) reviews = parseJudgeMe(source);
      if (!reviews.length) reviews = parseFallback(root);
      if (reviews.length) {
        mount(reviews);
        return true;
      }
      return false;
    }

    if (tryMount()) return;

    var waited = 0;
    var timer = window.setInterval(function () {
      waited += POLL;
      if (tryMount() || waited >= MAX_WAIT) {
        window.clearInterval(timer);
        if (!root.classList.contains('scale-o-reviews--ready')) {
          tryMount();
        }
      }
    }, POLL);
  }

  function init() {
    document.querySelectorAll(ROOT_SEL).forEach(initSlider);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  document.addEventListener('shopify:section:load', init);
})();
