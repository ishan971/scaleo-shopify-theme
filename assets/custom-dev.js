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
            $(this).css('display', 'block');
            console.log('yeees');
            showVariantMetafield = true;  // Set flag to true if a matching variant is found
        } else {
            $(this).css('display', 'none');
            console.log('nooot');
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

document.addEventListener('DOMContentLoaded', function () {
  if (!document.querySelector('[data-card-price-format]')) return;

  const picker = document.querySelector('variant-picker[data-product-id]');
  if (!picker || !window.MinimogEvents) return;

  MinimogEvents.subscribe(picker.dataset.productId + '__VARIANT_CHANGE', function (variant) {
    applyCardPriceFormat(variant);
  });
});