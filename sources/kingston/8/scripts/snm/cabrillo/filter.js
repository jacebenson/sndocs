/*! RESOURCE: /scripts/snm/cabrillo/filter.js */
(function(window, cabrillo, undefined) {
  'use strict';
  var PACKAGE = 'filter';
  cabrillo.extend(cabrillo, {
    filter: {
      editEncodedQuery: editEncodedQuery
    }
  });

  function editEncodedQuery(tableName, encodedQuery) {
    return callMethod('editEncodedQuery', {
      table: tableName,
      encodedQuery: encodedQuery
    }).then(function(data) {
      return data.results;
    }, function(err) {
      cabrillo.log('Failed to edit query:', err);
      return cabrillo.q.reject(err);
    });
  }

  function callMethod(methodName, data) {
    return cabrillo.callMethod(cabrillo.PACKAGE + '.' + PACKAGE + '.' + methodName, data);
  }
})(window, window['snmCabrillo']);;