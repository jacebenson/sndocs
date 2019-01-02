/*! RESOURCE: /scripts/directive.snHRSidebarPane.js */
angular.module('sn.response_template_sidebar', []);
angular.module('sn.response_template_sidebar').directive('snHrSidebarPane', function($timeout, getTemplateUrl, paneManager) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    templateUrl: getTemplateUrl('sn_hr_sidebar_pane.xml'),
    scope: {
      paneCollapsed: '=',
      panePosition: '@',
      paneResizeable: '@',
      paneWidth: '=',
      paneToggle: '@'
    },
    link: function(scope) {
      scope.togglePane = function() {
        paneManager.togglePane("hr_sidebar_pane", true);
      };
    }
  };
});
angular.module('sn.response_template_sidebar').directive('snHrSidebarContent', function(getTemplateUrl, paneManager) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('sn_hr_sidebar_content.xml'),
    replace: true,
    scope: {
      collapsed: '=',
      url: '='
    },
    link: function(scope) {
      scope.$on('sn:url_changed', function(e, data) {
        scope.url = data;
        scope.IframeSrcUrl = scope.url;
      });
      scope.closePane = function() {
        paneManager.togglePane("hr_sidebar_pane", true);
      };
    }
  };
});;