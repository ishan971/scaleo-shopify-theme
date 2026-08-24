/**
 * Scale-O Comparison — reveal animations + competitor versus tabs
 */
(function () {
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)');

  function initReveal(root) {
    var items = root.querySelectorAll('[data-stc-animate]');
    if (!items.length) return;

    if (root.dataset.animate !== 'true' || REDUCE.matches || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    items.forEach(function (el, index) {
      el.style.transitionDelay = Math.min(index * 60, 240) + 'ms';
      observer.observe(el);
    });
  }

  function selectTab(list, tab) {
    if (!list || !tab) return;
    var tabs = list.querySelectorAll('[data-stc-tab]');
    var panels = list.querySelectorAll('[data-stc-panel]');
    var panelId = tab.getAttribute('aria-controls');

    tabs.forEach(function (item) {
      var on = item === tab;
      item.classList.toggle('is-active', on);
      item.setAttribute('aria-selected', String(on));
      item.tabIndex = on ? 0 : -1;
    });

    panels.forEach(function (panel) {
      var on = panel.id === panelId;
      panel.classList.toggle('is-active', on);
      panel.hidden = !on;
      panel.setAttribute('aria-hidden', String(!on));
    });

    if (typeof tab.scrollIntoView === 'function') {
      tab.scrollIntoView({
        inline: 'center',
        block: 'nearest',
        behavior: REDUCE.matches ? 'auto' : 'smooth'
      });
    }
  }

  function initVersus(root) {
    var list = root.querySelector('[data-stc-versus]');
    if (!list || list.dataset.stcVersusInit === 'true') return;
    list.dataset.stcVersusInit = 'true';

    var tabs = list.querySelectorAll('[data-stc-tab]');
    if (!tabs.length) return;

    list.addEventListener('click', function (event) {
      var tab = event.target.closest('[data-stc-tab]');
      if (!tab || !list.contains(tab)) return;
      selectTab(list, tab);
    });

    list.addEventListener('keydown', function (event) {
      var tab = event.target.closest('[data-stc-tab]');
      if (!tab || !list.contains(tab)) return;
      var items = Array.prototype.slice.call(tabs);
      var index = items.indexOf(tab);
      if (index < 0) return;
      var next = -1;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % items.length;
      else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + items.length) % items.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = items.length - 1;
      if (next < 0) return;
      event.preventDefault();
      items[next].focus();
      selectTab(list, items[next]);
    });
  }

  function init(root) {
    if (!root) return;
    if (root.dataset.stcInit !== 'true') {
      root.dataset.stcInit = 'true';
      initReveal(root);
    }
    initVersus(root);
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
      var versus = root.querySelector('[data-stc-versus]');
      if (versus) versus.dataset.stcVersusInit = 'false';
      init(root);
    }
  });

  document.addEventListener('shopify:block:select', function (event) {
    var tab = event.target && event.target.closest('[data-stc-tab]');
    if (!tab) return;
    var list = tab.closest('[data-stc-versus]');
    if (!list) return;
    selectTab(list, tab);
  });
})();
