/*! RESOURCE: /scripts/heisenberg/angular/js_includes_angular.js */
/*! RESOURCE: /scripts/heisenberg/angular/_module.heisenberg.js */
(function() {
  "use strict";
  angular.module('heisenberg', []);
})();;
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
/*! RESOURCE: /scripts/heisenberg/angular/directive.snTooltipBasic.js */
(function($) {
  "use strict";
  if ('ontouchstart' in document.documentElement)
    return;
  angular.module('heisenberg').directive('snTooltipBasic', function() {
    return {
      restrict: 'C',
      link: function(scope, elem) {
        if (isMobile())
          return;
        var $elem = $(elem);
        if ($elem.data('bs.tooltip'))
          return;
        var bsTooltip = $.fn.tooltip.Constructor;
        var delayShow = bsTooltip.DEFAULTS.delay.show || 500;
        $elem.one('mouseenter', function() {
          if ($elem.data('bs.tooltip'))
            return;
          $elem.tooltip({
            container: $elem.attr('data-container') || 'body'
          });
          $elem.hideFix();
          $elem.data('hover', setTimeout(function() {
            $elem.tooltip('show');
          }, delayShow));
        });
        $elem.one('mouseleave', function() {
          var hover = $elem.data('hover');
          if (hover) {
            clearTimeout($elem.data('hover'));
            $elem.removeData('hover')
          }
        });
        $elem.click(function() {
          hideToolTip();
        });
        scope.$on('$destroy', function() {
          destroyToolTip();
        });

        function destroyToolTip() {
          if ($elem.tooltip) {
            $elem.tooltip('destroy');
          }
        }

        function hideToolTip() {
          if ($elem.tooltip) {
            $elem.tooltip('hide');
          }
        }

        function isMobile() {
          if (navigator.userAgent.match(/Android/i) ||
            navigator.userAgent.match(/webOS/i) ||
            navigator.userAgent.match(/iPhone/i) ||
            navigator.userAgent.match(/iPad/i) ||
            navigator.userAgent.match(/iPod/i) ||
            navigator.userAgent.match(/BlackBerry/i) ||
            navigator.userAgent.match(/Windows Phone/i)) {
            return true;
          } else {
            return false;
          }
        }
      }
    };
  });
})(jQuery);;
/*! RESOURCE: /scripts/heisenberg/angular/directive.snTabsBasic.js */
(function($) {
  angular.module('heisenberg').directive('snTabsBasic', function() {
    return {
      restrict: 'C',
      link: function link(scope, elem) {
        elem.each(function() {
          var $this = $(this);
          if (!$this.data('sn.tabs'))
            $this.tabs();
        });
      }
    }
  });
})(jQuery);;;