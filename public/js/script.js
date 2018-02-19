var toggleFeatures = function(){
    jQuery('.feature').each(function(index){
        jQuery(this).toggleClass("d-none");
    });
    jQuery('#feature-control').toggleClass('fa-angle-up');
    jQuery('#feature-control').toggleClass('fa-angle-down');
}