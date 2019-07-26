/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snConversationSearch.js */
angular.module('sn.connect.conversation').directive('snConversationSearch', function(getTemplateUrl, $timeout) {
  "use strict";
  return {
    restrict: 'E',
    scope: {
      title: "@",
      table: "=",
      name: "=",
      icon: "@",
      qualifier: "=?",
      searchField: "=?",
      onSelect: "&"
    },
    templateUrl: getTemplateUrl('snConversationSearch.xml'),
    replace: true,
    link: function(scope, element) {
      scope.search = function(evt) {
        $timeout(function() {
          element.find(".select2-choice").triggerHandler("mousedown");
          evt.preventDefault();
        }, 0, false);
        return false;
      }
    },
    controller: function($scope) {
      $scope.descriptor = {
        reference: $scope.table,
        attributes: '',
        name: $scope.name,
        searchField: $scope.searchField,
        qualifier: $scope.qualifier
      };
      $scope.valueSelected = function() {
        $scope.onSelect({
          value: "live_profile." + $scope.field.value
        })
      };
      $scope.field = {};
    }
  }
});;