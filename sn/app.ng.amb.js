/*! RESOURCE: /scripts/app.ng.amb/app.ng.amb.js */
angular.module("ng.amb", ['sn.common.presence', 'sn.common.util'])
    .value("ambLogLevel", 'info')
    .value("ambServletURI", '/amb')
    .value("cometd", angular.element.cometd)
    .value("ambLoginWindow", 'true');;