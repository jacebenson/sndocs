/*! RESOURCE: /scripts/doctype/FormAdditionalOptionsMenu.js */
$j(function() {
  "use strict";
  var $moreOptions = $j('#toggleMoreOptions').popover({
    html: true,
    placement: 'bottom'
  }).on('show.bs.popover', function() {
    $j(this).data('bs.popover').$tip.find('.popover-title').hide();
  }).on('shown.bs.popover', function() {
    var windowHeight = $j(window).height() - 148;
    var popoverMaxHeight = windowHeight > 300 ? windowHeight : 300;
    $j('#moreOptionsContainer').css({
      'max-height': popoverMaxHeight + 'px'
    });
    this.setAttribute("aria-expanded", "true");
    if ($j('#moreOptionsContainer').find("button").length > 0)
      $j('#moreOptionsContainer').find("button")[0].focus();
  }).on('hide.bs.popover', function() {
    this.setAttribute("aria-expanded", "false");
  });
});;