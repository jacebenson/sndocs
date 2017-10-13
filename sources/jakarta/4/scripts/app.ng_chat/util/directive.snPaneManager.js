/*! RESOURCE: /scripts/app.ng_chat/util/directive.snPaneManager.js */
angular.module('sn.connect.util').directive('snPaneManager', function() {
  'use strict';
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      scope.resourcePaneClass = attrs.snPaneManager;
      scope.resourcePaneClasses = {
        'closed': 'pane-closed',
        'large': 'pane-large large-resource-pane',
        'compact': 'pane-compact compact-resource-pane'
      };
      scope.$on('conversation.resource.open', function($evt, data) {
        scope.$broadcast('conversation.resource.show', data);
        scope.resizePane(data.type);
      });
      scope.$on('conversation.resource.close', function() {
        scope.resizePane('closed');
      });
      scope.resizePane = function(type) {
        angular.forEach(scope.resourcePaneClasses, function(resourcePaneClass) {
          element.removeClass(resourcePaneClass);
        });
        scope.resourcePaneClass = scope.resourcePaneClasses[type || 'closed'];
        element.addClass(scope.resourcePaneClass);
      };
      scope.resizePane(attrs.snPaneManager);
    }
  }
});