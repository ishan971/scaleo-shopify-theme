// $('.m-product-option--content input[type="radio"]').change(function() {
//     var selectedVariantId = $(this).val(); 
//     $('.selected-variant-metafield').each(function(){
//         var abc = $(this).attr('data-variant-name');
//         var data_avl = $(this).attr('data-available');
//             if(selectedVariantId == abc && data_avl == "yes"){
//               $(this).css('display', 'block');
//               console.log('yeees')
//               $('.variant-metafields').css('display', 'block')
//             }else{
//               $(this).css('display', 'none');
//               $('.variant-metafields').css('display', 'none')
//               console.log('nooot')
//             }
//     })
//   });


$('.m-product-option--content input[type="radio"]').change(function() {
    var selectedVariantId = $(this).val(); 
    var showVariantMetafield = false;  // Flag to track if any variant matches

    $('.selected-variant-metafield').each(function(){
        var abc = $(this).attr('data-variant-name');
        var data_avl = $(this).attr('data-available');
        
        if(selectedVariantId == abc && data_avl == "yes"){
            $(this).addClass('is-active').css('display', '');
            showVariantMetafield = true;
        } else {
            $(this).removeClass('is-active').css('display', '');
        }
    });

    // If no variant matched or all are unavailable, hide the main element
    if (!showVariantMetafield) {
        $('.variant-metafields').css('display', 'none');
    } else {
        $('.variant-metafields').css('display', 'block');
    }
});

  // $('.collection-banner-wrapper').slick({
  // slidesToShow: 1
  // });

function formatCardPrice(cents) {
  if (cents == null || cents === '') return '';
  var amount = Math.round(Number(cents) / 100);
  if (isNaN(amount)) return '';
  return '₹' + amount.toLocaleString('en-IN') + ' /-';
}

function applyCardPriceFormat(variant) {
  if (!variant) return;

  var priceBlock = document.querySelector('.main-product__block-price [data-card-price-format]')
    || document.querySelector('[data-card-price-format]');
  if (!priceBlock) return;

  var saleEl = priceBlock.querySelector('.product-price-strip__sale')
    || priceBlock.querySelector('.m-price-item--sale');
  var compareEl = priceBlock.querySelector('.product-price-strip__compare')
    || priceBlock.querySelector('.m-price-item--regular');
  var saveEl = priceBlock.querySelector('.product-price-strip__save');
  var saveAmountEl = priceBlock.querySelector('[data-saved-price]');
  var mrpGroup = priceBlock.querySelector('.product-price-strip__group--mrp');
  var saveGroup = priceBlock.querySelector('.product-price-strip__group--save');

  var price = Number(variant.price);
  var compare = Number(variant.compare_at_price || 0);
  var onSale = compare > price;

  if (saleEl) saleEl.textContent = formatCardPrice(price);

  if (onSale) {
    if (compareEl) compareEl.textContent = formatCardPrice(compare);
    if (mrpGroup) mrpGroup.style.display = '';
    var pct = Math.round(((compare - price) * 100) / compare);
    if (saveAmountEl) {
      saveAmountEl.textContent = pct + '%';
    } else if (saveEl) {
      saveEl.textContent = 'Save ' + pct + '%';
    }
    if (saveGroup) saveGroup.style.display = '';
    else if (saveEl) saveEl.style.display = '';
    priceBlock.classList.add('m-price--on-sale');
  } else {
    if (mrpGroup) mrpGroup.style.display = 'none';
    if (saveGroup) saveGroup.style.display = 'none';
    else if (saveEl) saveEl.style.display = 'none';
    priceBlock.classList.remove('m-price--on-sale');
  }
}

