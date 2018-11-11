/*! RESOURCE: /scripts/directive.snKBSidebarPane.js */
angular.module('sn.knowledge_block_sidebar', ['sn.ngKnowledgeBlockInfo']);
angular.module('sn.knowledge_block_sidebar').directive('snKbSidebarPane', ['$timeout', 'getTemplateUrl', 'paneManager', '$window', function($timeout, getTemplateUrl, paneManager, $window) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    templateUrl: getTemplateUrl('sn_kb_sidebar_pane.xml'),
    scope: {
      paneCollapsed: '=',
      panePosition: '@',
      paneResizeable: '@',
      paneWidth: '=',
      paneToggle: '@'
    },
    link: function(scope) {
      scope.togglePane = function() {
        paneManager.togglePane("kb_sidebar_pane", true);
      };
      scope.createNewBlock = function() {
        $window.open("/kb_knowledge_block.do?sys_id=-1&sysparm_stack=kb_knowledge_block_list.do", '_blank');
      };
    }
  };
}]);
angular.module('sn.knowledge_block_sidebar').directive('snKbSidebarContent', ['getTemplateUrl', 'paneManager', function(getTemplateUrl, paneManager) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('sn_kb_sidebar_content.xml'),
    replace: true,
    scope: {
      collapsed: '=',
      url: '='
    },
    link: function(scope) {
      scope.closePane = function() {
        paneManager.togglePane("kb_sidebar_pane", true);
      };
    }
  };
}]);;