/*! RESOURCE: /scripts/heisenberg/custom/modals.js */
jQuery(function($) {
  "use strict";
  var bsModal = $.fn.modal.Constructor;
  var bsModalShow = bsModal.prototype.show;
  var bsModalHide = bsModal.prototype.hide;
  var modalCount = 0;

  function isMobileSafari() {
    return navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i);
  }

  function forceRedraw(element) {
    return element.offsetLeft;
  }
  bsModal.prototype.show = function() {
    bsModalShow.apply(this, arguments);
    modalCount++;
    var $backdrop = $('body').find('.modal-backdrop').not('.stacked');
    var zmodal = this.$element.css('z-index');
    var zbackdrop = $backdrop.css('z-index');
    this.$element.css('z-index', (~~zmodal) + (10 * modalCount));
    $backdrop.css('z-index', (~~zbackdrop) + (10 * modalCount));
    $backdrop.addClass('stacked');
    if (isMobileSafari()) {
      $backdrop.css('display', 'none');
    }
    forceRedraw(this.$element[0]);
  };
  bsModal.prototype.hide = function() {
    bsModalHide.apply(this, arguments);
    modalCount--;
    this.$element.css('z-index', '');
    forceRedraw(this.$element[0]);
  };
  $(document).on('shown.bs.modal hidden.bs.modal', function() {
    if (window._frameChanged)
      _frameChanged();
  })
});;