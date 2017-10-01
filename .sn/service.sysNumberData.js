/*! RESOURCE: /scripts/app.ng_chat/util/service.sysNumberData.js */
angular.module("sn.connect.util").factory("sysNumberData", function(snHttp, nowServer) {
    "use strict";
    return {
        getListPrefixes: function() {
            var url = nowServer.getURL("number_data");
            return snHttp.get(url).then(function(result) {
                return result.data
            });
        }
    }
});