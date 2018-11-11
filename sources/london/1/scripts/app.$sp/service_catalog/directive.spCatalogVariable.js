/*! RESOURCE: /scripts/app.$sp/service_catalog/directive.spCatalogVariable.js */
angular.module('sn.$sp').directive('spCatalogVariable', function(spSCConf) {
  "use strict";
  return {
    restrict: 'E',
    templateUrl: 'sp_catalog_variable.xml',
    link: function(scope, element, attrs, ctrl) {
      scope.spSCConf = spSCConf;
    }
  };
});;