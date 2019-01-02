/*! RESOURCE: /scripts/sn/common/util/factory.ArraySynchronizer.js */
angular.module("sn.common.util").factory("ArraySynchronizer", function() {
  'use strict';

  function ArraySynchronizer() {}

  function index(key, arr) {
    var result = {};
    var keys = [];
    result.orderedKeys = keys;
    angular.forEach(arr, function(item) {
      var keyValue = item[key];
      result[keyValue] = item;
      keys.push(keyValue);
    });
    return result;
  }

  function sortByKeyAndModel(arr, key, model) {
    arr.sort(function(a, b) {
      var aIndex = model.indexOf(a[key]);
      var bIndex = model.indexOf(b[key]);
      if (aIndex > bIndex)
        return 1;
      else if (aIndex < bIndex)
        return -1;
      return 0;
    });
  }
  ArraySynchronizer.prototype = {
    add: function(syncField, dest, source, end) {
      end = end || "bottom";
      var destIndex = index(syncField, dest);
      var sourceIndex = index(syncField, source);
      angular.forEach(sourceIndex.orderedKeys, function(key) {
        if (destIndex.orderedKeys.indexOf(key) === -1) {
          if (end === "bottom") {
            dest.push(sourceIndex[key]);
          } else {
            dest.unshift(sourceIndex[key]);
          }
        }
      });
    },
    synchronize: function(syncField, dest, source, deepKeySyncArray) {
      var destIndex = index(syncField, dest);
      var sourceIndex = index(syncField, source);
      deepKeySyncArray = (typeof deepKeySyncArray === "undefined") ? [] : deepKeySyncArray;
      for (var i = destIndex.orderedKeys.length - 1; i >= 0; i--) {
        var key = destIndex.orderedKeys[i];
        if (sourceIndex.orderedKeys.indexOf(key) === -1) {
          destIndex.orderedKeys.splice(i, 1);
          dest.splice(i, 1);
        }
        if (deepKeySyncArray.length > 0) {
          angular.forEach(deepKeySyncArray, function(deepKey) {
            if (sourceIndex[key] && destIndex[key][deepKey] !== sourceIndex[key][deepKey]) {
              destIndex[key][deepKey] = sourceIndex[key][deepKey];
            }
          });
        }
      }
      angular.forEach(sourceIndex.orderedKeys, function(key) {
        if (destIndex.orderedKeys.indexOf(key) === -1)
          dest.push(sourceIndex[key]);
      });
      sortByKeyAndModel(dest, syncField, sourceIndex.orderedKeys);
    }
  };
  return ArraySynchronizer;
});;