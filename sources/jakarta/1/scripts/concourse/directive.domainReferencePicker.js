/*! RESOURCE: /scripts/concourse/directive.domainReferencePicker.js */
angular.module('sn.concourse').directive('domainReferencePicker', function($http, $rootScope, snCustomEvent, getTemplateUrl, domainReferenceService, userPreferences) {
  return {
    templateUrl: getTemplateUrl('concourse_domain_reference_picker.xml'),
    restrict: 'E',
    replace: false,
    scope: {
      current: '=',
      inHeader: '=',
      showInHeader: '='
    },
    controller: function($scope, $http, $rootScope, snCustomEvent) {
      $scope.domainConfig = domainReferenceService.domainConfig;
      $scope.domainOptions = {
        placeholder: $scope.current ? $scope.current.label : '',
        width: $scope.inHeader ? '150px' : '89%'
      };
      $scope.$watch('current', function() {
        $scope.domainOptions.placeholder = $scope.current.label;
      });
      domainReferenceService.showInHeader = $scope.showInHeader;
      $scope.domains = domainReferenceService;
      $scope.updateDomainFromReference = function() {
        $http.put('/api/now/ui/concoursepicker/domain', {
          value: $scope.domainConfig.field.value
        }).then(function() {
          triggerMainFrameRefresh();
        });
      };
      $scope.resetDomain = function() {
        $http.put('/api/now/ui/concoursepicker/domain', {}).then(function(response) {
          if (response && response.data && response.data.result && response.data.result.current) {
            $scope.domainConfig.field.displayValue = response.data.result.current.label;
            $scope.domainConfig.field.value = response.data.result.current.value;
          }
          triggerMainFrameRefresh();
        });
      };
      $scope.$watch("domainReferenceService.domainConfig", function(n, o) {
        if (n != o) {
          $scope.updateSelect(n.field.displayValue);
        }
      });

      function triggerMainFrameRefresh() {
        var iframe = jQuery('iframe#gsft_main');
        if (iframe.length) {
          iframe[0].contentWindow.location.reload();
        }
        snCustomEvent.fireTop('navigator.refresh');
      }
    },
    link: function(scope, element) {
      scope.updateSelect = function(text) {
        element.find('.select2-chosen').text(text);
      };
      element.on('change', 'input[type=checkbox]', function() {
        var showInHeader = angular.element(this).prop('checked');
        domainReferenceService.showInHeader = showInHeader;
        scope.showInHeader = showInHeader;
        if (showInHeader) {
          userPreferences.setPreference('glide.ui.domain_picker.in_header', 'true');
        } else {
          userPreferences.setPreference('glide.ui.domain_picker.in_header', '');
        }
      });
    }
  }
}).factory('domainReferenceService', function() {
  var domainConfig = {
    field: {
      value: null,
      displayValue: null
    }
  };
  var showInHeader = false;
  return {
    domainConfig: domainConfig,
    showInHeader: showInHeader
  };
});;