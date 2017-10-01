/*! RESOURCE: /scripts/classes/nowapi/i18n.js */
(function(exports, angular) {
    "use strict";
    var i18nService;
    angular.injector(['ng', 'sn.common.i18n']).invoke(function(i18n) {
        i18nService = i18n;
    });
    exports.g_i18n = {
        getMessage: i18nService.getMessage,
        format: i18nService.format,
        getMessages: i18nService.getMessages
    };
})(window.nowapi, angular);;