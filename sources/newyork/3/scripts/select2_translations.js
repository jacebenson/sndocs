/*! RESOURCE: /scripts/select2_translations.js */
(function($) {
  if (!$ || !window.GwtMessage) {
    return;
  }

  function getMessage() {
    var gwt = new GwtMessage();
    return gwt.getMessage.apply(gwt, arguments);
  }
  $.extend($.fn.select2.defaults, {
    formatMatches: function(matches) {
      return getMessage("{0} result(s) available, use up and down arrow keys to navigate and enter to select", matches);
    },
    formatNoMatches: function() {
      return getMessage("No matches found");
    },
    formatAjaxError: function(jqXHR, textStatus, errorThrown) {
      return getMessage("Loading failed");
    },
    formatInputTooShort: function(input, min) {
      var n = min - input.length;
      return getMessage("Please enter {0} or more character(s)", n);
    },
    formatInputTooLong: function(input, max) {
      var n = input.length - max;
      return getMessage("Please delete {0} character(s)", n);
    },
    formatSelectionTooBig: function(limit) {
      return getMessage("You can only select {0} item(s)", limit);
    },
    formatLoadMore: function(pageNumber) {
      return getMessage("Loading more results…");
    },
    formatSearching: function() {
      return getMessage("Searching…");
    }
  });
})(jQuery);;