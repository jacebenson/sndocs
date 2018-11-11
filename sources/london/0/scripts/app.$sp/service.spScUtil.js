/*! RESOURCE: /scripts/app.$sp/service.spScUtil.js */
angular.module('sn.$sp').factory('spScUtil', function($http, $q, $log, spSCConf, $httpParamSerializer) {
  "use strict";
  var baseUrl = "/api/sn_sc/v1/servicecatalog/";

  function addAdditionalParms(req, parms) {
    for (var key in parms)
      req[key] = parms[key];
  }

  function getCart() {
    return $http.get(baseUrl + "cart");
  }

  function submitProducer(producerId, variables, newRecordID, additionalParms) {
    var request = {
      'variables': variables,
      'sysparm_item_guid': newRecordID,
      'get_portal_messages': 'true',
      sysparm_no_validation: 'true'
    };
    addAdditionalParms(request, additionalParms);
    return $http.post(baseUrl + "items/" + producerId + "/submit_producer", request).then(null, onFail);
  }

  function submitStdChgProducer(producerId, twoStep, currentVersion, newRecordID) {
    var promise;
    if (twoStep) {
      var urlParameters = {};
      urlParameters["sys_id"] = '-1';
      urlParameters["id"] = 'form';
      urlParameters["table"] = 'change_request';
      urlParameters["query"] = 'type=standard^std_change_producer_version=' + currentVersion;
      var completeUrl = 'sp?' + $httpParamSerializer(urlParameters);
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
    return $http.post(baseUrl + "items/" + itemId + "/order_now", request).then(null, onFail);
  }

  function addToCart(itemId, quantity, variables, newRecordID) {
    return $http.post(baseUrl + "items/" + itemId + "/add_to_cart", {
      'sysparm_quantity': quantity,
      'variables': variables,
      'sysparm_item_guid': newRecordID,
      sysparm_no_validation: 'true'
    }).then(null, onFail);
  }

  function updateCart(itemId, quantity, variables) {
    return $http.put(baseUrl + "cart/" + itemId, {
      'sysparm_quantity': quantity,
      'variables': variables,
      sysparm_no_validation: 'true'
    }).then(null, onFail);
  }

  function addToWishlist(itemId, quantity, variables, newRecordID) {
    return $http.post(baseUrl + "items/" + itemId + "/add_to_wishlist", {
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
    return $http.post(baseUrl + "items/" + itemId + "/order_now", request).then(null, onFail);
  }

  function addWishlistedItemToCart(itemId, quantity, variables, savedItemId) {
    return $http.post(baseUrl + "items/" + itemId + "/add_to_cart", {
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
    return $http.post(baseUrl + "items/" + producerId + "/submit_producer", request).then(null, onFail);
  }

  function getDisplayValueForMultiRowSet(multiRowSetId, value) {
    var params = {};
    params['sysparm_value'] = value;
    var url = "/api/sn_sc/servicecatalog/variables/" + multiRowSetId + "/display_value";
    return $http.post(url, params).then(null, onFail);
  }

  function onFail(response) {
    $log.info("REST Failure");
    $log.info(response);
    return $q.reject(response);
  }

  function isCatalogVariable(field) {
    return ('' + field[spSCConf._CAT_VARIABLE]) == 'true';
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
    isCatalogVariable: isCatalogVariable
  }
});;