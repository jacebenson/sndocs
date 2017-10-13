/*! RESOURCE: /scripts/app.$sp/directive.spCatItem.js */
angular.module("sn.$sp").directive('spCatItem', function($http, spUtil, $rootScope) {
  return {
    restrict: 'E',
    link: function(scope, element, attrs) {
      scope.item = scope.$eval(attrs.item);
    },
    controller: function($scope) {
      var c = this;
      c.priceHasChanged = function(p, parms) {
        var changed = false;
        var t = parms.recurring_price + p.recurring_price;
        if (t != p.recurring_total) {
          changed = true;
          p.recurring_total = t;
        }
        t = parms.price + p.price;
        if (t != p.price_total) {
          changed = true;
          p.price_total = parms.price + p.price;
        }
        return changed;
      };
      c.formatPrice = function(response) {
        var p = $scope.item._pricing;
        var t = $scope.data.sc_cat_item;
        t = $scope.item;
        t.price = t.recurring_price = "";
        if (p.price_total) {
          t.price = response.price;
        }
        if (p.recurring_total) {
          t.recurring_price = response.recurring_price + " " + p.rfd;
        }
      };
      $scope.$on('variable.price.change', function(evt, parms) {
        var p = $scope.item._pricing;
        if (c.priceHasChanged(p, parms)) {
          var o = {
            price: p.price_total,
            recurring_price: p.recurring_total
          };
          $rootScope.$broadcast("guide.item.price.change", o);
          $http.post(spUtil.getURL('format_prices'), o).success(c.formatPrice)
        }
      });
    }
  }
});;