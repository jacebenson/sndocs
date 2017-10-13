/*! RESOURCE: /scripts/heisenberg/custom/dropdowns.js */
(function($) {
  "use strict";
  $(document).on('show.bs.dropdown', function(evt) {
    $(evt.relatedTarget).hideFix()
      .parent().hideFix()
      .closest('.dropup, .dropdown').hideFix();
  });
})(jQuery);;