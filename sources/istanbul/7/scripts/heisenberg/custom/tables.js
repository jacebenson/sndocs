/*! RESOURCE: /scripts/heisenberg/custom/tables.js */
(function($) {
  "use strict";
  $.fn.tableDetailRowHover = function() {
    this.each(function() {
      $(this)
        .on('mouseenter mouseleave', 'tr', function(evt) {
          var row = getTargetAdjRow($(this));
          evt.type == 'mouseenter' ?
            row.addClass('hover') : row.removeClass('hover');
        });
    })
  }

  function getTargetAdjRow(row) {
    return row.hasClass('detail-row') ? row.prev() : row.next();
  }
})(jQuery);
jQuery(function($) {
  "use strict";
  $('.detail-row:nth-child(2)').closest('table.table').addClass('table-detail-row');
  $('.table-hover.table-detail-row').tableDetailRowHover();
});;