(function () {
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)');

  function playVideos(root) {
    if (root.dataset.autoplay !== 'true' || REDUCE.matches) return;
    root.querySelectorAll('.so-pvid__video').forEach(function (video) {
      if (video.tagName !== 'VIDEO') return;
      video.muted = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    });
  }

  function cloneOriginals(track, originals, root) {
    originals.forEach(function (item) {
      var clone = item.cloneNode(true);
      clone.removeAttribute('data-pvid-original');
      clone.setAttribute('data-clone', 'true');
      clone.removeAttribute('data-shopify-editor-block');
      clone.querySelectorAll('video').forEach(function (video) {
        video.muted = true;
        if (root.dataset.autoplay === 'true') {
          video.setAttribute('autoplay', '');
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
          }
        }
      });
      clone.querySelectorAll('[data-pvid-sound]').forEach(resetSoundButton);
      track.appendChild(clone);
    });
  }

  function originalLoopWidth(originals, track) {
    if (!originals.length) return 0;
    var first = originals[0];
    var last = originals[originals.length - 1];
    var gap = parseFloat(window.getComputedStyle(track).columnGap || window.getComputedStyle(track).gap) || 0;
    return last.offsetLeft + last.offsetWidth - first.offsetLeft + gap;
  }

  function setupInfinite(root) {
    var track = root.querySelector('[data-pvid-track]');
    var viewport = root.querySelector('.so-pvid__viewport');
    if (!track || !viewport) return;

    var originals = Array.prototype.slice.call(track.querySelectorAll('[data-pvid-original]'));
    if (!originals.length) {
      originals = Array.prototype.slice.call(track.querySelectorAll('.so-pvid__item:not([data-clone])'));
    }

    if (root.dataset.infinite !== 'true' || REDUCE.matches || originals.length < 1) {
      track.classList.add('is-ready');
      return;
    }

    var needed = viewport.clientWidth * 2 + 80;
    var guard = 0;
    while (track.scrollWidth < needed && guard < 10) {
      cloneOriginals(track, originals, root);
      guard += 1;
    }

    var loopPx = originalLoopWidth(originals, track);
    if (loopPx > 0) {
      track.style.setProperty('--pvid-loop', loopPx + 'px');
    }
    track.classList.add('is-ready');
  }

  function resetSoundButton(btn) {
    if (!btn) return;
    btn.classList.remove('is-on');
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', 'Unmute review');
  }

  function setCardSound(root, video, on) {
    root.querySelectorAll('video.so-pvid__video').forEach(function (item) {
      var btn = item.closest('.so-pvid__media')
        ? item.closest('.so-pvid__media').querySelector('[data-pvid-sound]')
        : null;
      if (on && item === video) {
        item.muted = false;
        item.volume = 1;
        if (item.paused) {
          var playPromise = item.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
          }
        }
        if (btn) {
          btn.classList.add('is-on');
          btn.setAttribute('aria-pressed', 'true');
          btn.setAttribute('aria-label', 'Mute review');
        }
      } else {
        item.muted = true;
        resetSoundButton(btn);
      }
    });
    root.classList.toggle('so-pvid--listening', !!on);
  }

  function bindSound(root) {
    if (!root || root.dataset.pvidSoundBound === 'true') return;
    root.dataset.pvidSoundBound = 'true';
    root.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-pvid-sound]');
      if (!btn || !root.contains(btn)) return;
      event.preventDefault();
      event.stopPropagation();
      var media = btn.closest('.so-pvid__media');
      var video = media ? media.querySelector('video.so-pvid__video') : null;
      if (!video) return;
      setCardSound(root, video, !btn.classList.contains('is-on'));
    });
  }

  function init(root) {
    if (!root) return;
    root.classList.remove('so-pvid--listening');
    root.querySelectorAll('[data-pvid-sound]').forEach(resetSoundButton);
    setupInfinite(root);
    playVideos(root);
    bindSound(root);
    root.setAttribute('data-pvid-ready', 'true');
  }

  function initAll(scope) {
    (scope || document).querySelectorAll('[data-product-videos]').forEach(function (root) {
      root.removeAttribute('data-pvid-ready');
      var track = root.querySelector('[data-pvid-track]');
      if (track) {
        track.querySelectorAll('[data-clone]').forEach(function (clone) {
          clone.parentNode.removeChild(clone);
        });
        track.classList.remove('is-ready');
      }
      init(root);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initAll(document);
  });

  document.addEventListener('shopify:section:load', function (event) {
    initAll(event.target);
  });

  document.addEventListener('shopify:section:select', function (event) {
    initAll(event.target);
  });

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      initAll(document);
    }, 200);
  });

  if (document.readyState !== 'loading') initAll(document);
})();
