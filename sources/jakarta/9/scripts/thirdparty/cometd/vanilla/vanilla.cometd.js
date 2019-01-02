/*! RESOURCE: /scripts/thirdparty/cometd/vanilla/vanilla.cometd.js */
(function(global, org_cometd) {
  org_cometd.JSON.toJSON = window.JSON.stringify;
  org_cometd.JSON.fromJSON = window.JSON.parse;

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
      var request = new XMLHttpRequest();
      request.open('POST', packet.url, true);
      _setHeaders(request, packet.headers);
      request.setRequestHeader("Content-type", "application/json;charset=UTF-8");
      request.xhrFields = {
        withCredentials: true
      };
      request.onload = function() {
        var state = this.status;
        if (state >= 200 && state < 400)
          packet.onSuccess(this.response);
        else
          packet.onError(state, this.statusText);
      };
      request.send(packet.body);
      return request;
    };
    return that;
  }
  global.Cometd = function(name) {
    var CometD = org_cometd.Cometd || org_cometd.CometD;
    var cometd = new CometD(name);
    if (org_cometd.WebSocket) {
      cometd.registerTransport('websocket', new org_cometd.WebSocketTransport());
    }
    cometd.registerTransport('long-polling', new LongPollingTransport());
    return cometd;
  };
})(window, org.cometd);;