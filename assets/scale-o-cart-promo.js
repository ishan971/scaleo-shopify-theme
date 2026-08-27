/**
 * Scale-O cart promo — show Subtotal / Discount / Payable and apply SO-5 early.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'scaleo_cart_promo_code';
  var applying = false;

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
      code: (el.getAttribute('data-promo-code') || 'SO-5').toUpperCase(),
      promoCents: parseInt(el.getAttribute('data-promo-cents') || '50000', 10) || 50000,
      autoApply: el.getAttribute('data-auto-apply') === 'true',
      withCode: el.getAttribute('data-currency-code') === 'true'
    };
  }

  function hasCodeApplied(cart, code) {
    var apps = (cart && cart.cart_level_discount_applications) || [];
    for (var i = 0; i < apps.length; i++) {
      var title = String((apps[i] && (apps[i].title || apps[i].code)) || '').toUpperCase();
      if (title.indexOf(code) !== -1) return true;
    }
    if ((cart && cart.total_discount) >= 1) return true;
    try {
      return (localStorage.getItem(STORAGE_KEY) || '').toUpperCase() === code;
    } catch (e) {
      return false;
    }
  }

  function markApplied(el, applied) {
    if (!el) return;
    el.classList.toggle('is-applied', !!applied);
    var applyBtn = el.querySelector('[data-scale-o-promo-apply]');
    var appliedLabel = el.querySelector('[data-scale-o-promo-applied]');
    if (applyBtn) applyBtn.hidden = !!applied;
    if (appliedLabel) appliedLabel.hidden = !applied;
    var input = el.querySelector('[data-scale-o-promo-input]');
    if (input && applied) input.value = cfg(el).code;
  }

  function paint(el, cart) {
    if (!el || !cart) return;
    var c = cfg(el);
    var itemCount = Number(cart.item_count) || 0;

    if (itemCount < 1) {
      el.hidden = true;
      el.classList.add('is-empty');
      return;
    }
    el.hidden = false;
    el.classList.remove('is-empty');

    var shopDiscount = Number(cart.total_discount) || 0;
    var subtotal =
      Number(cart.original_total_price) ||
      Number(cart.items_subtotal_price) ||
      Number(cart.total_price) + shopDiscount ||
      0;
    if (!subtotal) subtotal = Number(cart.total_price) || 0;

    var applied = hasCodeApplied(cart, c.code) || el.classList.contains('is-applied') || c.autoApply;
    var discount = shopDiscount > 0 ? shopDiscount : applied ? Math.min(c.promoCents, subtotal) : 0;
    var payable = Math.max(0, subtotal - discount);

    var subEl = el.querySelector('[data-scale-o-promo-subtotal]');
    var discEl = el.querySelector('[data-scale-o-promo-discount]');
    var payEl = el.querySelector('[data-scale-o-promo-payable]');
    if (subEl) subEl.textContent = money(subtotal, c.withCode);
    if (discEl) discEl.textContent = '- ' + money(discount, c.withCode);
    if (payEl) payEl.textContent = money(payable, c.withCode);
    markApplied(el, applied && discount > 0);
  }

  function fetchCart() {
    var rootUrl = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
    return fetch(rootUrl + 'cart.js', { credentials: 'same-origin' }).then(function (r) {
      return r.json();
    });
  }

  function applyDiscount(code) {
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
      localStorage.setItem(STORAGE_KEY, code);
    } catch (e) {}
  }

  function syncFromCart() {
    var el = root();
    if (!el) return Promise.resolve();
    return fetchCart().then(function (cart) {
      if (!cart || !cart.item_count) return cart;
      paint(el, cart);
      return cart;
    });
  }

  function ensureApplied() {
    var el = root();
    if (!el || applying) return Promise.resolve();
    var c = cfg(el);
    applying = true;
    el.classList.add('is-loading');

    return applyDiscount(c.code)
      .then(function (cart) {
        remember(c.code);
        markApplied(el, true);
        if (cart && typeof cart.item_count !== 'undefined') {
          paint(el, cart);
        } else {
          return syncFromCart();
        }
      })
      .catch(function () {
        // Still show estimated payable + keep discount input for checkout.
        remember(c.code);
        markApplied(el, true);
        return syncFromCart();
      })
      .finally(function () {
        applying = false;
        el.classList.remove('is-loading');
      });
  }

  function onApplyClick(e) {
    var btn = e.target.closest('[data-scale-o-promo-apply]');
    if (!btn) return;
    e.preventDefault();
    ensureApplied();
  }

  function maybeAutoApply() {
    var el = root();
    if (!el) return;
    var c = cfg(el);
    if (!c.autoApply) return;
    ensureApplied();
  }

  function bind() {
    document.addEventListener('click', onApplyClick);

    document.addEventListener('cart:updated', syncFromCart);
    document.addEventListener('minimog:cart:change', syncFromCart);
    if (window.MinimogEvents && typeof MinimogEvents.subscribe === 'function') {
      try {
        MinimogEvents.subscribe('cart:updated', syncFromCart);
        MinimogEvents.subscribe('cart:change', syncFromCart);
      } catch (e) {}
    }

    // When drawer opens, refresh + auto-apply.
    var drawer = document.querySelector('m-cart-drawer, #MinimogCartDrawer');
    if (drawer) {
      var observer = new MutationObserver(function () {
        if (drawer.classList.contains('m-cart-drawer--active')) {
          syncFromCart().then(maybeAutoApply);
        }
      });
      observer.observe(drawer, { attributes: true, attributeFilter: ['class'] });
    }

    // Initial paint / apply if promo already in DOM (cart has items).
    syncFromCart().then(maybeAutoApply);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
