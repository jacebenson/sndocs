/*! RESOURCE: /scripts/app.$sp/service.spScUtil.js */
angular.module('sn.$sp').factory('spScUtil', function($http, $q, $log, spSCConf, $httpParamSerializer, spUtil, i18n) {
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

  function submitStdChgProducer(producerId, twoStep, currentVersion, newRecordID, portalSuffix) {
    var promise;
    if (twoStep) {
      var urlParameters = {};
      urlParameters["sys_id"] = '-1';
      urlParameters["id"] = 'form';
      urlParameters["table"] = 'change_request';
      urlParameters["query"] = 'type=standard^std_change_producer_version=' + currentVersion;
      var completeUrl = portalSuffix + '?' + $httpParamSerializer(urlParameters);
      var resp = {};
      resp['redirect_portal_url'] = completeUrl;
      resp['redirect_url'] = completeUrl;
      resp['table'] = 'change_request';
      promise = $q.resolve({
        data: {
          result: resp
        }
      });
    } else
      promise = this.submitProducer(producerId, {}, newRecordID, null);
    return promise;
  }

  function orderNow(itemId, quantity, variables, newRecordID, additionalParms) {
    var request = {
      'sysparm_quantity': quantity,
      'variables': variables,
      'sysparm_item_guid': newRecordID,
      'get_portal_messages': 'true',
      sysparm_no_validation: 'true'
    };
    addAdditionalParms(request, additionalParms);
    return $http.post(baseCatalogUrl + "items/" + itemId + "/order_now", request).then(null, onFail);
  }

  function addToCart(itemId, quantity, variables, newRecordID) {
    return $http.post(baseCatalogUrl + "items/" + itemId + "/add_to_cart", {
      'sysparm_quantity': quantity,
      'variables': variables,
      'sysparm_item_guid': newRecordID,
      sysparm_no_validation: 'true'
    }).then(null, onFail);
  }

  function updateCart(itemId, quantity, variables) {
    return $http.put(baseCatalogUrl + "cart/" + itemId, {
      'sysparm_quantity': quantity,
      'variables': variables,
      sysparm_no_validation: 'true'
    }).then(null, onFail);
  }

  function addToWishlist(itemId, quantity, variables, newRecordID) {
    return $http.post(baseCatalogUrl + "items/" + itemId + "/add_to_wishlist", {
      'sysparm_quantity': quantity,
      'variables': variables,
      'sysparm_item_guid': newRecordID
    }).then(null, onFail);
  }

  function orderWishlistedItem(itemId, quantity, variables, savedItemId, additionalParms) {
    var request = {
      'sysparm_quantity': quantity,
      'variables': variables,
      'saved_item_id': savedItemId,
      'get_portal_messages': 'true',
      sysparm_no_validation: 'true'
    };
    addAdditionalParms(request, additionalParms);
    return $http.post(baseCatalogUrl + "items/" + itemId + "/order_now", request).then(null, onFail);
  }

  function addWishlistedItemToCart(itemId, quantity, variables, savedItemId) {
    return $http.post(baseCatalogUrl + "items/" + itemId + "/add_to_cart", {
      'sysparm_quantity': quantity,
      'variables': variables,
      'saved_item_id': savedItemId,
      sysparm_no_validation: 'true'
    }).then(null, onFail);
  }

  function submitWishlistedProducer(producerId, variables, savedItemId, additionalParms) {
    var request = {
      'variables': variables,
      'sysparm_item_guid': savedItemId,
      'get_portal_messages': 'true',
      'saved_item_id': savedItemId,
      sysparm_no_validation: 'true'
    };
    addAdditionalParms(request, additionalParms);
    return $http.post(baseCatalogUrl + "items/" + producerId + "/submit_producer", request).then(null, onFail);
  }

  function getDisplayValueForMultiRowSet(multiRowSetId, value) {
    var params = {};
    params['sysparm_value'] = value;
    var url = baseCatalogUrl + "variables/" + multiRowSetId + "/display_value";
    return $http.post(url, params).then(null, onFail);
  }

  function onFail(response) {
    $log.info("REST Failure");
    $log.info(response);
    if (!isCustomRestException(response))
      spUtil.addErrorMessage(i18n.getMessage("Something went wrong and your request could not be submitted. Please contact your system administrator"));
    return $q.reject(response);
  }

  function isCustomRestException(response) {
    if (response.data.result && response.data.result.errMsg)
      return true;
    return false;
  }

  function isCatalogVariable(field) {
    return ('' + field[spSCConf._CAT_VARIABLE]) == 'true';
  }

  function isRegexDone(fields) {
    for (var field in fields) {
      if (fields.hasOwnProperty(field) && fields[field].isRegexDone === false)
        return false;
    }
    return true;
  }

  function queryRecord(table, recordId) {
    return $http.get(baseTableApi + table + '/' + recordId);
  }

  function queryMultipleRecords(table, queryObj) {
    var query = "";
    for (var obj in queryObj)
      query += obj + "=" + queryObj[obj] + '&';
    return $http.get(baseTableApi + table + '?' + query);
  }

  function validateRegex(variableId, value) {
    var params = {};
    params['sysparm_value'] = value;
    var url = baseCatalogUrl + "variables/" + variableId + "/validate_regex";
    return $http.post(url, params).then(null, onFail);
  }
  return {
    getCart: getCart,
    submitProducer: submitProducer,
    submitStdChgProducer: submitStdChgProducer,
    orderNow: orderNow,
    addToCart: addToCart,
    updateCart: updateCart,
    addToWishlist: addToWishlist,
    orderWishlistedItem: orderWishlistedItem,
    addWishlistedItemToCart: addWishlistedItemToCart,
    submitWishlistedProducer: submitWishlistedProducer,
    getDisplayValueForMultiRowSet: getDisplayValueForMultiRowSet,
    isCatalogVariable: isCatalogVariable,
    queryRecord: queryRecord,
    queryMultipleRecords: queryMultipleRecords,
    validateRegex: validateRegex,
    isRegexDone: isRegexDone
  }
});;