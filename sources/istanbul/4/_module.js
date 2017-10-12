/*! RESOURCE: /scripts/sn/common/form/data/_module.js */
angular.module('sn.common.form.data', []);;ng']);;.module('sn.messaging', ['sn.common.messaging']);;]);; 'sn.common.avatar', 'sn.common.ui.popover', 'mentio', 'sn.common.controls', 'sn.common.user_profile',
  'sn.common.datetime', 'sn.common.mention', 'sn.common.ui'
]);
angular.module("sn.stream.direct", ['sn.common.stream']);;ommon.user_profile',
  'sn.common.util'
]);
angular.module('ng.common', [
  'sn.common'
]);;
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