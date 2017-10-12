/*! RESOURCE: /scripts/sn/common/resources/_module.js */
angular.module('sn.common.resources', [
  'sn.common.i18n'
]);;('sn.util', ['sn.common.util']);;;"use strict";
  $provide.constant("PRESENCE_DISABLED", "false" === "true");
});;s', 'sn.common.user_profile',
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