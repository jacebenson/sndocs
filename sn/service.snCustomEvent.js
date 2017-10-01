/*! RESOURCE: /scripts/sn/common/messaging/service.snCustomEvent.js */
angular.module('sn.common.messaging').factory('snCustomEvent', function() {
    "use strict";
    if (typeof NOW.CustomEvent === 'undefined')
        throw "CustomEvent not found in NOW global";
    return NOW.CustomEvent;
});;