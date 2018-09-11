/*! RESOURCE: /scripts/app.ng_chat/document/service.documentLinkMatcher.js */
angular.module('sn.connect.document').service('documentLinkMatcher', function() {
  "use strict";

  function match(str) {
    if (str.match) {
      return str.match(/([\w_]+).do\?sys_id=(\w{32})/);
    }
    return null;
  }
  return {
    isLink: function(href) {
      return match(href) !== null;
    },
    getRecordData: function(href) {
      var linkMatch = match(href);
      if (!linkMatch)
        return {}
      return {
        table: linkMatch[1],
        sysID: linkMatch[2]
      }
    }
  }
});