function bindCardPriceVariantSync() {
  if (!document.querySelector('[data-card-price-format]')) return;
  if (window.__scaleoCardPriceBound) return;
  window.__scaleoCardPriceBound = true;

  function onVariant(variant) {
    applyCardPriceFormat(variant);
  }

  function subscribeMinimog() {
    var picker = document.querySelector('variant-picker[data-product-id], variant-picker');
    if (!picker || !window.MinimogEvents || typeof window.MinimogEvents.subscribe !== 'function') {
      return false;
    }
    var productId = picker.dataset.productId || picker.getAttribute('data-product-id');
    if (!productId) return false;
    window.MinimogEvents.subscribe(productId + '__VARIANT_CHANGE', onVariant);
    return true;
  }

  if (!subscribeMinimog()) {
    var tries = 0;
    var timer = setInterval(function () {
      tries += 1;
      if (subscribeMinimog() || tries > 40) clearInterval(timer);
    }, 250);
  }

  // Fallback: plan card radio changes (works even if MinimogEvents is late)
  document.addEventListener('change', function (event) {
    var input = event.target;
    if (!input || input.type !== 'radio') return;
    if (!input.closest('variant-picker, .variant-cards-container, .m-product-option')) return;

    var picker = input.closest('variant-picker') || document.querySelector('variant-picker');
    if (!picker) return;

    var variant = null;
    if (picker.currentVariant) {
      variant = picker.currentVariant;
    } else if (typeof picker.getSelectedVariant === 'function') {
      try { picker.getSelectedVariant(); } catch (e) {}
      variant = picker.currentVariant || null;
    }

    if (!variant && picker.variantData && input.value) {
      var list = typeof picker.variantData === 'string'
        ? (function () { try { return JSON.parse(picker.variantData); } catch (e) { return []; } })()
        : picker.variantData;
      if (Array.isArray(list)) {
        variant = list.find(function (v) { return String(v.id) === String(input.value); }) || null;
      }
    }

    // Last resort: read price from the selected plan card labels
    if (!variant) {
      var node = input.closest('.m-product-option--node');
      var priceNode = node && node.querySelector('.variant-card-price');
      var compareNode = node && node.querySelector('.variant-card-compare');
      var saveNode = node && node.querySelector('.variant-card-save, .discount-sale-badge');
      if (priceNode) {
        var parseRupee = function (txt) {
          var n = String(txt || '').replace(/[^\d]/g, '');
          return n ? Number(n) * 100 : 0;
        };
        variant = {
          price: parseRupee(priceNode.textContent),
          compare_at_price: compareNode ? parseRupee(compareNode.textContent) : 0
        };
      }
    }

    if (variant) onVariant(variant);
  });
}

document.addEventListener('DOMContentLoaded', bindCardPriceVariantSync);
if (document.readyState !== 'loading') bindCardPriceVariantSync();

var swipeupReelTitles = [];
window.addEventListener('SwipeUp::INIT', function (event) {
  var reels = event && event.detail && event.detail.feed && event.detail.feed.Reels;
  if (!reels || !reels.length) return;
  swipeupReelTitles = reels.map(function (reel, index) {
    var name = (reel && reel.name ? String(reel.name) : '').trim();
    if (name && name.toLowerCase() !== 'untitled') return name;
    var productTitle = reel && reel.products && reel.products[0] && reel.products[0].title;
    if (productTitle) return String(productTitle).trim();
    var fallbacks = [
      'Using Scale-O at home',
      'Real customer story',
      'Simple to install',
      'Honest review',
      'Why we switched',
      'Family approved',
      'See the difference'
    ];
    return fallbacks[index % fallbacks.length];
  });
});

function enhanceSwipeUpReels() {
  var host = document.querySelector('[id^="reel-feed-shadow_"]');
  if (!host || !host.shadowRoot) return false;
  var root = host.shadowRoot;
  var slider = root.querySelector('.SwipeUp-slider');
  if (!slider) return false;
  var slides = Array.prototype.slice.call(slider.querySelectorAll('.SwipeUp-slide'));
  if (slides.length < 2) return false;
  if (slider.getAttribute('data-so-enhanced') === 'true') return true;

  if (!swipeupReelTitles.length && window.swipeupViewerConfig && window.swipeupViewerConfig.feed && window.swipeupViewerConfig.feed.Reels) {
    swipeupReelTitles = window.swipeupViewerConfig.feed.Reels.map(function (reel, index) {
      var name = (reel && reel.name ? String(reel.name) : '').trim();
      if (name && name.toLowerCase() !== 'untitled') return name;
      var productTitle = reel && reel.products && reel.products[0] && reel.products[0].title;
      if (productTitle) return String(productTitle).trim();
      return '';
    });
  }

  var fallbacks = [
    'Using Scale-O at home',
    'Real customer story',
    'Simple to install',
    'Honest review',
    'Why we switched',
    'Family approved',
    'See the difference'
  ];

  slides.forEach(function (slide, index) {
    if (slide.querySelector('.so-reel-caption')) return;
    var productName = slide.querySelector('.SwipeUp-slide-product-name');
    var title = (swipeupReelTitles[index] || (productName ? productName.textContent : '') || fallbacks[index % fallbacks.length]).trim();
    var caption = document.createElement('div');
    caption.className = 'so-reel-caption';
    caption.textContent = title;
    slide.appendChild(caption);
  });

  slides.forEach(function (slide) {
    var clone = slide.cloneNode(true);
    clone.querySelectorAll('video').forEach(function (video) {
      video.removeAttribute('autoplay');
      video.preload = 'none';
      if (video.pause) video.pause();
    });
    slider.appendChild(clone);
  });

  var seconds = Math.max(28, slides.length * 5);
  var style = document.createElement('style');
  style.textContent =
    '.SwipeUp-reels-feed{overflow:hidden!important;min-height:0!important;padding:4px 0 8px;}' +
    '.SwipeUp-reels-scrollButtonLeft,.SwipeUp-reels-scrollButtonRight{display:none!important;}' +
    '.SwipeUp-slider{overflow:visible!important;scroll-snap-type:none!important;scroll-behavior:auto!important;padding:4px 0 0!important;width:max-content;gap:14px;animation:so-reel-marquee ' + seconds + 's linear infinite;}' +
    '.SwipeUp-slide{margin:0!important;height:auto!important;max-width:188px!important;overflow:visible!important;background:transparent;border-radius:0;display:flex;flex-direction:column;align-items:flex-start;}' +
    '.SwipeUp-slide:first-of-type,.SwipeUp-slide:last-of-type{margin:0!important;}' +
    '.SwipeUp-slide-reel-pic{width:188px;height:320px;object-fit:cover;border-radius:16px;display:block;background:#eef2f7;}' +
    '.SwipeUp-slide-play-button{top:12px;right:12px;width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.92);box-shadow:0 4px 12px rgba(0,0,0,.12);}' +
    '.SwipeUp-slide-reel-product,.SwipeUp-discount-badge{display:none!important;}' +
    '.so-reel-caption{margin-top:10px;padding:0 2px;font-size:13px;font-weight:700;line-height:1.3;color:#1a2b4a;text-align:left;max-width:188px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}' +
    '.SwipeUp-reels-feed:hover .SwipeUp-slider{animation-play-state:paused;}' +
    '@keyframes so-reel-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}' +
    '@media (max-width:767px){.SwipeUp-slide{max-width:150px!important}.SwipeUp-slide-reel-pic{width:150px;height:260px;border-radius:14px}.so-reel-caption{font-size:12px;max-width:150px;margin-top:8px}}' +
    '@media (prefers-reduced-motion:reduce){.SwipeUp-slider{animation:none!important;overflow-x:auto!important}}';
  root.appendChild(style);
  slider.setAttribute('data-so-enhanced', 'true');
  return true;
}

