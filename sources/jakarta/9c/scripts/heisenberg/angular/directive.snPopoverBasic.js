/*! RESOURCE: /scripts/heisenberg/angular/directive.snPopoverBasic.js */
(function($) {
  angular.module('heisenberg').directive('snPopoverBasic', function() {
    "use strict";
    return {
      restrict: 'C',
      link: function(scope, elem) {
        elem.each(function() {
          var $this = $(this);
          if (!$this.data('bs.popover'))
            $this.popover();
        });
      }
    }
  });
})(jQuery);;