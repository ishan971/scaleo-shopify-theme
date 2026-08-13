/**
 * Scale-O People & Property — accessible tabs + reveal
 */
(function () {
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)');

  function initReveal(root) {
    var items = root.querySelectorAll('[data-soa-animate]');
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
    }, { threshold: 0.16, rootMargin: '0px 0px -6% 0px' });

    items.forEach(function (el, index) {
      el.style.transitionDelay = Math.min(index * 50, 300) + 'ms';
      observer.observe(el);
    });
  }

  function initTabs(root) {
    var tablist = root.querySelector('[data-soa-tabs]');
    var tabs = root.querySelectorAll('[data-soa-tab]');
    var panels = root.querySelectorAll('[data-soa-panel]');
    if (!tablist || tabs.length < 2) return;

    function setActive(name, focusTab) {
      tabs.forEach(function (tab) {
        var on = tab.getAttribute('data-soa-tab') === name;
        tab.classList.toggle('is-active', on);
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
        tab.setAttribute('tabindex', on ? '0' : '-1');
        if (on && focusTab) tab.focus();
      });
      panels.forEach(function (panel) {
        var on = panel.getAttribute('data-soa-panel') === name;
        panel.classList.toggle('is-active', on);
        panel.hidden = !on;
      });
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () {
        setActive(tab.getAttribute('data-soa-tab'), false);
      });
      tab.addEventListener('keydown', function (event) {
        var next = index;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault();
        setActive(tabs[next].getAttribute('data-soa-tab'), true);
      });
    });
  }

  function init(root) {
    if (!root || root.dataset.soaInit === 'true') return;
    root.dataset.soaInit = 'true';
    initTabs(root);
    initReveal(root);
  }

  function boot() {
    document.querySelectorAll('.scale-o-advantages').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('shopify:section:load', function (event) {
    var root = event.target && event.target.querySelector('.scale-o-advantages');
    if (root) {
      root.dataset.soaInit = 'false';
      init(root);
    }
  });
})();
