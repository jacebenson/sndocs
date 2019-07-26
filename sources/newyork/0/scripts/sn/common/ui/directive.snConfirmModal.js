/*! RESOURCE: /scripts/sn/common/ui/directive.snConfirmModal.js */
angular.module('sn.common.ui').directive('snConfirmModal', function(getTemplateUrl) {
  return {
    templateUrl: getTemplateUrl('sn_confirm_modal.xml'),
    restrict: 'E',
    replace: true,
    transclude: true,
    scope: {
      config: '=?',
      modalName: '@',
      title: '@?',
      message: '@?',
      cancelButton: '@?',
      okButton: '@?',
      alertButton: '@?',
      cancel: '&?',
      ok: '&?',
      alert: '&?'
    },
    link: function(scope, element) {
      element.find('.modal').remove();
    },
    controller: function($scope, $rootScope) {
      $scope.config = $scope.config || {};

      function Button(fn, text) {
        return {
          fn: fn,
          text: text
        }
      }
      var buttons = {
        'cancelButton': new Button('cancel', 'Cancel'),
        'okButton': new Button('ok', 'OK'),
        'alertButton': new Button('alert', 'Close'),
        getText: function(type) {
          var button = this[type];
          if (button && $scope.get(button.fn))
            return button.text;
        }
      };
      $scope.get = function(type) {
        if ($scope.config[type])
          return $scope.config[type];
        if (!$scope[type]) {
          var text = buttons.getText(type);
          if (text)
            return $scope.config[type] = text;
        }
        return $scope.config[type] = $scope[type];
      };
      if (!$scope.get('modalName'))
        $scope.config.modalName = 'confirm-modal';

      function call(type) {
        var action = $scope.get(type);
        if (action) {
          if (angular.isFunction(action))
            action();
          return true;
        }
        return !!buttons.getText(type);
      }
      $scope.cancelPressed = close('cancel');
      $scope.okPressed = close('ok');
      $scope.alertPressed = close('alert');

      function close(type) {
        return function() {
          actionClosed = true;
          $rootScope.$broadcast('dialog.' + $scope.config.modalName + '.close');
          call(type);
        }
      }
      var actionClosed;
      $scope.$on('dialog.' + $scope.get('modalName') + '.opened', function() {
        actionClosed = false;
        $scope.isOpen = true;
      });
      $scope.$on('dialog.' + $scope.get('modalName') + '.closed', function() {
        $scope.isOpen = false;
        if (actionClosed)
          return;
        if (call('cancel'))
          return;
        if (call('alert'))
          return;
        call('ok');
      });
    }
  };
});;