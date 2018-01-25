var toggleFeatures = function(){
    jQuery('.feature').each(function(index){
        //jQuery(this).toggleClass("d-none");
        jQuery(this).toggleClass("invisible");
    });
    jQuery('#feature-control').toggleClass('fa-minus-square');
    jQuery('#feature-control').toggleClass('fa-plus-square');
}