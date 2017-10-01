/*! RESOURCE: /scripts/app.$sp/service.spScUtil.js */
angular.module('sn.$sp').factory('spScUtil', function($http, $q, $log) {
    "use strict";
    var baseUrl = "/api/sn_sc/v1/servicecatalog/";

    function addAdditionalParms(req, parms) {
        for (var key in parms)
            req[key] = parms[key];
    }

    function getCart() {
        return $http.get(baseUrl + "cart");
    }

    function submitProducer(producerId, variables, newRecordID) {
        return $http.post(baseUrl + "items/" + producerId + "/submit_producer", {
            'variables': variables,
            'sysparm_item_guid': newRecordID,
            'get_portal_messages': 'true'
        }).then(null, onFail);
    }

    function orderNow(itemId, quantity, variables, newRecordID, additionalParms) {
        var request = {
            'sysparm_quantity': quantity,
            'variables': variables,
            'sysparm_item_guid': newRecordID,
            'get_portal_messages': 'true'
        };
        addAdditionalParms(request, additionalParms);
        return $http.post(baseUrl + "items/" + itemId + "/order_now", request).then(null, onFail);
    }

    function addToCart(itemId, quantity, variables, newRecordID) {
        return $http.post(baseUrl + "items/" + itemId + "/add_to_cart", {
            'sysparm_quantity': quantity,
            'variables': variables,
            'sysparm_item_guid': newRecordID
        }).then(null, onFail);
    }

    function updateCart(itemId, quantity, variables) {
        return $http.put(baseUrl + "cart/" + itemId, {
            'sysparm_quantity': quantity,
            'variables': variables
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
            'get_portal_messages': 'true'
        };
        addAdditionalParms(request, additionalParms);
        return $http.post(baseUrl + "items/" + itemId + "/order_now", request).then(null, onFail);
    }

    function addWishlistedItemToCart(itemId, quantity, variables, savedItemId) {
        return $http.post(baseUrl + "items/" + itemId + "/add_to_cart", {
            'sysparm_quantity': quantity,
            'variables': variables,
            'saved_item_id': savedItemId
        }).then(null, onFail);
    }

    function submitWishlistedProducer(producerId, variables, savedItemId) {
        return $http.post(baseUrl + "items/" + producerId + "/submit_producer", {
            'variables': variables,
            'sysparm_item_guid': savedItemId,
            'get_portal_messages': 'true',
            'saved_item_id': savedItemId
        }).then(null, onFail);
    }

    function onFail(response) {
        $log.info("REST Failure");
        $log.info(response);
        return $q.reject(response);
    }
    return {
        getCart: getCart,
        submitProducer: submitProducer,
        orderNow: orderNow,
        addToCart: addToCart,
        updateCart: updateCart,
        addToWishlist: addToWishlist,
        orderWishlistedItem: orderWishlistedItem,
        addWishlistedItemToCart: addWishlistedItemToCart,
        submitWishlistedProducer: submitWishlistedProducer
    }
});;