/*! RESOURCE: /scripts/accessibility_tabindex.js */
addLoadEvent(function() {
  $(document).on('keydown', '*[tabindex]:not(.multiLinePill), .glide_ref_item_link', function(event) {
    if (event.keyCode != Event.KEY_RETURN)
      return;
    var element = event.element();
    if (!element.hasAttribute('tabindex'))
      return;
    if (element.click) {
      element.click();
      var $parent = $j(element).parent();
      if ($parent.hasClass('open')) {
        var $items = $parent.find('.dropdown-menu li:visible a');
        if ($items.length)
          $items.eq(0).trigger('focus');
      }
    }
    event.stop();
  });
  if (typeof jQuery != 'undefined') {
    var KEY_SPACE = 32;
    var KEY_ENTER = 13;
    jQuery('[click-on-enter],[click-on-space]').on('keydown', function(event) {
      var keyCode = event.keyCode || event.which;
      var $this = jQuery(this);
      if (!((keyCode === KEY_ENTER && $this.is('[click-on-enter]')) || (keyCode === KEY_SPACE && $this.is('[click-on-space]'))))
        return;
      setTimeout(function() {
        $this.trigger('click');
      }, 200);
      if (keyCode === KEY_SPACE) {
        event.stopPropagation();
        event.preventDefault();
      }
    });
  }
});;