/*! RESOURCE: /scripts/app.$sp/provider.spNotificationEvents.js */
angular.module('sn.$sp').provider('spNotificationEvents', function() {
  'use strict';
  var _$rootScope;

  function clearMessages() {
    if (!_$rootScope) {
      return;
    }
    _$rootScope.$broadcast("$$uiNotification.dismiss");
  }

  function addMessages(messages) {
    if (!_$rootScope) {
      return;
    }
    _$rootScope.$broadcast("$$uiNotification", messages);
  }
  this.clearMessages = clearMessages;
  this.addMessages = addMessages;
  this.$get = function($rootScope) {
    _$rootScope = $rootScope;
    return {
      clearMessages: clearMessages,
      addMessages: addMessages
    };
  }
});;