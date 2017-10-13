/*! RESOURCE: /scripts/app.ng_chat/util/service.fileSizeConverter.js */
angular.module("sn.connect.util").service("fileSizeConverter", function() {
  "use strict";
  return {
    getByteCount: function(bytes, precision) {
      if (bytes.slice(-1) === 'B')
        return bytes;
      var kb = 1024;
      var mb = kb * 1024;
      var gb = mb * 1024;
      if ((bytes >= 0) && (bytes < kb))
        return bytes + ' B';
      else if ((bytes >= kb) && (bytes < mb))
        return (bytes / kb).toFixed(precision) + ' KB';
      else if ((bytes >= mb) && (bytes < gb))
        return (bytes / mb).toFixed(precision) + ' MB';
      else if (bytes >= gb)
        return (bytes / gb).toFixed(precision) + ' GB';
      else
        return bytes + ' B';
    }
  };
});