/*! RESOURCE: /scripts/app/base/_module.js */
angular.module('sn.base', ['sn.common.auth']);
window.countWatchers = window.countWatchers || function(root) {
  var watchers = [];
  var f = function(element) {
    angular.forEach(['$scope', '$isolateScope'], function(scopeProperty) {
      if (element.data() && element.data().hasOwnProperty(scopeProperty)) {
        angular.forEach(element.data()[scopeProperty].$$watchers, function(watcher) {
          watchers.push(watcher);
        });
      }
    });
    angular.forEach(element.children(), function(childElement) {
      f(angular.element(childElement));
    });
  };
  f(root);
  var watchersWithoutDuplicates = [];
  angular.forEach(watchers, function(item) {
    if (watchersWithoutDuplicates.indexOf(item) < 0) {
      watchersWithoutDuplicates.push(item);
    }
  });
  console.log(watchersWithoutDuplicates.length);
};;