/*! RESOURCE: /scripts/concourse/directive.updateSetPicker.js */
angular.module('sn.concourse').directive('updateSetPicker', [
  'snCustomEvent',
  'getTemplateUrl',
  '$rootScope',
  'userPreferences',
  'updateSetService',
  function(snCustomEvent, getTemplateUrl, $rootScope, userPreferences, updateSetService) {
    "use strict"
    return {
      restrict: 'E',
      replace: false,
      templateUrl: getTemplateUrl('concourse_update_set_picker.xml'),
      scope: {
        current: '=',
        inHeader: '=',
        showInHeader: '='
      },
      controller: function($scope) {
        $scope.closeModal = function() {
          angular.element('#settings_modal').modal('hide');
        };
        if ($scope.current) {
          updateSetService.initialize($scope.current, $scope.showInHeader);
        }
        $scope.updateSets = updateSetService.updateSetData;
        $scope.getUpdateSetList = function() {
          return updateSetService.getUpdateSetList();
        };
        $scope.refreshUpdateSetList = $scope.getUpdateSetList;
        $scope.updateCurrent = function() {
          updateSetService.updateCurrent();
        };
        $rootScope.$on('concourse.update_set.in_header.change', function(evt, showInHeader) {
          $scope.showInHeader = showInHeader;
        });
        snCustomEvent.observe('sn:change_update_set', function(updateSetId) {
          $scope.getUpdateSetList().then(function() {
            updateSetService.updateSetData.currentId = updateSetId;
            $scope.updateCurrent();
          });
        });
      },
      link: function(scope, element) {
        element.tooltip({
          selector: '[data-toggle="tooltip"]',
          title: function() {
            var $this = angular.element(this);
            return $this.attr('title') || $this.text();
          }
        });
        element.on('mouseover', function() {
          if (!updateSetService.hasFetchedData()) {
            updateSetService.getUpdateSetList();
          }
        });
        element.on('change', 'input[type=checkbox]', function() {
          var showInHeader = angular.element(this).prop('checked');
          updateSetService.updateSetData.showInHeader = showInHeader;
          scope.showInHeader = showInHeader;
          if (showInHeader) {
            userPreferences.setPreference('glide.ui.update_set_picker.in_header', 'true');
          } else {
            userPreferences.setPreference('glide.ui.update_set_picker.in_header', '');
          }
        });
      }
    }
  }
]).factory('updateSetService', ['$http', 'snCustomEvent', '$rootScope', function($http, snCustomEvent, $rootScope) {
  var fetchedInitialData = false;
  var initialized = false;
  var updateSetData = {
    list: [],
    current: {},
    currentId: '',
    showInHeader: false
  };
  var hasFetchedData = function() {
    return fetchedInitialData;
  };
  var initialize = function(current, showInHeader) {
    if (initialized)
      return;
    initialized = true;
    updateSetData.list = [current];
    updateSetData.current = current;
    updateSetData.currentId = current.sysId;
    updateSetData.showInHeader = showInHeader;
  };
  var updateCurrent = function() {
    var updateSets = updateSetData.list;
    var curr = updateSetData.currentId;
    for (var i = 0; i < updateSets.length; i++) {
      if (curr == updateSets[i].sysId) {
        updateSetData.current = updateSets[i];
      }
    }
    $http.put('/api/now/ui/concoursepicker/updateset', updateSetData.current);
  };
  var getUpdateSetList = function() {
    fetchedInitialData = true;
    return $http.get('/api/now/ui/concoursepicker/updateset?cache=' + new Date().getTime()).then(function(response) {
      if (response && response.data && response.data.result) {
        if (response.data.result.updateSet) {
          updateSetData.list = response.data.result.updateSet;
          if (response.data.result.current) {
            var updateSets = response.data.result.updateSet;
            var curr = response.data.result.current;
            for (var i = 0; i < updateSets.length; i++) {
              if (curr.sysId == updateSets[i].sysId) {
                updateSetData.current = updateSets[i];
                updateSetData.currentId = updateSets[i].sysId;
                break;
              }
            }
          }
        }
      }
    });
  };
  snCustomEvent.observe('sn:refresh_update_set', function() {
    getUpdateSetList();
  });
  $rootScope.$on('concourse.application.changed', function() {
    getUpdateSetList();
  });
  return {
    hasFetchedData: hasFetchedData,
    updateSetData: updateSetData,
    initialize: initialize,
    updateCurrent: updateCurrent,
    getUpdateSetList: getUpdateSetList
  }
}]);;