document.addEventListener('DOMContentLoaded', function () {
  var reelTries = 0;
  var reelTimer = setInterval(function () {
    reelTries += 1;
    if (enhanceSwipeUpReels() || reelTries > 48) clearInterval(reelTimer);
  }, 250);

  var specRoot = document.getElementById('product-specifications');
  if (specRoot) {
    specRoot.querySelectorAll('.specs-acc__panel').forEach(function (panel) {
      panel.addEventListener('transitionend', function (event) {
        if (event.propertyName !== 'height') return;
        var item = panel.closest('.specs-acc__item');
        if (item && item.classList.contains('is-open')) {
          panel.style.height = 'auto';
        }
      });
    });

    specRoot.addEventListener('click', function (event) {
      var trigger = event.target.closest('.specs-acc__summary');
      if (!trigger || !specRoot.contains(trigger)) return;
      var item = trigger.closest('.specs-acc__item');
      if (!item) return;
      var panel = item.querySelector('.specs-acc__panel');
      if (!panel) return;
      var opening = !item.classList.contains('is-open');

      if (opening) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        panel.style.height = '0px';
        panel.offsetHeight;
        panel.style.height = panel.scrollHeight + 'px';
      } else {
        panel.style.height = panel.scrollHeight + 'px';
        panel.offsetHeight;
        item.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
        panel.style.height = '0px';
      }
    });
  }
});

(function () {
  function isWaterSoftenersCollection() {
    return /\/collections\/water[-_]softeners\/?$/i.test(window.location.pathname)
      || document.body.classList.contains('water-softener-for-house')
      || document.body.classList.contains('scale-o-collection-water-softeners');
  }

  function syncPromoStickyBar() {
    if (isWaterSoftenersCollection()) {
      document.body.classList.add('scale-o-collection-water-softeners');
    }

    var promo = document.querySelector('[data-scale-o-promo-marquee]');
    var promoSection = document.querySelector('.scale-o-promo-marquee-section')
      || (promo && promo.closest('.shopify-section'));

    if (promoSection) promoSection.classList.add('scale-o-promo-marquee-section');

    var stickyOn = !!(promo && promo.getAttribute('data-sticky') === 'true');
    document.body.classList.toggle('scale-o-promo-sticky-on', stickyOn);

    if (!stickyOn || !promo) {
      document.documentElement.style.removeProperty('--scale-o-promo-bar-height');
      return;
    }

    var height = Math.max(promo.offsetHeight || 0, 36);
    document.documentElement.style.setProperty('--scale-o-promo-bar-height', height + 'px');
  }

  function boot() {
    syncPromoStickyBar();
    window.setTimeout(syncPromoStickyBar, 50);
    window.setTimeout(syncPromoStickyBar, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.addEventListener('load', syncPromoStickyBar);
  window.addEventListener('resize', syncPromoStickyBar);
  document.addEventListener('shopify:section:load', syncPromoStickyBar);
  document.addEventListener('shopify:section:reorder', syncPromoStickyBar);
})();
