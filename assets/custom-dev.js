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