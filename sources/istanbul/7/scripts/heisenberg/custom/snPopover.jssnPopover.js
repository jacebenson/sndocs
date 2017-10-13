/*! RESOURCE: /scripts/heisenberg/custom/snPopover.js */
(function($) {
  "use strict";
  var Popover = $.fn.popover.Constructor;
  var popoverCount = 0;
  var bsPopoverInit = Popover.prototype.init;
  var bsPopoverShow = Popover.prototype.show;
  var bsPopoverHide = Popover.prototype.hide;
  var bsPopoverFixTitle = Popover.prototype.fixTitle;
  Popover.prototype.init = function(type, element, options) {
    var $e = $(element);
    var $target = $($e.data('target'));
    var popoverId = popoverCount++;
    var wide = !!$e.data('wide');
    $e.hideFix();
    this.$target = $target;
    this.$target.hide();
    this.popoverId = popoverId;
    options = $.extend({}, {
      html: true,
      content: function() {
        if (wide)
          this.tip().addClass('wide');
        var placeholderId = 'popover-placeholder-' + popoverId;
        if (!document.getElementById(placeholderId))
          $target.before('<div id="' + placeholderId + '" class="popover-placeholder" />');
        $target.show();
        return $target;
      }.bind(this)
    }, options);
    bsPopoverInit.call(this, type, element, options);
  };
  Popover.prototype.fixTitle = function() {
    var trigger = this.options.trigger;
    if (typeof trigger === "undefined" || trigger === "" || /hover/.test(trigger))
      bsPopoverFixTitle.apply(this, arguments);
  };
  Popover.prototype.show = function() {
    var $e = this.$element;
    bsPopoverShow.apply(this, arguments);
    $e.addClass('active');
    this.tip().one('click', '[data-dismiss=popover]', function() {
      $e.popover('hide');
      $e[0].focus();
    });
  };
  Popover.prototype.hide = function() {
    var $e = this.$element;
    var $target = this.$target;
    var $popover = $target.closest('.popover');
    var popoverId = this.popoverId;

    function saveOffContent() {
      $e.removeClass('active');
      var $placeholder = $('#popover-placeholder-' + popoverId);
      if (!$placeholder.length || !$target.length)
        return;
      var $innerContent = $target.detach();
      if ($innerContent.length === 0)
        return;
      $innerContent.hide();
      $placeholder.replaceWith($innerContent);
    }
    if ($.support.transition && $popover.hasClass('fade'))
      $popover.one('bsTransitionEnd', saveOffContent);
    else
      saveOffContent();
    bsPopoverHide.apply(this, arguments);
  };
})(jQuery);;