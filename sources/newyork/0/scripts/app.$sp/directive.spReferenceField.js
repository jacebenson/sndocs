/*! RESOURCE: /scripts/app.$sp/directive.spReferenceField.js */
angular.module('sn.$sp').directive('spReferenceField', function($rootScope, spUtil, $uibModal, $http, spAriaUtil, i18n) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'sp_reference_field.xml',
    controller: function($scope) {
      var unregister;
      $scope.openReference = function(field, view) {
        var data = {
          table: field.refTable,
          sys_id: field.value,
          view: view
        };
        if (angular.isDefined(field.reference_key))
          data[field.reference_key] = field.value;
        else
          data.sys_id = field.value;
        if (unregister)
          unregister();
        unregister = $rootScope.$on('$sp.openReference', function(evt, data) {
          unregister();
          unregister = null;
          if (!evt.defaultPrevented && evt.targetScope === $scope)
            showForm(data);
        });
        $scope.$emit('$sp.openReference', data);
      };
      $scope.$on("$destroy", function() {
        if (unregister)
          unregister();
      });

      function showForm(data) {
        var url = spUtil.getWidgetURL("widget-form");
        var req = {
          method: 'POST',
          url: url,
          headers: spUtil.getHeaders(),
          data: data
        }
        $http(req).then(qs, qe);

        function qs(response) {
          var r = response.data.result;
          showModal(r);
        }

        function qe(error) {
          console.error("Error " + error.status + " " + error.statusText);
        }
      }

      function showModal(form) {
        var opts = {
          size: 'lg',
          templateUrl: 'sp_form_modal',
          controller: ModalInstanceCtrl,
          resolve: {}
        };
        opts.resolve.item = function() {
          return angular.copy({
            form: form
          });
        };
        var modalInstance = $uibModal.open(opts);
        modalInstance.result.then(function() {}, function() {
          spAriaUtil.sendLiveMessage($scope.exitMsg);
        });
        $scope.$on("$destroy", function() {
          modalInstance.close();
        });
        var unregister = $scope.$on('sp.form.record.updated', function(evt, fields) {
          unregister();
          unregister = null;
          modalInstance.close();
          if (evt.stopPropagation)
            evt.stopPropagation();
          evt.preventDefault();
        });
      }

      function ModalInstanceCtrl($scope, $uibModalInstance, item) {
        $scope.item = item;
        $scope.closeWindowMsg = i18n.getMessage('Close Window');
        $scope.ok = function() {
          $uibModalInstance.close();
        };
        $scope.cancel = function() {
          $uibModalInstance.dismiss('cancel');
        };
      }
    },
    link: function(scope, element) {
      setTimeout(function() {
        element.find('input').removeAttr('id');
      }, 500);
      i18n.getMessage("Closing modal page", function(msg) {
        scope.exitMsg = msg;
      });
    }
  }
});;