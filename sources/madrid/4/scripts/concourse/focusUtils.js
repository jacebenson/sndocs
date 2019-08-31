/*! RESOURCE: /scripts/concourse/focusUtils.js */
function moveFocusToMainContent() {
  var main = top.gsft_main;
  var focusableElement = jQuery(main.document).find(':focusable').first();
  if (focusableElement.length)
    focusableElement.focus();
  else
    main.focus();
}

function moveFocusToNavigationFilter() {
  (function($) {
    if ($('.navpage-layout').hasClass('navpage-nav-collapsed')) {
      CustomEvent.fireAll('magellan_collapse.toggle');
      $(document).one("nav.expanded", function() {
        $('#filter').focus();
      });
    } else {
      if (!$('.navpage-layout').hasClass('magellan-edit-mode')) {
        $('#filter').focus();
      }
    }
  })(jQuery);
};