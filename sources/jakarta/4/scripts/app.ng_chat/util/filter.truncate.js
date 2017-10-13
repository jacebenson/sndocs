/*! RESOURCE: /scripts/app.ng_chat/util/filter.truncate.js */
angular.module('sn.connect.util').filter('truncate', function() {
  "use strict";
  var MAX_LENGTH = 75;
  return function(text) {
    if (text) {
      if (text.length <= MAX_LENGTH) {
        return text;
      }
      return text.substring(0, MAX_LENGTH).trim() + "...";
    }
  };
});;