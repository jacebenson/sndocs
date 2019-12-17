/*! RESOURCE: /scripts/app.$sp/service.spScUtil.js */
angular.module('sn.$sp').factory('spScUtil', function($http, $q, $log, spSCConf, $httpParamSerializer) {
      "use strict";
      var baseCatalogUrl = "/api/sn_sc/v1/servicecatalog/";
      var baseTableApi = "/api/now/table/";

      function addAdditionalParms(req, parms) {
        for (var key in parms)
          req[key] = parms[key];
      }

      function getCart() {
        return $http.get(baseCatalogUrl + "cart");
      }

      function submitProducer(producerId, variables, newRecordID, additionalParms) {
        var request = {
          'variables': variables,
          'sysparm_item_guid': newRecordID,
          'get_portal_messages': 'true',
          sysparm_no_validation: 'true'
        };
        addAdditionalParms(request, additionalParms);
        return $http.post(baseCatalogUrl + "items/" + producerId + "/submit_producer", request).then(null, onFail);
      }

      function submi