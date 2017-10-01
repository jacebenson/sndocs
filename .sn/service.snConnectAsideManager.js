/*! RESOURCE: /scripts/app.ng_chat/util/service.snConnectAsideManager.js */
angular.module("sn.connect.util").service("snConnectAsideManager", function(paneManager) {
    "use strict";
    return {
        setup: function() {
            if (angular.element('body').data().layout)
                paneManager.registerPane('connect:conversation_list');
        }
    };
});;