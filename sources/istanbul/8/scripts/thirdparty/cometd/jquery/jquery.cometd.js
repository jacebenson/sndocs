/*! RESOURCE: /scripts/thirdparty/cometd/jquery/jquery.cometd.js */
(function() {
  function bind($, org_cometd) {
    org_cometd.JSON.toJSON = (window.JSON && JSON.stringify) || (window.jaredJSON && window.jaredJSON.stringify);
    org_cometd.JSON.fromJSON = (window.JSON && JSON.parse) || (window.jaredJSON && window.jaredJSON.parse);

    function _setHeaders(xhr, headers) {
      if (headers) {
        for (var headerName in headers) {
          if (headerName.toLowerCase() === 'content-type') {
            continue;
          }
          xhr.setRequestHeader(headerName, headers[headerName]);
        }
      }
    }

    function LongPollingTransport() {
      var _super = new org_cometd.LongPollingTransport();
      var that = org_cometd.Transport.derive(_super);
      that.xhrSend = function(packet) {
        return $.ajax({
          url: packet.url,
          async: packet.sync !== true,
          type: 'POST',
          contentType: 'application/json;charset=UTF-8',
          data: packet.body,
          xhrFields: {
            withCredentials: true
          },
          beforeSend: function(xhr) {
            _setHeaders(xhr, packet.headers);
            return true;
          },
          success: packet.onSuccess,
          error: function(xhr, reason, exception) {
            packet.onError(reason, exception);
          }
        });
      };
      return that;
    }

    function CallbackPollingTransport() {
      var _super = new org_cometd.CallbackPollingTransport();
      var that = org_cometd.Transport.derive(_super);
      that.jsonpSend = function(packet) {
        $.ajax({
          url: packet.url,
          async: packet.sync !== true,
          type: 'GET',
          dataType: 'jsonp',
          jsonp: 'jsonp',
          data: {
            message: packet.body
          },
          beforeSend: function(xhr) {
            _setHeaders(xhr, packet.headers);
            return true;
          },
          success: packet.onSuccess,
          error: function(xhr, reason, exception) {
            packet.onError(reason, exception);
          }
        });
      };
      return that;
    }
    $.Cometd = function(name) {
      var cometd = new org_cometd.Cometd(name);
      if (org_cometd.WebSocket) {
        cometd.registerTransport('websocket', new org_cometd.WebSocketTransport());
      }
      cometd.registerTransport('long-polling', new LongPollingTransport());
      cometd.registerTransport('callback-polling', new CallbackPollingTransport());
      return cometd;
    };
    $.cometd = new $.Cometd();
    return $.cometd;
  }
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'org/cometd'], bind);
  } else {
    bind(window.jQuery || window.Zepto, org.cometd);
  }
})();;