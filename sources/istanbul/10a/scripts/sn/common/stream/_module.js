/*! RESOURCE: /scripts/sn/common/stream/_module.js */
angular.module("sn.common.stream", ['sn.base', 'ng.amb', 'sn.messaging', 'sn.common.glide', 'ngSanitize',
  'sn.common.avatar', 'sn.common.ui.popover', 'mentio', 'sn.common.controls', 'sn.common.user_profile',
  'sn.common.datetime', 'sn.common.mention', 'sn.common.ui'
]);
angular.module("sn.stream.direct", ['sn.common.stream']);;