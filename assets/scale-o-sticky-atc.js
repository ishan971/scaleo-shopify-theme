(function () {
  var MQ = window.matchMedia('(max-width: 989px)');
  var DESK_MQ = window.matchMedia('(min-width: 990px)');

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

  function variantImageSrc(variant, fallback) {
    if (!variant) return fallback;
    var image = variant.featured_image || variant.image;
    if (!image) return fallback;
    if (typeof image === 'string') return image;
    return image.src || fallback;
  }

  function findPlanFeatures() {
    return (
      document.querySelector('[data-cartridge-pack]') ||
      document.querySelector('.cpk') ||
      document.querySelector('.plan-features') ||
      document.querySelector('.plan-features__heading')
    );
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

  function findFooter() {
    return (
      document.querySelector('.so-footer') ||
      document.querySelector('#so-footer') ||
      document.querySelector('footer[role="contentinfo"]') ||
      document.querySelector('footer')
    );
  }

  function footerInView() {
    var footer = findFooter();
    if (!footer) return false;
    var top = footer.getBoundingClientRect().top;
    return top < window.innerHeight - 72;
  }

  var stickyVariantSyncBound = false;
  var stickyVariantCallbacks = {};
  var stickyVariantSubscribed = {};

  function notifyStickyVariants(productId, variant) {
    var key = String(productId);
    var resolved = variant || resolveCurrentVariant(key);
    if (!resolved) return;
    (stickyVariantCallbacks[key] || []).forEach(function (fn) {
      fn(resolved);
    });
  }

  function findVariantPicker(productId) {
    var picker = document.querySelector('variant-picker[data-product-id="' + productId + '"]');
    if (!picker) picker = document.querySelector('variant-picker');
    return picker;
  }

  function parseRupeeCents(text) {
    var n = String(text || '').replace(/[^\d]/g, '');
    return n ? Number(n) * 100 : 0;
  }

  function selectedPlanNode(picker) {
    if (!picker) return null;
    return (
      picker.querySelector('.variant-cards-container input[type="radio"]:checked') ||
      picker.querySelector('.m-product-option--content input[type="radio"]:checked') ||
      picker.querySelector('input[type="radio"]:checked')
    );
  }

  function planTitleFromInput(input) {
    if (!input) return '';
    var node = input.closest('.m-product-option--node');
    if (!node) return '';
    var titleEl = node.querySelector('.variant-card-title');
    return titleEl ? titleEl.textContent.trim() : '';
  }

  function parseVariantData(picker) {
    if (!picker || !picker.variantData) return [];
    if (Array.isArray(picker.variantData)) return picker.variantData;
    try {
      return JSON.parse(picker.variantData);
    } catch (e) {
      return [];
    }
  }

  function resolveCurrentVariant(productId, input) {
    var picker = findVariantPicker(productId);
    var checked = input && input.type === 'radio' ? input : selectedPlanNode(picker);
    var variant = null;

    if (picker) {
      if (typeof picker.getSelectedVariant === 'function') {
        try {
          picker.getSelectedVariant();
        } catch (e) {}
      }
      if (picker.currentVariant) variant = picker.currentVariant;
    }

    if (!variant && checked && checked.value && picker) {
      var list = parseVariantData(picker);
      variant =
        list.find(function (v) {
          return String(v.id) === String(checked.value);
        }) || null;
    }

    if (!variant) {
      var idInput = document.querySelector('.m-main-product--wrapper [name="id"]');
      if (idInput && idInput.value && picker) {
        var variants = parseVariantData(picker);
        variant =
          variants.find(function (v) {
            return String(v.id) === String(idInput.value);
          }) || null;
      }
    }

    var node = checked && checked.closest ? checked.closest('.m-product-option--node') : null;
    if (node) {
      var priceNode = node.querySelector('.variant-card-price');
      var compareNode = node.querySelector('.variant-card-compare');
      var planTitle = planTitleFromInput(checked);
      var cardVariant = {};

      if (priceNode) {
        cardVariant.price = parseRupeeCents(priceNode.textContent);
        cardVariant.compare_at_price = compareNode ? parseRupeeCents(compareNode.textContent) : 0;
      }
      if (planTitle) cardVariant.title = planTitle;

      if (variant) {
        variant = Object.assign({}, variant, cardVariant);
        if (planTitle) variant.title = planTitle;
      } else if (cardVariant.price) {
        variant = cardVariant;
      }
    }

    return variant;
  }

  function displayVariantTitle(variant, productId) {
    if (!variant) return '';
    var picker = findVariantPicker(productId);
    var checked = selectedPlanNode(picker);
    var planTitle = planTitleFromInput(checked);
    if (planTitle) return planTitle;
    var title = variant.title || variant.public_title || '';
    if (/as per selected plan/i.test(title)) return planTitle || title;
    return title;
  }

  function registerVariantSync(productId, applyVariant) {
    if (!productId) return;
    var key = String(productId);
    if (!stickyVariantCallbacks[key]) stickyVariantCallbacks[key] = [];
    stickyVariantCallbacks[key].push(applyVariant);

    if (!stickyVariantSubscribed[key]) {
      stickyVariantSubscribed[key] = true;

      function bindMinimog() {
        if (!window.MinimogEvents || typeof window.MinimogEvents.subscribe !== 'function') return false;
        window.MinimogEvents.subscribe(key + '__VARIANT_CHANGE', function (variant) {
          notifyStickyVariants(key, variant);
        });
        return true;
      }

      if (!bindMinimog()) {
        var tries = 0;
        var timer = window.setInterval(function () {
          tries += 1;
          if (bindMinimog() || tries > 40) window.clearInterval(timer);
        }, 250);
      }
    }

    if (!stickyVariantSyncBound) {
      stickyVariantSyncBound = true;
      document.addEventListener(
        'change',
        function (event) {
          var input = event.target;
          if (!input || input.type !== 'radio') return;
          if (!input.closest('variant-picker, .variant-cards-container, .m-product-option')) return;
          var picker = input.closest('variant-picker') || findVariantPicker('');
          var pid = picker && picker.getAttribute('data-product-id');
          if (!pid) return;
          window.requestAnimationFrame(function () {
            notifyStickyVariants(pid, resolveCurrentVariant(pid, input));
          });
        },
        true
      );
    }

    window.requestAnimationFrame(function () {
      notifyStickyVariants(key, resolveCurrentVariant(key));
    });
  }

  function init(root) {
    if (!root || root.dataset.soStickyInit === 'true') return;
    root.dataset.soStickyInit = 'true';

    var trigger = root.querySelector('[data-sticky-atc-trigger]');
    var labelEl = root.querySelector('[data-sticky-atc-label]');
    var priceEl = root.querySelector('[data-sticky-atc-price]');
    var compareEl = root.querySelector('[data-sticky-atc-compare]');
    var offEl = root.querySelector('[data-sticky-atc-off]');
    var priceBox = root.querySelector('[data-sticky-atc-pricebox]');
    var variantEl = root.querySelector('[data-sticky-atc-variant]');
    var imageEl = root.querySelector('[data-sticky-atc-image]');
    var productId = root.getAttribute('data-product-id');
    var fallbackImage = root.getAttribute('data-fallback-image') || '';
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
      if (!trigger) return;
      if (available) {
        trigger.disabled = false;
        trigger.classList.remove('is-disabled');
        trigger.setAttribute('aria-label', 'Add to Cart');
        if (labelEl) labelEl.textContent = 'Add to Cart';
      } else {
        trigger.disabled = true;
        trigger.classList.add('is-disabled');
        trigger.setAttribute('aria-label', 'Sold out');
        if (labelEl) labelEl.textContent = 'Sold out';
        setLoading(false);
      }
    }

    function setSale(priceCents, compareCents) {
      var price = Number(priceCents);
      var compare = Number(compareCents);
      var onSale = compare > price && price > 0;
      if (priceEl) {
        var formatted = formatPrice(price);
        if (formatted) priceEl.textContent = formatted;
      }
      if (compareEl) {
        if (onSale) {
          compareEl.hidden = false;
          compareEl.textContent = formatPrice(compare);
        } else {
          compareEl.hidden = true;
          compareEl.textContent = '';
        }
      }
      if (offEl) {
        if (onSale) {
          var pct = Math.round(((compare - price) * 100) / compare);
          offEl.hidden = false;
          offEl.textContent = pct + '% OFF';
        } else {
          offEl.hidden = true;
          offEl.textContent = '';
        }
      }
      if (priceBox) priceBox.classList.toggle('is-sale', onSale);
    }

    function setVariantMeta(variant) {
      if (!variant) return;
      if (variantEl) {
        var label = displayVariantTitle(variant, productId);
        if (label) variantEl.textContent = label;
      }
      if (imageEl) {
        var src = variantImageSrc(variant, fallbackImage);
        if (src) imageEl.src = src;
      }
      if (variant.price != null) setSale(variant.price, variant.compare_at_price);
      if (typeof variant.available === 'boolean') setAvailable(!!variant.available);
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
      setVisible(rect.bottom < 8 && !footerInView());
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
      if (!('IntersectionObserver' in window)) {
        evaluate();
        return;
      }
      observer = new IntersectionObserver(
        function () {
          evaluate();
        },
        { threshold: [0, 0.01, 0.2, 1], rootMargin: '0px' }
      );
      if (mainAtc) observer.observe(mainAtc);
      var footer = findFooter();
      if (footer) observer.observe(footer);
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

    setSale(root.getAttribute('data-price-cents'), root.getAttribute('data-compare-cents'));
    if (root.getAttribute('data-available') === 'false') setAvailable(false);

    registerVariantSync(productId, setVariantMeta);

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

  function initDesktop(root) {
    if (!root || root.dataset.soStickyDeskInit === 'true') return;
    root.dataset.soStickyDeskInit = 'true';

    var trigger = root.querySelector('[data-sticky-desk-trigger]');
    var labelEl = root.querySelector('[data-sticky-desk-label]');
    var priceEl = root.querySelector('[data-sticky-desk-price]');
    var compareEl = root.querySelector('[data-sticky-desk-compare]');
    var offEl = root.querySelector('[data-sticky-desk-off]');
    var priceBox = root.querySelector('[data-sticky-desk-pricebox]');
    var variantEl = root.querySelector('[data-sticky-desk-variant]');
    var imageEl = root.querySelector('[data-sticky-desk-image]');
    var productId = root.getAttribute('data-product-id');
    var fallbackImage = root.getAttribute('data-fallback-image') || '';
    var mainAtc = findMainAtc(root);
    var planFeatures = findPlanFeatures();
    var observer = null;
    var loadingTimer = null;
    var visible = false;
    var ticking = false;

    function isDesktop() {
      return DESK_MQ.matches;
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

    function setSale(priceCents, compareCents) {
      var price = Number(priceCents);
      var compare = Number(compareCents);
      var onSale = compare > price && price > 0;
      if (priceEl) {
        var formatted = formatPrice(price);
        if (formatted) priceEl.textContent = formatted;
      }
      if (compareEl) {
        if (onSale) {
          compareEl.hidden = false;
          compareEl.textContent = formatPrice(compare);
        } else {
          compareEl.hidden = true;
          compareEl.textContent = '';
        }
      }
      if (offEl) {
        if (onSale) {
          var pct = Math.round(((compare - price) * 100) / compare);
          offEl.hidden = false;
          offEl.textContent = pct + '% OFF';
        } else {
          offEl.hidden = true;
          offEl.textContent = '';
        }
      }
      if (priceBox) priceBox.classList.toggle('is-sale', onSale);
    }

    function setVariantMeta(variant) {
      if (!variant) return;
      if (variantEl) {
        var label = displayVariantTitle(variant, productId);
        if (label) variantEl.textContent = label;
      }
      if (imageEl) {
        var src = variantImageSrc(variant, fallbackImage);
        if (src) imageEl.src = src;
      }
      if (variant.price != null) setSale(variant.price, variant.compare_at_price);
      if (typeof variant.available === 'boolean') setAvailable(!!variant.available);
    }

    function syncFromMain() {
      if (!mainAtc) return;
      var disabled = mainAtc.disabled || mainAtc.classList.contains('disabled');
      setAvailable(!disabled);
    }

    function pastPlanFeatures() {
      planFeatures = planFeatures && document.contains(planFeatures) ? planFeatures : findPlanFeatures();
      if (planFeatures) {
        return planFeatures.getBoundingClientRect().bottom < 16;
      }
      if (!mainAtc) return false;
      return mainAtc.getBoundingClientRect().bottom < 8;
    }

    function setVisible(next) {
      next = !!(next && isDesktop() && mainAtc);
      if (next === visible) return;
      visible = next;
      root.classList.toggle('is-visible', visible);
      root.setAttribute('aria-hidden', visible ? 'false' : 'true');
      document.documentElement.classList.toggle('scale-o-sticky-desk-on', visible);
      if (trigger) {
        if (visible) trigger.removeAttribute('tabindex');
        else trigger.setAttribute('tabindex', '-1');
      }
    }

    function evaluate() {
      if (!isDesktop() || !mainAtc) {
        setVisible(false);
        return;
      }
      setVisible(pastPlanFeatures() && !footerInView());
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
      var target = planFeatures || mainAtc;
      if (!('IntersectionObserver' in window)) {
        evaluate();
        return;
      }
      observer = new IntersectionObserver(
        function () {
          evaluate();
        },
        { threshold: [0, 0.01, 0.2, 1], rootMargin: '0px' }
      );
      if (target) observer.observe(target);
      var footer = findFooter();
      if (footer) observer.observe(footer);
      evaluate();
    }

    if (trigger) {
      trigger.setAttribute('tabindex', '-1');
      trigger.addEventListener('click', function () {
        if (!isDesktop() || trigger.disabled) return;
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

    setSale(root.getAttribute('data-price-cents'), root.getAttribute('data-compare-cents'));
    if (root.getAttribute('data-available') === 'false') setAvailable(false);

    registerVariantSync(productId, setVariantMeta);

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

    bindMq(DESK_MQ, function () {
      if (!DESK_MQ.matches) setVisible(false);
      else evaluate();
    });

    window.addEventListener('scroll', requestEvaluate, { passive: true });
    window.addEventListener('resize', requestEvaluate);

    observe();
    syncFromMain();
  }

  function scan() {
    document.querySelectorAll('[data-scale-o-sticky-atc]').forEach(init);
    document.querySelectorAll('[data-scale-o-sticky-desk]').forEach(initDesktop);
  }

  ready(scan);

  document.addEventListener('shopify:section:load', function () {
    stickyVariantCallbacks = {};
    stickyVariantSubscribed = {};
    document.querySelectorAll('[data-scale-o-sticky-atc]').forEach(function (el) {
      el.dataset.soStickyInit = '';
    });
    document.querySelectorAll('[data-scale-o-sticky-desk]').forEach(function (el) {
      el.dataset.soStickyDeskInit = '';
    });
    scan();
  });
})();
