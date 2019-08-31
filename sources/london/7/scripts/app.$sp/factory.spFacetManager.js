/*! RESOURCE: /scripts/app.$sp/factory.spFacetManager.js */
angular.module('sn.$sp').factory('spFacetManager', function($location) {
  'use strict';
  var subscribeCallbackMap = {};

  function addFacetWithSearchSource(t, key, value) {
    $location.search("spa", "1");
    $location.search("t", t);
    addFacet(key, value);
  }

  function addFacet(key, value) {
    $location.search("spa", "1");
    var urlValue = value.toString();
    if (Array.isArray(value)) {
      value = value.map(encodeCommas);
      urlValue = "[" + value.toString() + "]";
    }
    $location.search(key, urlValue);
  }

  function clearFacet(key) {
    $location.search(key, null);
  }

  function clearFacetValue(facetID, facetValue) {
    facetValue = encodeCommas(facetValue);
    var currentFacetValue = $location.search()[facetID];
    if (!currentFacetValue.charAt(0) === '[' || !currentFacetValue.charAt(currentFacetValue.length - 1) === ']') {
      clearFacet(facetID);
      return;
    }
    var currentFacetArr = currentFacetValue.substring(1, currentFacetValue.length - 1).split(',');
    var index = currentFacetArr.indexOf(facetValue);
    currentFacetArr.splice(index, 1);
    if (currentFacetArr.length == 0) {
      clearFacet(facetID);
      return;
    }
    $location.search(facetID, '[' + currentFacetArr.toString() + ']');
  }

  function clearAllFacet() {
    var urlParams = $location.search(),
      keys = _.keys(urlParams);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i] !== 'q' && keys[i] !== 't' && keys[i] !== 'id' && keys[i] !== 'spa') {
        $location.search(keys[i], null);
      }
    }
  }

  function isFacetSelected(key, searchSource) {
    var facetURLValue = $location.search()[key],
      t = $location.search().t;
    return (facetURLValue != undefined && facetURLValue != null) && t === searchSource;
  }

  function isAnyFacetSelected() {
    var urlParams = $location.search(),
      keys = _.keys(urlParams);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i] !== 'q' && keys[i] !== 't' && keys[i] !== 'id' && keys[i] !== 'spa') {
        return true;
      }
    }
    return false;
  }

  function notify(response) {
    _notifySubscribers("spFacets.refresh.data", {
      data: response.data.result.facets,
      query: $location.search()
    });
  }

  function _notifySubscribers(eventName, data) {
    if (subscribeCallbackMap[eventName]) {
      var listeners = subscribeCallbackMap[eventName];
      for (var i = 0; i < listeners.length; i++) {
        listeners[i](data);
      }
    }
  }

  function encodeCommas(str) {
    return str.split(",").join("%2C");
  }
  return {
    addFacet: addFacet,
    addFacetWithSearchSource: addFacetWithSearchSource,
    clearFacet: clearFacet,
    clearFacetValue: clearFacetValue,
    clearAllFacet: clearAllFacet,
    isAnyFacetSelected: isAnyFacetSelected,
    isFacetSelected: isFacetSelected,
    notify: notify,
    publish: function(eventName, data) {
      _notifySubscribers(eventName, data);
    },
    subscribe: function(eventName, id, callback) {
      if (!subscribeCallbackMap[eventName]) {
        subscribeCallbackMap[eventName] = [];
      }
      subscribeCallbackMap[eventName].push(callback);
    }
  }
});;