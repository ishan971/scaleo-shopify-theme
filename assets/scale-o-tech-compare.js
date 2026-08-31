/**
 * Scale-O Comparison — reveal animations + mobile tech picker
 */
(function () {
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)');

  function markType(status) {
    if (status === 'positive' || status === 'not_required' || status === 'low') return 'check';
    if (status === 'negative' || status === 'required' || status === 'high') return 'cross';
    return 'dash';
  }

  function cellHtml(value, status, featured, textOnly) {
    if (textOnly) {
      return (
        '<span class="scale-o-compare__cell scale-o-compare__cell--text-only' +
        (featured ? ' scale-o-compare__cell--featured' : '') +
        '">' +
        (value ? '<span class="scale-o-compare__value">' + value + '</span>' : '') +
        '</span>'
      );
    }

    var mark = markType(status);
    var markInner =
      mark === 'check'
        ? '<svg viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3.2 3.2L13 4.8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        : mark === 'cross'
          ? '<svg viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4 4 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
          : '<span class="scale-o-compare__dash">—</span>';

    return (
      '<span class="scale-o-compare__cell scale-o-compare__cell--' +
      (status || 'neutral') +
      ' scale-o-compare__cell--' +
      mark +
      (featured ? ' scale-o-compare__cell--featured' : '') +
      '">' +
      '<span class="scale-o-compare__mark" aria-hidden="true">' +
      markInner +
      '</span>' +
      (value ? '<span class="scale-o-compare__value">' + value + '</span>' : '') +
      '</span>'
    );
  }

  function selectTech(mobileRoot, index) {
    var idx = String(index || '1');
    var input = mobileRoot.querySelector(
      '.scale-o-compare__picker-input[data-stc-tech-index="' + idx + '"]'
    );
    if (!input) return;

    mobileRoot.querySelectorAll('.scale-o-compare__picker-card').forEach(function (card) {
      card.classList.toggle('is-selected', card.contains(input));
    });

    var featured = input.getAttribute('data-stc-tech-featured') === 'true';
    var title = input.getAttribute('data-stc-tech-title') || '';
    var image = input.getAttribute('data-stc-tech-image') || '';
    var head = mobileRoot.querySelector('[data-stc-mobile-head]');
    if (head) {
      if (image) {
        head.innerHTML =
          '<img class="scale-o-compare__mobile-matrix-logo" src="' +
          image +
          '" alt="' +
          title.replace(/"/g, '&quot;') +
          '" width="44" height="44" loading="lazy">';
      } else {
        head.innerHTML =
          '<span class="scale-o-compare__mobile-matrix-name">' + title + '</span>';
      }
    }

    mobileRoot.querySelectorAll('[data-stc-mobile-row]').forEach(function (row) {
      var value = row.getAttribute('data-v' + idx) || '';
      var status = row.getAttribute('data-s' + idx) || 'neutral';
      var cell = row.querySelector('[data-stc-mobile-value]');
      var textOnly = row.classList.contains('scale-o-compare__mobile-row--type');
      if (cell) cell.innerHTML = cellHtml(value, status, featured, textOnly);
    });
  }

  function initMobilePicker(root) {
    var mobileRoot = root.querySelector('[data-stc-mobile]');
    if (!mobileRoot || mobileRoot.dataset.stcMobileInit === 'true') return;
    mobileRoot.dataset.stcMobileInit = 'true';

    mobileRoot.addEventListener('change', function (event) {
      var input = event.target.closest('.scale-o-compare__picker-input');
      if (!input) return;
      selectTech(mobileRoot, input.getAttribute('data-stc-tech-index'));
    });

    var checked = mobileRoot.querySelector('.scale-o-compare__picker-input:checked');
    var defaultIndex =
      (checked && checked.getAttribute('data-stc-tech-index')) ||
      mobileRoot.getAttribute('data-stc-default') ||
      '4';
    selectTech(mobileRoot, defaultIndex);
  }

  function initReveal(root) {
    var items = root.querySelectorAll('[data-stc-animate]');
    if (!items.length) return;

    if (root.dataset.animate !== 'true' || REDUCE.matches || !('IntersectionObserver' in window)) {
      items.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );

    items.forEach(function (el, index) {
      el.style.transitionDelay = Math.min(index * 60, 240) + 'ms';
      observer.observe(el);
    });
  }

  function selectVersus(versusRoot, index) {
    var idx = String(index || '1');
    var input = versusRoot.querySelector(
      '.scale-o-versus-mobile__input[data-stc-vs-index="' + idx + '"]'
    );
    if (!input) return;

    versusRoot.querySelectorAll('.scale-o-versus-mobile__card').forEach(function (card) {
      card.classList.toggle('is-selected', card.contains(input));
    });

    var featured = input.getAttribute('data-stc-vs-featured') === 'true';

    versusRoot.querySelectorAll('[data-stc-versus-row]').forEach(function (row) {
      var value = (row.getAttribute('data-v' + idx) || '').trim();
      var status = row.getAttribute('data-s' + idx) || 'neutral';
      if (!value && idx !== '1') {
        value = (row.getAttribute('data-v2') || '').trim();
        status = row.getAttribute('data-s2') || status;
      }
      var mark = row.querySelector('[data-stc-versus-mark]');
      var valueEl = row.querySelector('[data-stc-versus-value]');
      if (mark) mark.innerHTML = cellHtml('', status, featured);
      if (valueEl) valueEl.textContent = value;
      row.classList.toggle('is-win', featured && markType(status) === 'check');
      row.classList.toggle('is-lose', !featured || markType(status) === 'cross');
    });
  }

  function initVersusPicker(root) {
    var versusRoot = root.querySelector('[data-stc-versus-mobile]');
    if (!versusRoot || versusRoot.dataset.stcVersusInit === 'true') return;
    versusRoot.dataset.stcVersusInit = 'true';

    versusRoot.addEventListener('change', function (event) {
      var input = event.target.closest('.scale-o-versus-mobile__input');
      if (!input) return;
      selectVersus(versusRoot, input.getAttribute('data-stc-vs-index'));
    });

    var checked = versusRoot.querySelector('.scale-o-versus-mobile__input:checked');
    var defaultIndex =
      (checked && checked.getAttribute('data-stc-vs-index')) ||
      versusRoot.getAttribute('data-stc-default') ||
      '1';
    selectVersus(versusRoot, defaultIndex);
  }

  function init(root) {
    if (!root || root.dataset.stcInit === 'true') return;
    root.dataset.stcInit = 'true';
    initReveal(root);
    initMobilePicker(root);
    initVersusPicker(root);
  }

  function boot() {
    document.querySelectorAll('.scale-o-compare').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('shopify:section:load', function (event) {
    var root = event.target && event.target.querySelector('.scale-o-compare');
    if (root) {
      root.dataset.stcInit = 'false';
      var mobile = root.querySelector('[data-stc-mobile]');
      if (mobile) mobile.dataset.stcMobileInit = 'false';
      var versus = root.querySelector('[data-stc-versus-mobile]');
      if (versus) versus.dataset.stcVersusInit = 'false';
      init(root);
    }
  });
})();
