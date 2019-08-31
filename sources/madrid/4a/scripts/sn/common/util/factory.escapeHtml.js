/*! RESOURCE: /scripts/sn/common/util/factory.escapeHtml.js */
angular.module('sn.common.util').factory('escapeHtml', function() {
  return function(value) {
    if (typeof value !== 'string') {
      return '';
    }
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/'/g, '&#39;')
      .replace(/"/g, '&quot;')
      .replace(/\//g, '&#x2F;');
  };
});;