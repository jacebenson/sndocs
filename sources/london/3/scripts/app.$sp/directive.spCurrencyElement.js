/*! RESOURCE: /scripts/app.$sp/directive.spCurrencyElement.js */
angular.module('sn.$sp').directive('spCurrencyElement', function() {
  return {
    templateUrl: 'sp_element_currency.xml',
    restrict: 'E',
    replace: true,
    scope: {
      field: '=',
      snBlur: '&',
      snChange: '&',
      'getGlideForm': '&glideForm'
    },
    controller: function($scope) {
      var g_form = $scope.getGlideForm();
      var field = $scope.field;
      $scope.field.currencyValue = formatNumber(field.currencyValue);
      g_form.$private.events.on("change", function(fieldName, oldValue, newValue) {
        if (fieldName == field.name) {
          if (newValue.indexOf(";") > 0) {
            var v = newValue.split(";");
            field.currencyCode = v[0];
            field.currencyValue = formatNumber(v[1]);
          } else
            field.currencyValue = formatNumber(newValue);
        }
      });
      $scope.formatValue = function(shouldSetValue) {
        var v = field.currencyValue;
        if (field.currencyValue != "")
          v = field.currencyCode + ";" + field.currencyValue;
        field.stagedValue = v;
        $scope.snChange();
        if (shouldSetValue)
          $scope.snBlur();
      }
    }
  }
});