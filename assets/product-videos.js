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

  function init(root) {
    if (!root) return;
    setupInfinite(root);
    playVideos(root);
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
