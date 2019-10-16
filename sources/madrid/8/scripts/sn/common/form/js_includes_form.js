/*! RESOURCE: /scripts/sn/common/form/js_includes_form.js */
/*! RESOURCE: /scripts/sn/common/form/_module.js */
angular.module('sn.common.form', [
  'sn.common.clientScript',
  'sn.common.form.data'
]);;
/*! RESOURCE: /scripts/sn/common/form/directive.glideFormField.js */
angular.module('sn.common.form').directive('glideFormField', function(getTemplateUrl, cabrillo, glideFormFieldFactory, i18n, $log) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('directive_glide_form_field.xml'),
    scope: {
      field: '=',
      tableName: '=',
      getGlideForm: '&glideForm'
    },
    controller: function($element, $scope) {
      var g_form;
      $scope.requiredMsg = i18n.getMessage('Required');
      if (!$scope.getGlideForm) {
        $log.warn('glideFormField: Field directive is missing GlideForm');
      } else {
        g_form = $scope.getGlideForm();
      }
      var field = $scope.field;
      var glideField = glideFormFieldFactory.create(field);
      $scope.isReadonly = glideField.isReadonly;
      $scope.isMandatory = glideField.isMandatory;
      $scope.isVisible = glideField.isVisible;
      $scope.hasMessages = glideField.hasMessages;
      var isNative = cabrillo.isNative();
      $scope.showBarcodeHelper = isNative && glideField.hasBarcodeHelper();
      $scope.showCurrentLocationHelper = isNative && glideField.hasCurrentLocationHelper();
      $scope.getBarcode = function() {
        cabrillo.camera.getBarcode().then(function(value) {
          cabrillo.log('Received barcode value: ' + value);
          g_form.setValue($scope.field.name, value);
        });
      };
      $scope.getCurrentLocation = function() {
        cabrillo.geolocation.getCurrentLocation().then(function(value) {
          var composite = value.coordinate.latitude + ',' + value.coordinate.longitude;
          g_form.setValue($scope.field.name, composite);
        });
      };
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/form/directive.recursiveHelper.js */
angular.module('sn.common.form').directive('recursiveHelper', function($compile) {
      return {
        restrict: "EACM",
        priority: 100000,
        comp