(function () {
  function bindPack(root) {
    root.querySelectorAll('.cpk__panel').forEach(function (panel) {
      var stages = panel.querySelectorAll('[data-cpk-stage]');
      var nodes = panel.querySelectorAll('.cpk__node');
      var status = panel.querySelector('[data-cpk-status]');
      if (!stages.length) return;

      stages.forEach(function (stage, index) {
        stage.addEventListener('click', function () {
          stages.forEach(function (other, otherIndex) {
            var isActive = other === stage;
            other.classList.toggle('is-active', isActive);
            other.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            if (nodes[otherIndex]) {
              nodes[otherIndex].classList.toggle('is-active', isActive);
            }
          });
          if (status) status.textContent = stage.getAttribute('data-copy') || '';
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-cartridge-pack]').forEach(bindPack);
  });
})();
