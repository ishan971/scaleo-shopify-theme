(function () {
  var MQ = window.matchMedia('(max-width: 767px)');

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function formatPrice(cents) {
    if (cents == null || cents === '') return '';
    var amount = Math.round(Number(cents) / 100);
    if (isNaN(amount)) return '';
    return '₹' + amount.toLocaleString('en-IN');
  }

  function findMainAtc(root) {
    var scope =
      document.querySelector('.m-product-form--main') ||
      document.querySelector('.m-main-product--info') ||
      document.querySelector('.product-plan-buy-buttons');
    var selectors = ['.m-add-to-cart', 'button[name="add"]'];
    var i;
    var el;
    if (scope) {
      for (i = 0; i < selectors.length; i++) {
        el = scope.querySelector(selectors[i]);
        if (el && !root.contains(el)) return el;
      }
    }
    var all = document.querySelectorAll('.m-add-to-cart, button[name="add"]');
    for (i = 0; i < all.length; i++) {
      if (!root.contains(all[i])) return all[i];
    }
    return null;
  }

  function bindMq(mq, handler) {
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else if (mq.addListener) mq.addListener(handler);
  }

  function init(root) {
    if (!root || root.dataset.soStickyInit === 'true') return;
    root.dataset.soStickyInit = 'true';

    var trigger = root.querySelector('[data-sticky-atc-trigger]');
    var labelEl = root.querySelector('[data-sticky-atc-label]');
    var priceEl = root.querySelector('[data-sticky-atc-price]');
    var productId = root.getAttribute('data-product-id');
    var mainAtc = findMainAtc(root);
    var observer = null;
    var loadingTimer = null;
    var visible = false;
    var ticking = false;

    document.documentElement.classList.add('scale-o-sticky-atc-ready');

    function isMobile() {
      return MQ.matches;
    }

    function setLoading(on) {
      root.classList.toggle('is-loading', !!on);
      if (trigger) trigger.setAttribute('aria-busy', on ? 'true' : 'false');
      window.clearTimeout(loadingTimer);
      if (on) {
        loadingTimer = window.setTimeout(function () {
          setLoading(false);
        }, 2800);
      }
    }

    function setAvailable(available) {
      if (!trigger || !labelEl) return;
      if (available) {
        trigger.disabled = false;
        trigger.classList.remove('is-disabled');
        trigger.setAttribute('aria-label', 'Add to Cart');
        labelEl.textContent = 'Add to Cart';
      } else {
        trigger.disabled = true;
        trigger.classList.add('is-disabled');
        trigger.setAttribute('aria-label', 'Sold out');
        labelEl.textContent = 'Sold out';
        setLoading(false);
      }
    }

    function setPrice(cents) {
      if (!priceEl) return;
      var formatted = formatPrice(cents);
      if (formatted) priceEl.textContent = formatted;
    }

    function syncFromMain() {
      if (!mainAtc) return;
      var disabled = mainAtc.disabled || mainAtc.classList.contains('disabled');
      setAvailable(!disabled);
    }

    function setVisible(next) {
      next = !!(next && isMobile() && mainAtc);
      if (next === visible) return;
      visible = next;
      root.classList.toggle('is-visible', visible);
      root.setAttribute('aria-hidden', visible ? 'false' : 'true');
      document.documentElement.classList.toggle('scale-o-sticky-atc-on', visible);
      if (trigger) {
        if (visible) trigger.removeAttribute('tabindex');
        else trigger.setAttribute('tabindex', '-1');
      }
    }

    function evaluate() {
      if (!isMobile() || !mainAtc) {
        setVisible(false);
        return;
      }
      var rect = mainAtc.getBoundingClientRect();
      setVisible(rect.bottom < 8);
    }

    function requestEvaluate() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        evaluate();
      });
    }

    function observe() {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      if (!mainAtc || !('IntersectionObserver' in window)) {
        evaluate();
        return;
      }
      observer = new IntersectionObserver(
        function () {
          evaluate();
        },
        { threshold: [0, 0.01, 1], rootMargin: '0px' }
      );
      observer.observe(mainAtc);
      evaluate();
    }

    if (trigger) {
      trigger.setAttribute('tabindex', '-1');
      trigger.addEventListener('click', function () {
        if (!isMobile() || trigger.disabled) return;
        mainAtc = mainAtc && document.contains(mainAtc) ? mainAtc : findMainAtc(root);
        if (!mainAtc) return;
        if (mainAtc.disabled || mainAtc.classList.contains('disabled')) {
          setAvailable(false);
          return;
        }
        setLoading(true);
        mainAtc.click();
      });
    }

    setPrice(root.getAttribute('data-price-cents'));
    if (root.getAttribute('data-available') === 'false') setAvailable(false);

    function onVariantChange(variant) {
      if (!variant) return;
      setPrice(variant.price);
      setAvailable(!!variant.available);
    }

    function bindVariantEvents() {
      if (!productId || !window.MinimogEvents || typeof window.MinimogEvents.subscribe !== 'function') return false;
      window.MinimogEvents.subscribe(productId + '__VARIANT_CHANGE', onVariantChange);
      return true;
    }

    if (!bindVariantEvents()) {
      var tries = 0;
      var timer = window.setInterval(function () {
        tries += 1;
        if (bindVariantEvents() || tries > 20) window.clearInterval(timer);
      }, 250);
    }

    if (mainAtc && typeof MutationObserver === 'function') {
      var mo = new MutationObserver(function () {
        syncFromMain();
        if (mainAtc.classList.contains('m-loading') || mainAtc.getAttribute('aria-busy') === 'true') {
          setLoading(true);
        } else if (root.classList.contains('is-loading') && !mainAtc.disabled) {
          setLoading(false);
        }
      });
      mo.observe(mainAtc, { attributes: true, attributeFilter: ['disabled', 'class', 'aria-busy'] });
    }

    bindMq(MQ, function () {
      if (!MQ.matches) setVisible(false);
      else evaluate();
    });

    window.addEventListener('scroll', requestEvaluate, { passive: true });
    window.addEventListener('resize', requestEvaluate);

    observe();
    syncFromMain();
  }

  function scan() {
    document.querySelectorAll('[data-scale-o-sticky-atc]').forEach(init);
  }

  ready(scan);

  document.addEventListener('shopify:section:load', function () {
    document.querySelectorAll('[data-scale-o-sticky-atc]').forEach(function (el) {
      el.dataset.soStickyInit = '';
    });
    scan();
  });
})();
