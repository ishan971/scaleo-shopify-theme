/**
 * Scale-O How It Works — journey carousel, tabs, step focus, video modal
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

  function initJourneyCarousel(root) {
    var steps = root.querySelectorAll('[data-journey-step]');
    var slides = root.querySelectorAll('[data-journey-slide]');
    var stepsList = root.querySelector('.scale-o-how-it-works__steps');
    if (!steps.length) return null;

    var autoplayEnabled = root.getAttribute('data-journey-autoplay') === 'true';
    var hoverEnabled = root.getAttribute('data-journey-hover') !== 'false';
    var intervalMs = parseInt(root.getAttribute('data-journey-interval'), 10) || 4000;
    var activeIndex = 0;
    var timer = null;
    var paused = false;

    function activateStep(index, fromUser) {
      if (!steps.length) return;

      if (index < 0) index = steps.length - 1;
      if (index >= steps.length) index = 0;

      activeIndex = index;

      steps.forEach(function (step, i) {
        var isActive = i === index;
        step.classList.toggle('is-active', isActive);
        step.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });

      if (fromUser) {
        restartAutoplay();
      }
    }

    function nextStep() {
      activateStep(activeIndex + 1, false);
    }

    function stopAutoplay() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function startAutoplay() {
      stopAutoplay();
      if (!autoplayEnabled || prefersReducedMotion() || steps.length < 2 || paused) return;
      timer = setInterval(nextStep, intervalMs);
    }

    function restartAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    steps.forEach(function (step, index) {
      step.addEventListener('click', function () {
        activateStep(index, true);
      });

      step.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activateStep(index, true);
        }
      });

      if (hoverEnabled) {
        step.addEventListener('mouseenter', function () {
          activateStep(index, false);
        });
      }

      step.addEventListener('focusin', function () {
        activateStep(index, false);
      });
    });

    if (stepsList) {
      stepsList.addEventListener('mouseenter', function () {
        paused = true;
        stopAutoplay();
      });

      stepsList.addEventListener('mouseleave', function () {
        paused = false;
        startAutoplay();
      });

      stepsList.addEventListener('focusin', function () {
        paused = true;
        stopAutoplay();
      });

      stepsList.addEventListener('focusout', function (e) {
        if (!stepsList.contains(e.relatedTarget)) {
          paused = false;
          startAutoplay();
        }
      });
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stopAutoplay();
      } else if (!paused) {
        startAutoplay();
      }
    });

    activateStep(0, false);
    startAutoplay();

    return {
      destroy: stopAutoplay,
      activate: activateStep
    };
  }

  function initSection(root) {
    if (!root || root.dataset.hiwInit === 'true') return;
    root.dataset.hiwInit = 'true';

    var tabs = root.querySelectorAll('[data-hiw-tab]');
    var panels = root.querySelectorAll('[data-hiw-panel]');
    var videoBtn = root.querySelector('[data-hiw-video-open]');
    var modal = root.querySelector('[data-hiw-modal]');
    var modalClose = root.querySelectorAll('[data-hiw-modal-close]');
    var modalFrame = root.querySelector('[data-hiw-modal-frame]');
    var videoUrl = root.getAttribute('data-video-url');

    var journey = initJourneyCarousel(root);

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

    root._hiwJourney = journey;
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
      if (root._hiwJourney && root._hiwJourney.destroy) {
        root._hiwJourney.destroy();
      }
      root.dataset.hiwInit = 'false';
      initSection(root);
    }
  });
})();
