/*! RESOURCE: /scripts/concourse/controller.unImpersonate.js */
angular.module('sn.concourse').controller('unImpersonate', function($scope, $http) {
  "use strict";
  $scope.unImpersonate = function() {
    $http.post('sys_unimpersonate.do', {}).then(function() {
      window.location = "/";
    });
  };
});;