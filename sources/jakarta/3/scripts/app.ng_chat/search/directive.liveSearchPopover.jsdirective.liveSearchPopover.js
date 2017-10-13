/*! RESOURCE: /scripts/app.ng_chat/search/directive.liveSearchPopover.js */
angular.module('sn.connect').directive('liveSearchPopover', function($timeout, $document, getTemplateUrl) {
  'use strict';
  var VK_ESC = 27;
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('liveSearchPopover.xml'),
    replace: true,
    scope: {
      type: '@',
      limit: '@',
      buttonId: '@',
      placeholder: '@',
      expandDirection: '@',
      onSelect: '&'
    },
    link: function(scope, element) {
      element.detach();
      var popoverButton;
      var getPopoverButton = function() {
        if (!popoverButton) {
          popoverButton = $document.find("#" + scope.buttonId);
          var toggleIgnore = function(event) {
            popoverButton.ignoreBlurHide = (event.type === 'mousedown');
          };
          popoverButton.mousedown(toggleIgnore);
          popoverButton.mouseup(toggleIgnore);
        }
        return popoverButton;
      };
      scope.onSelectHidePopover = function(id) {
        scope.onSelect({
          id: id
        });
        getPopoverButton().popover('hide');
      };
      scope.$on('live.search.control.ready', function(event, popoverInput) {
        popoverInput.data('ttTypeahead').input.off('blurred');
        var hidePopover = function() {
          var popoverButton = getPopoverButton();
          if (popoverButton.ignoreBlurHide) {
            return;
          }
          popoverButton.popover('hide');
        };
        popoverInput.on('blur', hidePopover);
        popoverInput.keyup(function(event) {
          var code = event.keyCode || event.which;
          if (code !== VK_ESC) {
            return;
          }
          hidePopover();
        });
        getPopoverButton().on('shown.bs.popover', function() {
          popoverInput.focus();
        });
        getPopoverButton().on('hidden.bs.popover', function() {
          popoverInput.typeahead('val', '');
        });
      });
      $timeout(function() {
        getPopoverButton().popover({
          container: 'body',
          placement: scope.expandDirection || 'right',
          html: true,
          content: function() {
            return angular.element('<div />').append(element);
          },
          template: '<div class="sn-live-search-popover popover" role="tooltip">' +
            '<div class="arrow"></div>' +
            '<h3 class="popover-title"></h3>' +
            '<div class="popover-content"></div>' +
            '</div>'
        });
      });
    }
  };
});;