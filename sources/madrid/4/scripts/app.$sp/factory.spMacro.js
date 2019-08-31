/*! RESOURCE: /scripts/app.$sp/factory.spMacro.js */
angular.module('sn.$sp').factory("spMacro", function($log) {
  "use strict";
  return function($scope, dataPrototype, inputMap, keepFields) {
    var gf = $scope.page.g_form;
    if (!gf) {
      $log.warn('GlideForm not set for widget: ' + $scope.widget.name);
      return;
    }
    var map = createMap();

    function createMap() {
      var names = gf.getFieldNames();
      var fields = [];
      names.forEach(function(name) {
        fields.push(gf.getField(name));
      })
      var map = {};
      angular.forEach(inputMap, function(value, key) {
        fields.forEach(function(field) {
          if (field.variable_name == value) {
            map[key] = field.name;
            if (!keepFields)
              gf.setDisplay(field.name, false);
          }
        })
      })
      angular.forEach(dataPrototype, function(value, key) {
        if (map[key])
          return;
        fields.forEach(function(field) {
          if (field.variable_name == key) {
            map[key] = field.name;
            if (!keepFields)
              gf.setDisplay(field.name, false);
          }
        })
      })
      return map;
    }
    return {
      getMap: function() {
        return map;
      },
      onChange: function(newV, oldV) {
        if (!angular.isDefined(newV))
          return;
        angular.forEach(newV, function(value, key) {
          if (newV[key] == oldV[key])
            return;
          var n = map[key];
          gf.setValue(n, newV[key]);
        })
      }
    }
  }
});