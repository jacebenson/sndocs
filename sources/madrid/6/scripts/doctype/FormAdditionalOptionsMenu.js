/*! RESOURCE: /scripts/doctype/FormAdditionalOptionsMenu.js */
$j(function() {
  "use strict";
  var tagsInitialized = false;
  var $moreOptions = $j('#toggleMoreOptions').popover({
    html: true,
    placement: 'bottom'
  }).on('show.bs.popover', function() {
    if (!tagsInitialized && window.NOW.FormTags) {
      tagsInitialized = true;
      window.NOW.FormTags.init();
    }
    $j(this).data('bs.popover').$tip.find('.popover-title').hide();
  }).on('shown.bs.popover', function() {
    this.setAttribute("aria-expanded", "true");
    var moreOptsContainer = $j('#moreOptionsContainer');
    if (moreOptsContainer.length) {
      var windowHeight = $j(window).height() - 148;
      var popoverMaxHeight = windowHeight > 300 ? windowHeight : 300;
      moreOptsContainer.css({
        'max-height': popoverMaxHeight + 'px'
      });
      moreOptsContainer.find("button").first().focus();
    }
  }).on('hide.bs.popover', function() {
    this.setAttribute("aria-expanded", "false");
  });
  $j(document).keyup(function(e) {
    if (e.keyCode == 27) {
      $j(".popover").hide();
      var moreOptionsButton = $j("#toggleMoreOptions");
      moreOptionsButton.removeClass("active");
      moreOptionsButton.attr("aria-expanded", "false");
    }
  });
});;