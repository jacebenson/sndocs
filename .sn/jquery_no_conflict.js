/*! RESOURCE: /scripts/lib/jquery/jquery_no_conflict.js */
(function() {
    if (window.$j_glide) {
        jQuery.noConflict(true);
        window.jQuery = $j_glide;
    }
    window.$j = window.$j_glide = jQuery.noConflict();
})();;