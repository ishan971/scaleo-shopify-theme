/**
 * Scale-O cart promo — plan-based coupon auto-apply + view all coupons.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'scaleo_cart_promo_code';
  var applying = false;
  var lastCart = null;
  var pendingQtyByLine = {};
  var syncRetryTimer = null;
  var MAX_SYNC_RETRIES = 12;
  var SYNC_RETRY_MS = 100;

  var PLAN_RULES = [
    {
      code: 'SO-3Y',
      amount: 2000,
      title: 'Get ₹2,000 OFF on 3 Year Plan',
      keys: ['3 year', '3year', '3-year', '3 yr']
    },
    {
      code: 'SO-2Y',
      amount: 1000,
      title: 'Get ₹1,000 OFF on 2 Year Plan',
      keys: ['2 year', '2year', '2-year', '2 yr']
    },
    {
      code: 'SO-1Y',
      amount: 1000,
      title: 'Get ₹1,000 OFF on 1 Year Plan',
      keys: ['1 year', '1year', '1-year', '1 yr']
    },
    {
      code: 'SO-6M',
      amount: 500,
      title: 'Get ₹500 OFF on 6 Month / Trial Plan',
      keys: ['trial', '6 month', '6month', '6-month', '6m', '6 m']
    }
  ];

  function money(cents, withCode) {
    var amount = (Number(cents) || 0) / 100;
    var formatted = amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    if (withCode) return 'INR ' + formatted;
    return '₹' + formatted;
  }

  function root() {
    return document.querySelector('[data-scale-o-cart-promo]');
  }

  function cfg(el) {
    return {
      autoApply: el.getAttribute('data-auto-apply') === 'true',
      withCode: el.getAttribute('data-currency-code') === 'true'
    };
  }

  function itemPlanText(item) {
    var parts = [];
    if (item && item.variant_title) parts.push(item.variant_title);
    if (item && item.title && item.title !== item.product_title) parts.push(item.title);
    if (item && item.options_with_values) {
      item.options_with_values.forEach(function (opt) {
        if (opt && opt.value) parts.push(opt.value);
      });
    }
    if (item && item.selling_plan_allocation && item.selling_plan_allocation.selling_plan) {
      parts.push(item.selling_plan_allocation.selling_plan.name || '');
    }
    return parts.join(' ').toLowerCase();
  }

  function drawerEl() {
    return document.querySelector('m-cart-drawer, #MinimogCartDrawer, .scale-o-cart-drawer');
  }

  function lineQtyFromDom(lineIndex, input, pendingQty) {
    if (pendingQty != null && input && parseInt(input.getAttribute('data-index'), 10) === lineIndex) {
      return pendingQty;
    }
    if (pendingQtyByLine[lineIndex] != null) return pendingQtyByLine[lineIndex];
    if (input) return parseInt(input.value, 10) || 1;
    return null;
  }

  function setPendingLineQty(lineIndex, qty) {
    if (!lineIndex || qty == null) return;
    pendingQtyByLine[lineIndex] = qty;
  }

  function clearPendingWhenMatched(cart) {
    if (!cart || !cart.items) return;
    Object.keys(pendingQtyByLine).forEach(function (key) {
      var idx = parseInt(key, 10);
      var item = cart.items[idx - 1];
      if (item && Number(item.quantity) === pendingQtyByLine[key]) {
        delete pendingQtyByLine[key];
      }
    });
  }

  function expectedQuantities() {
    var drawer = drawerEl();
    var expected = {};
    if (!drawer) return expected;

    drawer.querySelectorAll('.m-quantity__input').forEach(function (input) {
      var lineIndex = parseInt(input.getAttribute('data-index'), 10);
      if (!lineIndex) return;
      expected[lineIndex] = lineQtyFromDom(lineIndex, input);
    });

    Object.keys(pendingQtyByLine).forEach(function (key) {
      expected[key] = pendingQtyByLine[key];
    });

    return expected;
  }

  function cartMatchesDom(cart) {
    if (!cart || !cart.items || !cart.items.length) return true;
    var expected = expectedQuantities();
    var keys = Object.keys(expected);
    if (!keys.length) return true;

    for (var i = 0; i < keys.length; i++) {
      var idx = parseInt(keys[i], 10);
      var item = cart.items[idx - 1];
      if (!item) return false;
      if (Number(item.quantity) !== expected[idx]) return false;
    }
    return true;
  }

  function debounce(fn, wait) {
    var timer;
    return function () {
      var args = arguments;
      var ctx = this;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(ctx, args);
      }, wait);
    };
  }

  function cartSubtotalCents(cart) {
    var sum = 0;
    (cart.items || []).forEach(function (item) {
      var line =
        Number(item.final_line_price) ||
        Number(item.original_line_price) ||
        Number(item.line_price) ||
        (Number(item.final_price != null ? item.final_price : item.price) *
          (Number(item.quantity) || 1));
      sum += line || 0;
    });
    if (sum > 0) return sum;
    return (
      Number(cart.original_total_price) ||
      Number(cart.items_subtotal_price) ||
      Number(cart.total_price) + (Number(cart.total_discount) || 0) ||
      Number(cart.total_price) ||
      0
    );
  }

  function cartItemCount(cart) {
    var count = Number(cart && cart.item_count);
    if (count > 0) return count;
    count = 0;
    (cart.items || []).forEach(function (item) {
      count += Number(item.quantity) || 0;
    });
    return count;
  }

  function matchPlanRule(item) {
    var text = itemPlanText(item);
    if (!text) return null;
    for (var i = 0; i < PLAN_RULES.length; i++) {
      var rule = PLAN_RULES[i];
      for (var j = 0; j < rule.keys.length; j++) {
        if (text.indexOf(rule.keys[j]) !== -1) return rule;
      }
    }
    return null;
  }

  function analyzeCart(cart) {
    var planDiscountCents = 0;
    var primaryRule = null;
    var primaryWeight = -1;

    (cart.items || []).forEach(function (item) {
      var rule = matchPlanRule(item);
      if (!rule) return;
      var qty = Number(item.quantity) || 1;
      planDiscountCents += rule.amount * 100 * qty;
      var weight = rule.amount * qty;
      if (weight > primaryWeight) {
        primaryWeight = weight;
        primaryRule = rule;
      }
    });

    return {
      planDiscountCents: planDiscountCents,
      primaryRule: primaryRule
    };
  }

  function discountApps(cart) {
    return (cart && cart.cart_level_discount_applications) || [];
  }

  function appMatchesCode(app, code) {
    var title = String((app && (app.title || app.code)) || '').toUpperCase();
    return title.indexOf(String(code || '').toUpperCase()) !== -1;
  }

  function shopifyDiscountForCode(cart, code) {
    var apps = discountApps(cart);
    for (var i = 0; i < apps.length; i++) {
      if (appMatchesCode(apps[i], code)) {
        return Number(apps[i].total_allocated_amount) || 0;
      }
    }
    return 0;
  }

  function updateCouponList(el, activeCodes) {
    if (!el) return;
    var items = el.querySelectorAll('[data-coupon-code]');
    items.forEach(function (node) {
      var code = (node.getAttribute('data-coupon-code') || '').toUpperCase();
      var isActive = activeCodes.indexOf(code) !== -1;
      node.classList.toggle('is-active', isActive);
      var badge = node.querySelector('[data-coupon-badge]');
      if (badge) badge.hidden = !isActive;
    });
  }

  function updateActiveCard(el, rule) {
    var card = el.querySelector('[data-scale-o-promo-active-card]');
    var title = el.querySelector('[data-scale-o-promo-active-title]');
    var codeLabel = el.querySelector('[data-scale-o-promo-active-code]');
    if (!card) return;

    if (rule) {
      card.hidden = false;
      if (title) title.textContent = rule.title;
      if (codeLabel) codeLabel.textContent = rule.code;
    } else {
      card.hidden = true;
    }
  }

  function paint(el, cart, options) {
    if (!el || !cart) return;
    options = options || {};

    if (!options.force && !cartMatchesDom(cart)) {
      var optimistic = buildOptimisticCart();
      if (optimistic) cart = optimistic;
      else return;
    }

    var c = cfg(el);
    var itemCount = Number(cart.item_count) || 0;

    if (itemCount < 1) {
      el.hidden = true;
      el.classList.add('is-empty');
      return;
    }
    el.hidden = false;
    el.classList.remove('is-empty');

    var analysis = analyzeCart(cart);
    var subtotal = cartSubtotalCents(cart);

    var planDiscountCents = analysis.planDiscountCents;
    if (analysis.primaryRule) {
      var shopifyPlan = shopifyDiscountForCode(cart, analysis.primaryRule.code);
      if (shopifyPlan > planDiscountCents) planDiscountCents = shopifyPlan;
    }

    var shopifyTotalDiscount = Number(cart.total_discount) || 0;
    if (shopifyTotalDiscount > 0 && planDiscountCents === 0) {
      planDiscountCents = shopifyTotalDiscount;
    }

    var totalDiscount = Math.min(subtotal, planDiscountCents);
    var payable = Math.max(0, subtotal - totalDiscount);

    if (shopifyTotalDiscount > 0 && Number(cart.total_price) >= 0 && cartMatchesDom(cart)) {
      var shopifyPayable = Number(cart.total_price);
      if (Math.abs(shopifyTotalDiscount - totalDiscount) < 100) {
        payable = shopifyPayable;
      }
    }

    var activeCodes = [];
    if (analysis.primaryRule) activeCodes.push(analysis.primaryRule.code);
    updateCouponList(el, activeCodes);
    updateActiveCard(el, analysis.primaryRule);

    var subEl = el.querySelector('[data-scale-o-promo-subtotal]');
    var planRow = el.querySelector('[data-scale-o-promo-plan-row]');
    var planLabel = el.querySelector('[data-scale-o-promo-plan-label]');
    var planDiscEl = el.querySelector('[data-scale-o-promo-plan-discount]');
    var payEl = el.querySelector('[data-scale-o-promo-payable]');
    var input = el.querySelector('[data-scale-o-promo-input]');

    if (subEl) subEl.textContent = money(subtotal, c.withCode);

    if (planRow && planDiscEl) {
      if (planDiscountCents > 0) {
        planRow.hidden = false;
        if (planLabel && analysis.primaryRule) {
          planLabel.textContent = 'Plan Discount (' + analysis.primaryRule.code + ')';
        }
        planDiscEl.textContent = '- ' + money(planDiscountCents, c.withCode);
      } else {
        planRow.hidden = true;
      }
    }

    if (payEl) payEl.textContent = money(payable, c.withCode);
    if (input && analysis.primaryRule) input.value = analysis.primaryRule.code;

    lastCart = cart;
  }

  function cloneCart(cart) {
    if (!cart) return null;
    return {
      item_count: cart.item_count,
      items_subtotal_price: cart.items_subtotal_price,
      original_total_price: cart.original_total_price,
      total_discount: cart.total_discount,
      total_price: cart.total_price,
      cart_level_discount_applications: cart.cart_level_discount_applications
        ? cart.cart_level_discount_applications.slice()
        : [],
      items: (cart.items || []).map(function (item) {
        return Object.assign({}, item);
      })
    };
  }

  function buildOptimisticCart(pendingQty, pendingInput) {
    if (!lastCart || !lastCart.items || !lastCart.items.length) return null;

    var drawer = drawerEl();
    if (!drawer) return null;

    var cart = cloneCart(lastCart);
    var inputs = drawer.querySelectorAll('.m-quantity__input');
    var touched = false;

    inputs.forEach(function (input) {
      var lineIndex = parseInt(input.getAttribute('data-index'), 10);
      if (!lineIndex) return;
      var item = cart.items[lineIndex - 1];
      if (!item) return;

      var qty = lineQtyFromDom(lineIndex, input, pendingInput === input ? pendingQty : null);
      if (qty == null) qty = parseInt(input.value, 10) || 1;
      if (pendingInput && input === pendingInput && pendingQty != null) {
        qty = pendingQty;
        setPendingLineQty(lineIndex, pendingQty);
      }

      if (qty === Number(item.quantity) && pendingQtyByLine[lineIndex] == null) return;

      touched = true;
      var unitFinal = Number(item.final_price != null ? item.final_price : item.price) || 0;
      var unitOriginal = Number(item.original_price != null ? item.original_price : unitFinal) || unitFinal;

      item.quantity = qty;
      item.final_line_price = unitFinal * qty;
      item.line_price = unitFinal * qty;
      item.original_line_price = unitOriginal * qty;
    });

    if (!touched) return null;

    var subtotal = cartSubtotalCents(cart);
    var analysis = analyzeCart(cart);
    var planDiscount = analysis.planDiscountCents;
    var totalDiscount = Math.min(subtotal, planDiscount);

    cart.original_total_price = subtotal;
    cart.items_subtotal_price = subtotal;
    cart.total_discount = totalDiscount;
    cart.total_price = Math.max(0, subtotal - totalDiscount);
    cart.item_count = 0;
    cart.items.forEach(function (item) {
      cart.item_count += Number(item.quantity) || 0;
    });

    return cart;
  }

  function instantRefresh(pendingQty, pendingInput) {
    var el = root();
    if (!el) return;

    if (pendingInput && pendingQty != null) {
      var lineIndex = parseInt(pendingInput.getAttribute('data-index'), 10);
      setPendingLineQty(lineIndex, pendingQty);
    }

    var optimistic = buildOptimisticCart(pendingQty, pendingInput);
    if (optimistic) paint(el, optimistic);

    reconcilePromo();
  }

  function pendingQtyFromButton(btn) {
    var wrap = btn.closest('m-quantity-input, .m-quantity');
    var input = wrap && wrap.querySelector('.m-quantity__input');
    if (!input) return { pendingQty: null, pendingInput: null };

    var qty = parseInt(input.value, 10) || 1;
    var pendingQty = qty;

    if (btn.name === 'plus') pendingQty = qty + 1;
    else if (btn.name === 'minus') {
      var min = parseInt(input.min, 10) || 1;
      pendingQty = Math.max(min, qty - 1);
    }

    return { pendingQty: pendingQty, pendingInput: input };
  }

  function fetchCart() {
    var rootUrl = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
    return fetch(rootUrl + 'cart.js', { credentials: 'same-origin' }).then(function (r) {
      return r.json();
    });
  }

  function applyDiscount(code) {
    if (!code) return fetchCart();
    var rootUrl = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
    return fetch(rootUrl + 'cart/update.js', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({ discount: code })
    })
      .then(function (r) {
        if (!r.ok) throw new Error('update failed');
        return r.json();
      })
      .catch(function () {
        return fetch(rootUrl + 'discount/' + encodeURIComponent(code), {
          credentials: 'same-origin',
          redirect: 'manual'
        }).then(function () {
          return fetchCart();
        });
      });
  }

  function remember(code) {
    try {
      if (code) localStorage.setItem(STORAGE_KEY, code);
    } catch (e) {}
  }

  function syncFromCart(retry) {
    var el = root();
    if (!el) return Promise.resolve();
    retry = retry || 0;

    return fetchCart().then(function (cart) {
      if (!cart || cartItemCount(cart) < 1) {
        if (el) {
          el.hidden = true;
          el.classList.add('is-empty');
        }
        lastCart = null;
        return cart;
      }

      if (!cartMatchesDom(cart)) {
        var optimistic = buildOptimisticCart();
        if (optimistic) paint(el, optimistic);

        if (retry < MAX_SYNC_RETRIES) {
          clearTimeout(syncRetryTimer);
          syncRetryTimer = setTimeout(function () {
            syncFromCart(retry + 1).then(maybeAutoApply);
          }, SYNC_RETRY_MS);
        }
        return cart;
      }

      clearPendingWhenMatched(cart);
      paint(el, cart);
      return cart;
    });
  }

  var reconcilePromo = debounce(function () {
    syncFromCart().then(maybeAutoApply);
  }, 200);

  function observeCartUpdates() {
    var drawer = drawerEl();
    if (!drawer) return;

    var items = drawer.querySelector('[data-minimog-cart-items]');

    if (items) {
      new MutationObserver(reconcilePromo).observe(items, {
        childList: true,
        subtree: true
      });
    }

    drawer.addEventListener(
      'change',
      function (e) {
        if (!e.target || !e.target.matches('.m-quantity__input')) return;
        var lineIndex = parseInt(e.target.getAttribute('data-index'), 10);
        setPendingLineQty(lineIndex, parseInt(e.target.value, 10) || 1);
        instantRefresh();
      },
      true
    );

    drawer.addEventListener(
      'click',
      function (e) {
        var btn = e.target.closest('.m-quantity__button');
        if (!btn) return;
        var pending = pendingQtyFromButton(btn);
        if (pending.pendingInput && pending.pendingQty != null) {
          var lineIndex = parseInt(pending.pendingInput.getAttribute('data-index'), 10);
          setPendingLineQty(lineIndex, pending.pendingQty);
        }
        requestAnimationFrame(function () {
          instantRefresh(pending.pendingQty, pending.pendingInput);
        });
      },
      true
    );
  }

  function ensureApplied(cart) {
    var el = root();
    if (!el || applying) return Promise.resolve();
    var c = cfg(el);

    return (cart ? Promise.resolve(cart) : fetchCart()).then(function (currentCart) {
      if (!currentCart || !currentCart.item_count) return currentCart;

      var analysis = analyzeCart(currentCart);
      if (!analysis.primaryRule) {
        paint(el, currentCart);
        return currentCart;
      }

      var code = analysis.primaryRule.code;
      var already = shopifyDiscountForCode(currentCart, code) > 0;
      var stored = '';
      try {
        stored = (localStorage.getItem(STORAGE_KEY) || '').toUpperCase();
      } catch (e) {}

      if (already && stored === code) {
        paint(el, currentCart);
        return currentCart;
      }

      applying = true;
      el.classList.add('is-loading');

      return applyDiscount(code)
        .then(function (updated) {
          remember(code);
          if (updated && typeof updated.item_count !== 'undefined') {
            paint(el, updated);
            return updated;
          }
          return syncFromCart();
        })
        .catch(function () {
          remember(code);
          return syncFromCart();
        })
        .finally(function () {
          applying = false;
          el.classList.remove('is-loading');
        });
    });
  }

  function maybeAutoApply() {
    var el = root();
    if (!el) return;
    var c = cfg(el);
    if (!c.autoApply) return;
    ensureApplied();
  }

  function setCouponsOpen(open) {
    var promo = root();
    var panel = document.querySelector('[data-scale-o-promo-list]');
    var toggles = document.querySelectorAll('[data-scale-o-promo-toggle]');
    var drawer = document.querySelector('.scale-o-cart-drawer');

    if (promo) promo.classList.toggle('is-list-open', !!open);
    if (panel) panel.hidden = !open;
    toggles.forEach(function (btn) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.classList.toggle('is-open', open);
    });
    if (drawer) drawer.classList.toggle('is-coupons-open', !!open);
  }

  function onToggleClick(e) {
    var btn = e.target.closest('[data-scale-o-promo-toggle]');
    if (!btn) return;
    e.preventDefault();
    var promo = root();
    var open = promo && promo.classList.contains('is-list-open');
    setCouponsOpen(!open);
  }

  function bind() {
    document.addEventListener('click', onToggleClick);

    document.addEventListener('cart:updated', instantRefresh);
    document.addEventListener('minimog:cart:change', instantRefresh);
    if (window.MinimogEvents && typeof MinimogEvents.subscribe === 'function') {
      try {
        MinimogEvents.subscribe('cart:updated', instantRefresh);
        MinimogEvents.subscribe('cart:change', instantRefresh);
      } catch (e) {}
    }

    observeCartUpdates();

    var drawer = document.querySelector('m-cart-drawer, #MinimogCartDrawer');
    if (drawer) {
      var observer = new MutationObserver(function () {
        if (drawer.classList.contains('m-cart-drawer--active')) {
          instantRefresh();
        } else {
          setCouponsOpen(false);
        }
      });
      observer.observe(drawer, { attributes: true, attributeFilter: ['class'] });
    }

    syncFromCart().then(maybeAutoApply);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
