/*! RESOURCE: /scripts/sn/common/clientScript/angular/glideFormFactory.js */
angular.module('sn.common.clientScript').factory('glideFormFactory', function($window, glideRecordFactory, glideRequest, glideFormMessageHandler) {
  'use strict';
  var factory = $window.glideFormFactory;
  factory.glideRequest = glideRequest;
  var EVENT_CHANGED = 'changed';
  var EVENT_PROPERTY_CHANGE = 'propertyChange';

  function createAngularGlideForm($scope, tableName, sysId, fields, uiActions, options, relatedLists, sections) {
    options = angular.extend({
      GlideRecord: glideRecordFactory.getClass(),
      uiMessageHandler: glideFormMessageHandler
    }, options);
    var g_form = factory.create(tableName, sysId, fields, uiActions, options, relatedLists, sections);
    g_form.$private.events.on(EVENT_CHANGED, function() {
      if (!$scope.$root.$$phase) {
        $scope.$apply();
      }
    });
    g_form.$private.events.on(EVENT_PROPERTY_CHANGE, function() {
      if (!$scope.$root.$$phase) {
        $scope.$applyAsync();
      }
    });
    $scope.$on('$destroy', function() {
      g_form.$private.events.cleanup();
    });
    return g_form;
  }
  return {
    create: createAngularGlideForm
  }
});;