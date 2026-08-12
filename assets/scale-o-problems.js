/**
 * Scale-O Hard Water Problems — View all expand
 */
(function () {
  function init(root) {
    if (!root || root.dataset.problemsInit === 'true') return;
    root.dataset.problemsInit = 'true';

    var toggle = root.querySelector('[data-problems-toggle]');
    var extra = root.querySelector('[data-problems-extra]');
    if (!toggle || !extra) return;

    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      extra.hidden = expanded;
      var showLabel = toggle.getAttribute('data-label-show') || 'View all problems';
      var hideLabel = toggle.getAttribute('data-label-hide') || 'Show fewer problems';
      var labelEl = toggle.querySelector('[data-problems-toggle-label]');
      if (labelEl) labelEl.textContent = expanded ? showLabel : hideLabel;
    });
  }

  function boot() {
    document.querySelectorAll('.scale-o-problems').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('shopify:section:load', function (event) {
    var root = event.target && event.target.querySelector('.scale-o-problems');
    if (root) {
      root.dataset.problemsInit = 'false';
      init(root);
    }
  });
})();
