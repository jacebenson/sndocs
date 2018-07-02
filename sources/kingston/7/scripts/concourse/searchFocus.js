/*! RESOURCE: /scripts/concourse/searchFocus.js */
(function($) {
  $(function() {
    var search = $('#sysparm_search');
    search.on('focus', function() {
      search.addClass('focus');
    });
    search.on('blur', function() {
      if (!search.val()) {
        search.removeClass('focus');
      }
    });
  });
})(jQuery);;