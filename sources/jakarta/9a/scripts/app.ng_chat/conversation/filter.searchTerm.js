/*! RESOURCE: /scripts/app.ng_chat/conversation/filter.searchTerm.js */
angular.module('sn.connect.conversation').filter('searchTerm', function() {
  'use strict';
  return function(input, searchTerm) {
    if (!searchTerm || searchTerm.length === 0)
      return input;
    var directMessages = [],
      groupMessages = [];
    input.filter(function(item) {
      if (item.isGroup)
        groupMessages.push(item);
      else
        directMessages.push(item);
    });
    var tempA = [],
      tempB = [];
    directMessages.filter(function(item) {
      if (item.name.indexOf(searchTerm) === 0) {
        tempA.push(item);
      } else {
        tempB.push(item);
      }
    });
    directMessages = tempA.concat(tempB);
    tempA = [];
    tempB = [];
    groupMessages.filter(function(item) {
      if (item.name.indexOf(searchTerm) === 0 || item.description.indexOf(searchTerm) === 0) {
        tempA.push(item);
      } else {
        tempB.push(item);
      }
    });
    groupMessages = tempA.concat(tempB);
    var newInput = directMessages.concat(groupMessages);

    function contains(s, t) {
      var s2 = s.toUpperCase();
      var t2 = t.toUpperCase();
      return s2.indexOf(t2) > -1;
    }
    return newInput.filter(function(entry) {
      return contains(entry.name, searchTerm) || contains(entry.description, searchTerm)
    });
  }
});;