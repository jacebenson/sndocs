/*! RESOURCE: /scripts/PageTimingService.js */
(function() {
  "use strict";
  if (window.NOW.PageTimingService)
    return;
  window.NOW.PageTimingService = {
    send: function(data, success, error) {
      if (!data.transaction_id) {
        if (window.console && window.console.warn)
          console.warn("missing data.transaction_id, could not send page timing");
        return;
      }
      var transactionID = data.transaction_id;
      delete data.transaction_id;
      if (!error) {
        error = function(request, textStatus, errorThrown) {
          if (request.statusText !== 'abort') {
            console.error(errorThrown);
          }
        };
      }
      var headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
      if (typeof g_ck != 'undefined')
        headers['X-UserToken'] = g_ck;
      return $j.ajax({
        headers: headers,
        'type': 'PATCH',
        'url': "/api/now/ui/page_timing/" + transactionID,
        'data': JSON.stringify(data),
        'success': success,
        'error': error
      });
    }
  };
})();;