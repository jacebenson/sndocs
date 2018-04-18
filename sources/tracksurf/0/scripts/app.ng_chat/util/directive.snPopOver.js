/*! RESOURCE: /scripts/app.ng_chat/util/directive.snPopOver.js */
angular.module('sn.connect.util').directive('snPopover', function($window, $rootScope) {
  'use strict';
  if ($window.jQuery)
    $window.jQuery('html').on('click', function(e) {
      $rootScope.$broadcast("popover-html-click", e);
    });
  return {
    restrict: 'A',
    scope: {
      options: '=snPopover',
      enabled: '=snPopoverEnabled'
    },
    link: function(scope, element) {
      scope.popoverID = scope.$id;

      function getContent() {
        if (!$content) {
          if (angular.isObject(scope.options) && scope.options.target) {
            $content = angular.element(scope.options.target).detach().show();
          } else if (typeof scope.options == "string") {
            $content = angular.element(scope.options).detach().show();
          } else {
            $content = element.siblings('.popover-body').eq(0).detach().show();
          }
        }
        return $content;
      }
      var $content = getContent();
      if (!angular.element('html').hasClass('touch')) {
        if (scope.options && scope.options.popoverID)
          scope.popoverID = scope.options.popoverID;
        var options = {
          placement: 'left',
          html: true,
          content: getContent,
          container: 'body',
          template: '<div scope-id="' + scope.popoverID + '" class="popover" role="tooltip" onClick="event.stopPropagation();"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
          trigger: 'hover',
          hideOnBlur: true,
          onShow: function() {},
          onHide: function() {}
        };
        angular.extend(options, scope.options);
        var oldHide = element[0].hide;
        if (oldHide) {
          element[0].prototypeHide = oldHide;
          element[0].hide = function() {
            if (!jQuery.event.triggered && this.prototypeHide) {
              this.prototypeHide();
            }
          }
        }
        if (!element.popover)
          return;
        scope.$popover = element.popover(options);
        scope.$popover.on("hidden.bs.popover", function(e) {
          options.onHide(e);
        });
        scope.$popover.on("shown.bs.popover", function(e) {
          options.onShow(e);
        });
        scope.$watch('enabled', function() {
          element.popover(scope.enabled || scope.enabled == undefined ? 'enable' : 'disable');
        });
        scope.$on('$destroy', function() {
          angular.element('[scope-id=' + scope.popoverID + ']').remove();
        });
        scope.$on('popover-html-click', function($evt, e) {
          if (element.find(e.target).length > 0 || options.hideOnBlur === false)
            return;
          element.popover('hide');
        });
      }
    }
  }
});;