/*! RESOURCE: /scripts/sn/common/ui/_module.js */
angular.module('sn.common.ui', ['sn.common.messaging']);;, 'sn.messaging', 'sn.common.glide', 'ngSanitize',
    'sn.common.avatar', 'sn.common.ui.popover', 'mentio', 'sn.common.controls', 'sn.common.user_profile',
    'sn.common.datetime', 'sn.common.mention', 'sn.common.ui'
  ];
  if (angular.version.major == 1 && angular.version.minor >= 3)
    moduleDeps.push('ngAria');
  angular.module("sn.common.stream", moduleDeps);
  angular.module("sn.stream.direct", ['sn.common.stream']);
})();;