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
  if (cents == null) return '';
  const amount = Math.round(cents / 100);
  return '₹' + amount.toLocaleString('en-IN') + ' /-';
}

function applyCardPriceFormat(variant) {
  const priceBlock = document.querySelector('.main-product__block-price [data-card-price-format]');
  if (!priceBlock || !variant) return;

  const saleEl = priceBlock.querySelector('.m-price-item--sale');
  const compareEl = priceBlock.querySelector('.m-price__sale .m-price-item--regular');
  const regularEl = priceBlock.querySelector('.m-price__regular .m-price-item--regular');

  if (saleEl) saleEl.textContent = formatCardPrice(variant.price);
  if (compareEl && variant.compare_at_price > variant.price) {
    compareEl.textContent = formatCardPrice(variant.compare_at_price);
  }
  if (regularEl) regularEl.textContent = formatCardPrice(variant.price);
}

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

  if (!document.querySelector('[data-card-price-format]')) return;

  const picker = document.querySelector('variant-picker[data-product-id]');
  if (!picker || !window.MinimogEvents) return;

  MinimogEvents.subscribe(picker.dataset.productId + '__VARIANT_CHANGE', function (variant) {
    applyCardPriceFormat(variant);
  });
});
