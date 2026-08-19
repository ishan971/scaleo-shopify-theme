/**
 * Scale-O Technology Video — deferred playback + optional modal
 */
(function () {
  function init(root) {
    if (!root || root.dataset.stvInit === 'true') return;
    root.dataset.stvInit = 'true';

    var playBtn = root.querySelector('[data-stv-play]');
    var stage = root.querySelector('[data-stv-stage]');
    var modal = root.querySelector('[data-stv-modal]');
    var modalClose = root.querySelectorAll('[data-stv-modal-close]');
    var modalMount = root.querySelector('[data-stv-modal-mount]');
    var openModal = root.dataset.openModal === 'true';
    var autoplay = root.dataset.autoplay === 'true';

    function mediaHtml() {
      var type = root.dataset.mediaType;
      var src = root.dataset.mediaSrc;
      var title = root.dataset.mediaTitle || 'Scale-O video';
      var loop = root.dataset.loop === 'true';
      var muted = root.dataset.muted === 'true' || autoplay;
      var controls = root.dataset.controls !== 'false';
      var playsinline = root.dataset.playsinline !== 'false';
      if (!src) return '';

      if (type === 'shopify') {
        return '<video class="scale-o-tech-video__video" src="' + src + '" ' +
          (controls ? 'controls ' : '') +
          (loop ? 'loop ' : '') +
          (muted ? 'muted ' : '') +
          (playsinline ? 'playsinline ' : '') +
          'autoplay></video>';
      }

      return '<iframe class="scale-o-tech-video__iframe" src="' + src +
        '" title="' + title.replace(/"/g, '') +
        '" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
    }

    function playInline() {
      if (!stage) return;
      stage.innerHTML = mediaHtml();
      root.classList.add('is-playing');
      var video = stage.querySelector('video');
      if (video && video.play) video.play().catch(function () {});
    }

    function openVideoModal() {
      if (!modal || !modalMount) return;
      modalMount.innerHTML = mediaHtml();
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      var close = modal.querySelector('[data-stv-modal-close]');
      if (close) close.focus();
    }

    function closeVideoModal() {
      if (!modal || !modalMount) return;
      modal.hidden = true;
      modalMount.innerHTML = '';
      document.body.style.overflow = '';
      if (playBtn) playBtn.focus();
    }

    function start() {
      if (openModal) openVideoModal();
      else playInline();
    }

    if (playBtn) {
      playBtn.addEventListener('click', function (event) {
        event.preventDefault();
        start();
      });
    }

    modalClose.forEach(function (btn) {
      btn.addEventListener('click', closeVideoModal);
    });

    if (modal) {
      modal.addEventListener('click', function (event) {
        if (event.target === modal) closeVideoModal();
      });
    }

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && modal && !modal.hidden) closeVideoModal();
    });

    if (autoplay && !openModal) start();
  }

  function boot() {
    document.querySelectorAll('.scale-o-tech-video').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('shopify:section:load', function (event) {
    var root = event.target && event.target.querySelector('.scale-o-tech-video');
    if (root) {
      root.dataset.stvInit = 'false';
      init(root);
    }
  });
})();
