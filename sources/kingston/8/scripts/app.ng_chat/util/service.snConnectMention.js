/*! RESOURCE: /scripts/app.ng_chat/util/service.snConnectMention.js */
angular.module("sn.connect.util").factory("snConnectMention", function(liveProfileID, $q, snMention) {
  "use strict";

  function retrieveMembers(conversation, term) {
    if (!conversation.table || !conversation.document) {
      var deferred = $q.defer();
      deferred.resolve(conversation.members.filter(function(mem) {
        return (mem.name.toUpperCase().indexOf(term.toUpperCase()) >= 0 && liveProfileID !== mem.sysID);
      }).slice(0, 5));
      return deferred.promise;
    }
    return snMention.retrieveMembers(conversation.table, conversation.document, term);
  }
  return {
    retrieveMembers: retrieveMembers
  }
});;