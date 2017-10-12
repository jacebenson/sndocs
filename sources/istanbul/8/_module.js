/*! RESOURCE: /scripts/sn/common/auth/_module.js */
angular.module('sn.common.auth', []);
angular.module('sn.auth', ['sn.common.auth']);;ommon.controls',
  'sn.common.datetime',
  'sn.common.glide',
  'sn.common.i18n',
  'sn.common.link',
  'sn.common.mention',
  'sn.common.messaging',
  'sn.common.notification',
  'sn.common.presence',
  'sn.common.stream',
  'sn.common.ui',
  'sn.common.user_profile',
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