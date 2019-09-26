/*! RESOURCE: /scripts/app.$sp/filter.unique.js */
angular.module('sn.$sp').filter('unique', function() {
  return function(collection, property) {
    return _.uniqBy(collection, function(item) {
      return item[property];
    });
  }
});;