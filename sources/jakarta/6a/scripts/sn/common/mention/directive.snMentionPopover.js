/*! RESOURCE: /scripts/sn/common/mention/directive.snMentionPopover.js */
angular.module('sn.common.mention').directive("snMentionPopover", function(getTemplateUrl, $timeout) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: getTemplateUrl('snMentionPopover.xml'),
    link: function(scope, elem, $attrs) {
      elem.detach().appendTo(document.body);
      scope.dontPositionManually = scope.$eval($attrs.dontpositionmanually) || false;
      scope.onClick = function(event) {
        if (!angular.element(event.target).closest("#mention-popover").length ||
          angular.element(event.target).closest("#direct-message-popover-trigger").length) {
          scope.$evalAsync(function() {
            scope.$parent.showPopover = false;
            scope.$emit("snMentionPopover.showPopoverIsFalse");
            if (scope.dontPositionManually && !(scope.$eval($attrs.snavatarpopover))) {
              elem.remove();
            } else {
              scope.$broadcast("sn-avatar-popover-destroy");
            }
            angular.element('.popover').each(function() {
              var object = angular.element(this);
              if (object.popover) {
                object.popover('hide');
              }
            })
          });
        }
      };
      scope.clickListener = $timeout(function() {
        angular.element('html').on('click.mentionPopover', scope.onClick);
      }, 0, false);
      scope.$on('sn-bootstrap-popover.close-other-popovers', scope.onClick);

      function setPopoverPosition(clickX, clickY) {
        var topPosition;
        var leftPosition;
        var windowHeight = window.innerHeight;
        var windowWidth = window.innerWidth;
        if (((clickY - (elem.height() / 2))) < 10)
          topPosition = 10;
        else
          topPosition = ((clickY + (elem.height() / 2)) > windowHeight) ? windowHeight - elem.height() - 15 : clickY - (elem.height() / 2);
        leftPosition = ((clickX + 20 + (elem.width())) > windowWidth) ? windowWidth - elem.width() - 15 : clickX + 20;
        elem.css("top", topPosition + "px").css("left", leftPosition + "px");
      }
      if (!scope.dontPositionManually) {
        $timeout(function() {
          var clickX = (scope.$parent && scope.$parent.clickEvent && scope.$parent.clickEvent.pageX) ? scope.$parent.clickEvent.pageX : clickX || 300;
          var clickY = (scope.$parent && scope.$parent.clickEvent && scope.$parent.clickEvent.pageY) ? scope.$parent.clickEvent.pageY : clickY || 300;
          setPopoverPosition(clickX, clickY);
          elem.velocity({
            opacity: 1
          }, {
            duration: 100,
            easing: "cubic"
          });
        });
      }
    },
    controller: function($scope, $element, $attrs) {
      $scope.profile = $scope.$eval($attrs.profile);
      $scope.$on("$destroy", function() {
        angular.element('html').off('click.mentionPopover', $scope.onClick);
        $element.remove();
      });
    }
  }
});;