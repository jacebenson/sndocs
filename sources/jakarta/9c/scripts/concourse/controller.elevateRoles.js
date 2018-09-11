/*! RESOURCE: /scripts/concourse/controller.elevateRoles.js */
angular.module('sn.concourse').controller('elevateRoles', ['$http', '$scope', '$rootScope', '$window', 'snCustomEvent', function($http, $scope, $rootScope, $window, snCustomEvent) {
  "use strict";
  $scope.selected = [];
  $scope.activeRoles = [];
  $scope.activeElevatedRoles = [];
  $scope.sessionExpired = false;
  $http.get('/api/now/ui/impersonate/role').then(function(response) {
    if (response && response.data && response.data.result && response.data.result.roles && response.data.result.activeRoles) {
      $scope.roles = response.data.result.roles;
      $scope.activeRoles = response.data.result.activeRoles;
      setSelected(response.data.result.roles, response.data.result.activeRoles);
    }
  });
  snCustomEvent.on('glide:ui_notification.security', function(notification) {
    expireElevatedRoles(notification);
  });
  $scope.$on('dialog.elevateRoles.closed', function() {
    $scope.sessionExpired = false;
  });

  function expireElevatedRoles(notification) {
    if ($scope.activeElevatedRoles && $scope.activeElevatedRoles.length) {
      $scope.sessionExpired = true;
      $rootScope.$broadcast('dialog.elevateRoles.show');
    }
  }

  function setSelected(roles, activeRoles) {
    $scope.activeElevatedRoles = [];
    $scope.selected = [];
    for (var i = 0; i < roles.length; i++) {
      for (var j = 0; j < activeRoles.length; j++) {
        if (roles[i].name === activeRoles[j]) {
          $scope.selected.push(activeRoles[j]);
          $scope.activeElevatedRoles.push(roles[i]);
        }
      }
    }
    snCustomEvent.fireAll('user.elevatedRoles.updated', $scope.activeElevatedRoles);
  }
  $scope.toggleRole = function(role) {
    if ($scope.selected.indexOf(role.name) != -1) {
      $scope.selected.splice($scope.selected.indexOf(role.name), 1);
    } else {
      $scope.selected.push(role.name);
    }
  };
  $scope.isSelected = function(role) {
    return $scope.selected.indexOf(role.name) != -1;
  };
  snCustomEvent.observe('sn:elevate_roles', function(roles) {
    if (!angular.isArray(roles))
      roles = [roles];
    $scope.selected = roles;
    $scope.updateElevatedRoles();
  });
  $scope.updateElevatedRoles = function() {
    $http.post('/api/now/ui/impersonate/role', {
      roles: $scope.selected.join(',')
    }).then(function(response) {
      if (response && response.data && response.data.result) {
        var frame = jQuery('#gsft_main');
        if (frame.length) {
          frame[0].contentWindow.location.reload();
        }
        snCustomEvent.fireAll('navigator.refresh');
        $rootScope.$broadcast('dialog.elevateRoles.close');
        if (response.data.result.activeRoles) {
          setSelected($scope.roles, response.data.result.activeRoles)
        }
      }
    });
  };
}]);;