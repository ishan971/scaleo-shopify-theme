/**
 * Scale-O FAQ — smooth accordion + optional exclusive open
 */
(function () {
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)');

  function panelOf(item) {
    return item.querySelector('[data-faq-panel]');
  }

  function clearTransition(el) {
    el.style.transition = '';
  }

  function setOpenHeight(el) {
    el.style.height = 'auto';
    el.style.opacity = '1';
  }

  function setClosedHeight(el) {
    el.style.height = '0px';
    el.style.opacity = '0';
  }

  function animateOpen(item, ms) {
    var el = panelOf(item);
    if (!el) {
      item.open = true;
      return;
    }
    item.open = true;
    if (REDUCE.matches || ms <= 0) {
      setOpenHeight(el);
      clearTransition(el);
      return;
    }
    el.style.height = '0px';
    el.style.opacity = '0';
    el.offsetHeight;
    el.style.transition = 'height ' + ms + 'ms ease, opacity ' + ms + 'ms ease';
    el.style.height = el.scrollHeight + 'px';
    el.style.opacity = '1';
    var done = function (e) {
      if (e && e.propertyName && e.propertyName !== 'height') return;
      el.removeEventListener('transitionend', done);
      if (item.open) setOpenHeight(el);
      clearTransition(el);
    };
    el.addEventListener('transitionend', done);
  }

  function animateClose(item, ms) {
    var el = panelOf(item);
    if (!el) {
      item.open = false;
      return;
    }
    if (REDUCE.matches || ms <= 0) {
      item.open = false;
      setClosedHeight(el);
      clearTransition(el);
      return;
    }
    el.style.height = el.scrollHeight + 'px';
    el.style.opacity = '1';
    el.offsetHeight;
    el.style.transition = 'height ' + ms + 'ms ease, opacity ' + ms + 'ms ease';
    el.style.height = '0px';
    el.style.opacity = '0';
    var done = function (e) {
      if (e && e.propertyName && e.propertyName !== 'height') return;
      el.removeEventListener('transitionend', done);
      item.open = false;
      setClosedHeight(el);
      clearTransition(el);
    };
    el.addEventListener('transitionend', done);
  }

  function init(root) {
    if (!root || root.dataset.sofInit === 'true') return;
    root.dataset.sofInit = 'true';

    var exclusive = root.dataset.behavior !== 'multiple';
    var speed = parseInt(root.dataset.speed, 10);
    if (isNaN(speed)) speed = 320;

    var items = Array.prototype.slice.call(root.querySelectorAll('[data-faq-item]'));

    items.forEach(function (item) {
      var panel = panelOf(item);
      var summary = item.querySelector('[data-faq-summary]');
      if (!panel || !summary) return;

      if (item.open) setOpenHeight(panel);
      else setClosedHeight(panel);
    });

    root.classList.add('scale-o-faq--js');

    items.forEach(function (item) {
      var panel = panelOf(item);
      var summary = item.querySelector('[data-faq-summary]');
      if (!panel || !summary) return;

      summary.addEventListener('click', function (event) {
        event.preventDefault();
        if (item.open) {
          animateClose(item, speed);
          return;
        }
        if (exclusive) {
          items.forEach(function (other) {
            if (other !== item && other.open) animateClose(other, speed);
          });
        }
        animateOpen(item, speed);
      });
    });

    var more = root.querySelector('[data-faq-more]');
    if (more) {
      more.addEventListener('click', function () {
        root.querySelectorAll('[data-faq-extra]').forEach(function (el) {
          el.hidden = false;
        });
        more.hidden = true;
      });
    }
  }

  function scan() {
    document.querySelectorAll('[data-scale-o-faq]').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scan);
  } else {
    scan();
  }

  document.addEventListener('shopify:section:load', function (event) {
    var root = event.target.querySelector('[data-scale-o-faq]');
    if (root) {
      root.dataset.sofInit = '';
      init(root);
    }
  });

  document.addEventListener('shopify:section:unload', function (event) {
    var root = event.target.querySelector('[data-scale-o-faq]');
    if (root) root.dataset.sofInit = '';
  });
})();
