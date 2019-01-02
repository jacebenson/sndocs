/*! RESOURCE: /scripts/app.$sp/constant.spConf.js */
(function() {
  var config = {
    page: 'sp.do',
    angularProcessor: 'angular.do',
    sysParamType: '$sp',
    widgetApi: '/api/now/sp/widget/',
    instanceApi: '/api/now/sp/rectangle/',
    pageApi: '/api/now/sp/page',
    announcementApi: '/api/now/sp/announcement',
    logoutUrl: '/logout.do?sysparm_goto_url=/{url_suffix}',
    s: 83,
    e: {
      notification: '$$uiNotification',
      announcement: '$$:sp:announcement'
    },
    SYS_DATE_FORMAT: 'yyyy-MM-dd',
    SYS_TIME_FORMAT: 'HH:mm:ss'
  };
  angular.module('sn.$sp').constant('spConf', config);
}());;