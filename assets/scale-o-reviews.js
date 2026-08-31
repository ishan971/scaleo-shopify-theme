/**
 * Scale-O Customer Reviews — Judge.me layout tweaks
 * 1. Move rating summary above the review carousel (DOM reorder)
 * 2. Hide aggregate CONCEPT / CONVENIENCE / QUALITY bars
 */
(function () {
  var ROOT_SEL = '.scale-o-reviews';

  function hideAggregateBars(root) {
    [
      '.jdgm-cf-bars-wrapper',
      '.jdgm-custom-forms-avg-responses',
      '.jdgm-custom-forms-avg-responses-data',
      '.jdgm-custom-forms-filters',
      '.jdgm-custom-forms-filters-data'
    ].forEach(function (sel) {
      root.querySelectorAll(sel).forEach(function (el) {
        el.setAttribute('hidden', 'hidden');
        el.style.display = 'none';
      });
    });
  }

  function findSnippetBlock(root) {
    var cards = root.querySelector('[class*="jdgm-rev-snippet-widget__cards-container"]');
    if (cards) {
      var block = cards.closest('[class*="jdgm-rev-snippet-widget"]');
      if (block) return block;
    }

    var candidates = root.querySelectorAll('[class*="jdgm-rev-snippet-widget"]');
    for (var i = 0; i < candidates.length; i++) {
      var node = candidates[i];
      if (node.querySelector('[class*="jdgm-rev-snippet-widget__cards-container"]')) {
        return node;
      }
    }

    return candidates[0] || null;
  }

  function headerIsBeforeSnippet(header, snippet) {
    return Boolean(header.compareDocumentPosition(snippet) & Node.DOCUMENT_POSITION_FOLLOWING);
  }

  function reorderWidget(root) {
    hideAggregateBars(root);

    var header = root.querySelector('.jdgm-rev-widg__header');
    var snippet = findSnippetBlock(root);
    if (!header || !snippet) return false;

    if (headerIsBeforeSnippet(header, snippet)) {
      root.classList.add('scale-o-reviews--layout-ready');
      return true;
    }

    var parent = snippet.parentElement;
    if (!parent) return false;

    parent.insertBefore(header, snippet);
    root.classList.add('scale-o-reviews--layout-ready');
    return true;
  }

  function initRoot(root) {
    if (!root || root.dataset.scaleOReviewsInit === 'true') return;
    root.dataset.scaleOReviewsInit = 'true';

    var tryReorder = function () {
      reorderWidget(root);
    };

    tryReorder();

    var observer = new MutationObserver(tryReorder);
    observer.observe(root, { childList: true, subtree: true });

    window.setTimeout(tryReorder, 500);
    window.setTimeout(tryReorder, 1500);
    window.setTimeout(tryReorder, 3000);
  }

  function init() {
    document.querySelectorAll(ROOT_SEL).forEach(initRoot);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  document.addEventListener('shopify:section:load', init);
})();
