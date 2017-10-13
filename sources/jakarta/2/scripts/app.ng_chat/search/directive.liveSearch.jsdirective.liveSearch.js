/*! RESOURCE: /scripts/app.ng_chat/search/directive.liveSearch.js */
angular.module('sn.connect').directive('liveSearch', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('liveSearch.xml'),
    replace: true,
    scope: {
      type: '@',
      limit: '@',
      placeholder: '@',
      expandDirection: '@',
      onSelect: '&'
    },
    link: function(scope) {
      scope.forwardOnSelect = function(id) {
        scope.onSelect({
          id: id
        });
      };
    }
  }
});;