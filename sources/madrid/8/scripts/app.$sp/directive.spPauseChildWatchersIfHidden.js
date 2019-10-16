/*! RESOURCE: /scripts/app.$sp/directive.spPauseChildWatchersIfHidden.js */
angular.module("sn.$sp").directive('spPauseChildWatchersIfHidden', function() {
      return {
        link: function(scope, element, attrs) {
            var count = 0;
            scope.$watch(function() {
              return !element.is(':visible');
            }, function(newVal) {
              if (newVal) {
                toggleChildrenWatchers(element, true);
              } else {
                toggleChildrenWatchers(element, false);
              }
            });

            function toggleChildrenWatchers(element, pause) {
              $.each(element.children(), function(j, childElement) {
                toggleAllWatchers(angular.element(childElement), pause);
              });
            }

            function toggleAllWatchers(element, pause) {
              var data = element.data();
              if (data.hasOwnProperty('$scope') && data.$scope.hasOwnProperty('$$watchers') && data.$scope.$$watchers) {
                if (pause) {
                  data._bk_$$watchers = [];
                  $.each(dat