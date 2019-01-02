(function() {
  if (window.$j_glide) {
    jQuery.noConflict(true);
    window.jQuery = $j_glide;
  }
  window.$j = window.$j_glide = jQuery.noConflict();
})();