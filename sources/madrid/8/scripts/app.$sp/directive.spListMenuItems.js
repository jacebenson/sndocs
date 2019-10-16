/*! RESOURCE: /scripts/app.$sp/directive.spListMenuItems.js */
angular.module('sn.$sp').directive('spListMenuItems', function(i18n) {
      function link(scope, elem, attr) {
        scope.focus = function() {
          $(elem).find("button")[0].focus();
        }
      }
      return {
        restrict: 'E',
        replace: true,
        scope: {
          onclickFn: '&',
          menu: '='
        },
        link: link,
        templateUrl: function(elem, attr) {
          return (attr.type === "MULTI_SELECT") ?
            "sp_list_menu_checkbox.xml" :
            "sp_list_menu_item.xml"
        },
        controllerAs: 'c',
        controller: function($scope) {
            var c = this;
            c.showNextItems = false;
            c.i18n = {
              see_more: i18n.getMessage('See more'),
              see_less: i18n.getMessage('See less')
            };
            getItems();

            function getItems() {
              var items = $scope.menu.items;
              for (var i = 0; i < items.length; i++) {
                if (items[i].label.indexOf('>') > -1) {
                  var completeLabel = i