/*! RESOURCE: /scripts/sn/common/stream/_module.js */
angular.module("sn.common.stream", ['sn.base', 'ng.amb', 'sn.messaging', 'sn.common.glide', 'ngSanitize',
  'sn.common.avatar', 'sn.common.ui.popover', 'mentio', 'sn.common.controls', 'sn.common.user_profile',
  'sn.common.datetime', 'sn.common.mention', 'sn.common.ui'
]);
angular.module("sn.stream.direct", ['sn.common.stream']);;ment.data()[scopeProperty].$$watchers, function(watcher) {
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