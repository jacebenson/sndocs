/*! RESOURCE: /scripts/app.$sp/service.spMetatags.js */
angular.module('sn.$sp').factory('spMetatagService', function() {
    'use strict';
    var metatagMap = {};
    var subscribeCallbackArr = [];

    function notifySubscribers() {
        for (var i = 0; i < subscribeCallbackArr.length; i++) {
            subscribeCallbackArr[i](metatagMap);
        }
    }
    return {
        setTags: function(tagArr) {
            metatagMap = {};
            if (tagArr && tagArr.length) {
                for (var i = 0; i < tagArr.length; i++) {
                    metatagMap[tagArr[i].name] = tagArr[i].content;
                }
            }
            notifySubscribers();
        },
        subscribe: function(callback) {
            subscribeCallbackArr.push(callback);
        }
    }
});;