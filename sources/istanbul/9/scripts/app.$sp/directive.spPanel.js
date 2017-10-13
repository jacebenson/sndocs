/*! RESOURCE: /scripts/app.$sp/directive.spPanel.js */
angular.module('sn.$sp').directive('spPanel', function() {
  return {
    restrict: 'E',
    transclude: true,
    replace: true,
    link: function($scope, $element, $attributes, controller, transcludeFn) {
      $scope.widgetParameters = $scope.widget_parameters || $scope.$parent.widget_parameters || {};
      if (!$scope.options)
        $scope.options = $scope.$eval($attributes.options) || $scope.$parent.options;
      var title;
      try {
        title = $scope.$eval($attributes.title);
      } catch (e) {
        title = $attributes.title
      }
      $scope.title = title || $scope.options.title;
      $scope.bodyClass = $scope.$eval($attributes.bodyClass) || "panel-body";
      transcludeFn($scope, function(clone) {
        var container = $element.find('div.transclude');
        container.empty();
        container.append(clone);
      });
    },
    template: '<div class="panel panel-{{options.color}} b">' +
      '<div class="panel-heading"> <h4 class="panel-title">' +
      '<fa ng-if="options.glyph.length" name="{{options.glyph}}" class="m-r-sm" />{{title}}</h4>' +
      '</div>' +
      '<div class="{{bodyClass}} transclude"></div>' +
      '</div>'
  }
});;