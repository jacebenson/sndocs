/*! RESOURCE: /scripts/app.ng_chat/conversation/filter.frameSet.js */
angular.module('sn.connect.conversation').filter('frameSet', function() {
    'use strict';
    return function(input) {
        return input.filter(function(conversation) {
            return !conversation.isFrameStateClosed && conversation.visible;
        }).sort(function(conv1, conv2) {
            return conv1.frameOrder - conv2.frameOrder;
        });
    }
});;