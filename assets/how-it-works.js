/**
 * Scale-O How It Works — tabs, step focus, video modal
 */
(function () {
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function getYouTubeEmbed(url) {
    if (!url) return null;
    var match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/
    );
    return match ? 'https://www.youtube.com/embed/' + match[1] + '?autoplay=1&rel=0' : null;
  }

  function initSection(root) {
    if (!root || root.dataset.hiwInit === 'true') return;
    root.dataset.hiwInit = 'true';

    var tabs = root.querySelectorAll('[data-hiw-tab]');
    var panels = root.querySelectorAll('[data-hiw-panel]');
    var journeySteps = root.querySelectorAll('[data-journey-step]');
    var videoBtn = root.querySelector('[data-hiw-video-open]');
    var modal = root.querySelector('[data-hiw-modal]');
    var modalClose = root.querySelectorAll('[data-hiw-modal-close]');
    var modalFrame = root.querySelector('[data-hiw-modal-frame]');
    var videoUrl = root.getAttribute('data-video-url');

    function syncPanelHeights(root) {
      var panelsWrap = root.querySelector('[data-hiw-panels]');
      var panels = root.querySelectorAll('[data-hiw-panel]');
      if (!panelsWrap || panels.length < 2) return;

      var maxHeight = 0;

      panels.forEach(function (panel) {
        var wasHidden = panel.hidden;
        panel.hidden = false;
        panel.style.visibility = 'hidden';
        panel.style.position = 'absolute';
        panel.style.left = '0';
        panel.style.right = '0';
        panel.style.top = '0';
        var height = panel.offsetHeight;
        if (height > maxHeight) maxHeight = height;
        panel.style.visibility = '';
        panel.style.position = '';
        panel.style.left = '';
        panel.style.right = '';
        panel.style.top = '';
        panel.hidden = wasHidden;
      });

      panelsWrap.style.setProperty('--hiw-panels-min-height', maxHeight + 'px');
    }

    function setActiveTab(name) {
      tabs.forEach(function (tab) {
        var isActive = tab.getAttribute('data-hiw-tab') === name;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
      panels.forEach(function (panel) {
        var isActive = panel.getAttribute('data-hiw-panel') === name;
        panel.classList.toggle('is-active', isActive);
        panel.hidden = !isActive;
      });
      syncPanelHeights(root);
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        setActiveTab(tab.getAttribute('data-hiw-tab'));
      });
    });

    journeySteps.forEach(function (step, index) {
      function activate() {
        journeySteps.forEach(function (s) {
          s.classList.remove('is-active');
        });
        step.classList.add('is-active');
      }
      step.addEventListener('mouseenter', activate);
      step.addEventListener('focusin', activate);
      if (index === 0) step.classList.add('is-active');
    });

    function openModal() {
      var embed = getYouTubeEmbed(videoUrl);
      if (!modal || !embed || !modalFrame) return;
      modalFrame.src = embed;
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      if (!modal || !modalFrame) return;
      modal.hidden = true;
      modalFrame.src = '';
      document.body.style.overflow = '';
    }

    if (videoBtn && videoUrl) {
      videoBtn.addEventListener('click', openModal);
    }

    modalClose.forEach(function (btn) {
      btn.addEventListener('click', closeModal);
    });

    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal || e.target.hasAttribute('data-hiw-modal-close')) {
          closeModal();
        }
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal && !modal.hidden) closeModal();
    });

    syncPanelHeights(root);

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        syncPanelHeights(root);
      }, 150);
    });
  }

  function boot() {
    document.querySelectorAll('.scale-o-how-it-works').forEach(initSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('shopify:section:load', function (event) {
    var section = event.target;
    if (!section) return;
    var root = section.querySelector('.scale-o-how-it-works');
    if (root) {
      root.dataset.hiwInit = 'false';
      initSection(root);
    }
  });
})();
