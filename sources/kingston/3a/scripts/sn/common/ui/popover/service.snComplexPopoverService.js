/*! RESOURCE: /scripts/sn/common/ui/popover/service.snComplexPopoverService.js */
angular.module('sn.common.ui.popover').service('snComplexPopoverService', function($http, $q, $templateCache) {
  "use strict";
  return {
    getTemplate: getTemplate
  };

  function getTemplate(template) {
    return $http.get(template, {
      cache: $templateCache
    });
  }
});;