/*! RESOURCE: /scripts/sn/common/link/_module.js */
angular.module("sn.common.link", []);;fication', ['sn.common.util', 'ngSanitize']);;ion($provide) {
  "use strict";
  $provide.constant("PRESENCE_DISABLED", "false" === "true");
});;pe', '$isolateScope'], function(scopeProperty) {
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