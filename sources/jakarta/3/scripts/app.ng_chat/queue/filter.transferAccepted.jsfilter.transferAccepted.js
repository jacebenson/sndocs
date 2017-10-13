/*! RESOURCE: /scripts/app.ng_chat/queue/filter.transferAccepted.js */
angular.module('sn.connect.queue').filter('transferAccepted', function() {
  'use strict';
  return function(input) {
    return input.filter(function(conversation) {
      var queueEntry = conversation.queueEntry;
      return queueEntry && queueEntry.isTransferringFromMe && queueEntry.isTransferAccepted;
    });
  }
});;