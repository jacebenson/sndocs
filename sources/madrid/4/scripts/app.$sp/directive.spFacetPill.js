/*! RESOURCE: /scripts/app.$sp/directive.spFacetPill.js */
angular.module('sn.$sp').directive('spFacetPill', function(spFacetManager, spAriaUtil) {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      facet: '='
    },
    template: '<div class="sp-facet-pill label label-as-badge label-primary" ng-class="{ \'active\': c.focused}"><span>{{::facet.label}}</span><span class="pull-right"><i class="fa fa-close" ng-focus="c.onFocus()" ng-blur="c.onBlur()" ng-click="c.removePill()" aria-label="{{::c.removeLabel}}" role="button" tabindex="0"></i></span></div>',
    controllerAs: 'c',
    controller: function($scope, i18n) {
      var c = this;
      c.removeLabel = i18n.getMessage('Remove') + " " + $scope.facet.label + " " + i18n.getMessage('facet filter');
      var facetRemovedMsg = i18n.getMessage('Facet removed, search results updated');
      c.removePill = function() {
        spFacetManager.clearFacetValue($scope.facet.id, $scope.facet.item.value);
        spAriaUtil.sendLiveMessage(facetRemovedMsg);
      }
      c.onFocus = function() {
        c.focused = true;
      }
      c.onBlur = function() {
        c.focused = false;
      }
    }
  }
});;