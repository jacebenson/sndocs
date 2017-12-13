/*! RESOURCE: /scripts/classes/ajax/GlideAjax.js */
var GlideAjax = Class.create(GlideURL, {
  URL: "xmlhttp.do",
  initialize: function initialize($super, processor, url) {
    var u = this.URL;
    if (url)
      u = url;
    $super(u);
    this.setProcessor(processor);
    this.callbackFunction;
    this.callbackArgs;
    this.additionalProcessorParams;
    this.errorCallbackFunction;
    this.wantRequestObject = false;
    this.setScope("global");
    this.setWantSessionMessages(true);
  },
  getProcessor: function() {
    return this.processor;
  },
  getAnswer: function() {
    if (!(this.requestObject && this.requestObject.responseXML))
      return null;
    return this.requestObject.responseXML.documentElement.getAttribute("answer");
  },
  setProcessor: function(p) {
    this.processor = p;
    this.addParam("sysparm_processor", p);
  },
  setQueryString: function(qs) {
    this.queryString = qs;
  },
  preventLoadingIcon: function() {
    this._preventLoadingIcon = true;
  },
  preventCancelNotification: function() {
    this._suppressCancelNotification = true;
  },
  getXMLWait: function(additionalParams) {
    this.addParam("sysparm_synch", "true");
    this.additionalProcessorParams = additionalParams;
    this.async = false;
    var sw = new StopWatch();
    this._makeRequest();
    var m = "*** WARNING *** GlideAjax.getXMLWait - synchronous function - processor: " + this.processor
    sw.jslog(m);
    if (window.console && window.console.log)
      console.log("%c " + m, 'background: darkred; color: white;');
    if (this.requestObject.status != 200)
      this._handleError();
    return this._responseReceived();
  },
  getXML: function(callback, additionalParams, responseParams) {
    this.wantAnswer = false;
    this._getXML0(callback, additionalParams, responseParams);
  },
  getXMLAnswer: function(callback, additionalParams, responseParams) {
    this.wantAnswer = true;
    this._getXML0(callback, additionalParams, responseParams);
  },
  _getXML0: function(callback, additionalParams, responseParams) {
    this.callbackFunction = callback;
    this.callbackArgs = responseParams;
    this.additionalProcessorParams = additionalParams;
    this.async = true;
    setTimeout(function() {
      this._makeRequest();
    }.bind(this), 0);
  },
  _makeRequest: function() {
    this.requestObject = this._getRequestObject();
    if (this.requestObject == null)
      return null;
    if (!GlideAjax.want_session_messages)
      this.setWantSessionMessages(false);
    var refUrl = this._buildReferringURL();
    if (refUrl != "") {
      this.addParam('ni.nolog.x_referer', 'ignore');
      this.addParam('x_referer', refUrl);
    }
    if (typeof g_autoRequest != 'undefined' && 'true' == g_autoRequest)
      this.addParam('sysparm_auto_request', g_autoRequest);
    this.postString = this.getQueryString(this.additionalProcessorParams);
    if (this.queryString) {
      if (this.postString)
        this.postString += "&";
      this.postString += this.queryString;
    }
    this._sendRequest();
    return this.requestObject;
  },
  _sendRequest: function() {
    this._showLoading();
    if (this.async)
      this.requestObject.onreadystatechange = this._processReqChange.bind(this);
    CustomEvent.fireTop("request_start", document);
    this.requestObject.open("POST", this.contextPath, this.async);
    this.requestObject.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    if (typeof g_ck != 'undefined' && g_ck != "")
      this.requestObject.setRequestHeader('X-UserToken', g_ck);
    try {
      this.requestObject.send(this.postString);
    } catch (e) {}
    if (!this.async || (this.callbackFunction == null))
      this._hideLoading();
  },
  _processReqChange: function() {
    if (this.requestObject.readyState != 4)
      return;
    this.requestObject.onreadystatechange = function() {};
    this._hideLoading();
    if (!this._errorCheck()) {
      this._responseReceived();
      return;
    }
    try {
      this._handleError();
    } catch (e) {
      jslog("GlideAjax error: " + e);
    }
  },
  _errorCheck: function() {
    this._cancelErrorXML = this._getCancelError();
    return this._getResponseCode() != 200 || this._wasCanceled();
  },
  _handle401Error: function() {
    if (getTopWindow().loggingOut)
      return false;
    var sessionLoggedIn = this.requestObject.getResponseHeader("X-SessionLoggedIn");
    if ("true" != sessionLoggedIn) {
      if (window.confirm(new GwtMessage().getMessage("ajax_session_timeout_goto_login_confirm"))) {
        getTopWindow().location.href = "/navpage.do";
        return true;
      }
    } else {
      var allowResubmit = this.requestObject.getResponseHeader("X-UserToken-AllowResubmit");
      if ("true" == allowResubmit) {
        var autoResubmit = this.requestObject.getResponseHeader("X-AutoResubmit");
        if ("true" == autoResubmit) {
          this._sendRequest();
          return true;
        }
        if (window.confirm(new GwtMessage().getMessage("ajax_session_timeout_resubmit_request_confirm"))) {
          this._sendRequest();
          return true;
        }
      } else {
        if ("true" == sessionLoggedIn)
          return false;
        var msg = new GwtMessage().getMessage("ajax_session_timeout_refresh_screen");
        if (!msg)
          msg = "Your session has expired. Click OK to continue.";
        if (window.confirm(msg)) {
          getTopWindow().location.href = "/navpage.do";
          return true;
        }
      }
    }
    return false;
  },
  _handleError: function() {
    var responseCode = this._getResponseCode();
    if (responseCode == 401) {
      var requestedToken = this.requestObject.getResponseHeader("X-UserToken-Request");
      var respondedToken = this.requestObject.getResponseHeader("X-UserToken-Response");
      if (requestedToken && respondedToken && requestedToken != respondedToken)
        CustomEvent.fireAll("ck_updated", respondedToken);
      var handleTimeOut = this.requestObject.getResponseHeader("X-HandleTimeOut");
      if ("true" == handleTimeOut)
        if (this._handle401Error())
          return;
    } else if (responseCode == 404 && this._outOfScope()) {
      var err_options = {
        text: "Access to Script Include " + this.processor + " blocked from scope: " + (this.getParam("sysparm_scope") ? this.getParam("sysparm_scope") : "global"),
        type: "system",
        attributes: {
          type: "error"
        }
      };
      if (typeof GlideUI != 'undefined')
        GlideUI.get().fire(new GlideUINotification(err_options));
    } else if (this._wasCanceled() && this.callbackFunction && !this._getSuppressCancelNotification()) {
      var err_options = {
        text: this._getCancelErrorText(),
        type: "system",
        attributes: {
          type: "error"
        }
      };
      if (typeof GlideUI != 'undefined')
        GlideUI.get().fire(new GlideUINotification(err_options));
    }
    if (this.errorCallbackFunction)
      this.errorCallbackFunction(this.requestObject, this.callbackArgs);
  },
  _getRequestObject: function() {
    var req = null;
    if (window.XMLHttpRequest)
      req = new XMLHttpRequest();
    else if (window.ActiveXObject)
      req = new ActiveXObject("Microsoft.XMLHTTP");
    return req;
  },
  _getResponseCode: function() {
    return this.requestObject.status;
  },
  _wasCanceled: function() {
    if (!this._cancelErrorXML)
      return false;
    var answer = this._cancelErrorXML.getAttribute('transaction_canceled');
    return answer == 'true';
  },
  _getSuppressCancelNotification: function() {
    if (this._suppressCancelNotification)
      return true;
    if (this._cancelErrorXML) {
      var suppress = this._cancelErrorXML.getAttribute("suppress_notification");
      if (suppress && suppress == 'true')
        return true;
    }
    return false;
  },
  _getCancelErrorText: function() {
    if (this._cancelErrorXML) {
      var cancelMessage = this._cancelErrorXML.getAttribute('cancel_message');
      if (cancelMessage)
        return cancelMessage;
    }
    return "Information could not be downloaded from the server because the transaction was canceled.";
  },
  _getCancelError: function() {
    var xml = this.requestObject.responseXML;
    if (!xml) {
      var responseText = this.requestObject.responseText;
      var errorPattern = /<xml?[^>]*id="transaction_canceled_island"?[^>]*>/;
      var matches = responseText.match(errorPattern);
      if (!matches)
        return false;
      xml = loadXML(matches[0]);
    }
    return xml.documentElement;
  },
  _outOfScope: function() {
    var callerScope = this.getParam("sysparm_scope") ? this.getParam("sysparm_scope") : "global";
    var isAppScope = callerScope != "global";
    return isAppScope && this.requestObject.responseXML.documentElement.getAttribute("error").indexOf("HTTP Processor class not found") == 0;
  },
  _responseReceived: function() {
    lastActivity = new Date();
    CustomEvent.fireTop("request_complete", document);
    this._fireUINotifications();
    this._showSessionNotifications();
    if (this.callbackFunction) {
      if (this.wantAnswer)
        this.callbackFunction(this.getAnswer(), this.callbackArgs);
      else
        this.callbackFunction(this.requestObject, this.callbackArgs);
    }
    if (this.wantRequestObject)
      return this.requestObject;
    return this.requestObject ? this.requestObject.responseXML : null;
  },
  _showLoading: function() {
    if (!this._preventLoadingIcon)
      CustomEvent.fireAll("ajax.loading.start", this);
  },
  _hideLoading: function() {
    if (!this._preventLoadingIcon && window.CustomEvent)
      CustomEvent.fireAll("ajax.loading.end", this);
  },
  _buildReferringURL: function() {
    var path = location.pathname;
    var args = location.search;
    if (path.substring(path.length - 1) == '/') {
      if (args)
        return args;
      return "";
    }
    return path.substring(path.lastIndexOf('/') + 1) + args;
  },
  _fireUINotifications: function() {
    if (!this.requestObject || !this.requestObject.responseXML)
      return;
    var notifications = this.requestObject.responseXML.getElementsByTagName('ui_notifications');
    if (!notifications || notifications.length == 0)
      return;
    var spans = notifications[0].childNodes;
    for (var i = 0; i < spans.length; i++) {
      var span = spans[i];
      if (typeof GlideUI != 'undefined')
        GlideUI.get().fire(new GlideUINotification({
          xml: span
        }));
    }
  },
  _showSessionNotifications: function() {
    if (!this.requestObject || !this.requestObject.responseXML)
      return;
    var notifications = this.requestObject.responseXML.getElementsByTagName('session_notifications');
    if (!notifications || notifications.length == 0)
      return;
    var spans = notifications[0].childNodes;
    for (var i = 0; i < spans.length; i++) {
      var span = spans[i];
      if (typeof GlideUI != 'undefined')
        GlideUI.get().addOutputMessage({
          msg: span.getAttribute("data-text"),
          type: span.getAttribute("data-type")
        });
    }
  },
  setScope: function(scope) {
    if (scope) {
      this.addParam('sysparm_scope', scope);
    }
    return this;
  },
  setErrorCallback: function(callback) {
    this.errorCallbackFunction = callback;
  },
  setWantRequestObject: function(want) {
    this.wantRequestObject = want;
  },
  setWantSessionMessages: function(want) {
    this.addParam('sysparm_want_session_messages', want);
  },
  toString: function() {
    return "GlideAjax";
  }
});
GlideAjax.disableSessionMessages = function() {
  GlideAjax.want_session_messages = false;
};
GlideAjax.enableSessionMessages = function() {
  GlideAjax.want_session_messages = true;
};
GlideAjax.enableSessionMessages();;