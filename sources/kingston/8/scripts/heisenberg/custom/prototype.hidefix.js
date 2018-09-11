/*! RESOURCE: /scripts/heisenberg/custom/prototype.hidefix.js */
(function($) {
  "use strict";
  $.fn.hideFix = function() {
    return this.each(function() {
      if (!window.Prototype)
        return this;
      this.hide = function() {
        if (!jQuery.event.triggered)
          Element.hide(this);
      }
      this.show = function() {
        if (!jQuery.event.triggered)
          Element.show(this);
      }
      return this;
    })
  }
})(jQuery);;