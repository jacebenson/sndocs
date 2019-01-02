/*! RESOURCE: /scripts/classes/nowapi/GlideAjax.js */
(function(exports, $) {
  'use strict';
  var url = "xmlhttp.do";

  function GlideAjax() {
    this.initialize.apply(this, arguments);
  }
  var objDef = {
    initialize: function(targetProcessor, targetURL) {
      this.processor = null;
      this.params = {};
      this.callbackFn = function() {};
      this.errorCallbackFn = function() {};
      this.wantAnswer = false;
      this.requestObject = null;
      this.setProcessor(targetProcessor);
      url = targetURL || url;
    },
    addParam: function(name, value) {
      this.params[name] = value;
    },
    getParam: function(name) {
      return this.params[name];
    },
    getXML: function(callback) {
      this.wantAnswer = false;
      this.callbackFn = callback;
      this.execute();
    },
    getXMLAnswer: function(callback) {
      this.wantAnswer = true;
      this.callbackFn = callback;
      this.execute();
    },
    getJSON: function(callback) {
      this.getXMLAnswer(function(answer) {
        var answerJSON = JSON.parse(answer);
        callback(answerJSON);
      });
    },
    getAnswer: function() {
      return this.requestObject.responseXML.documentElement.getAttribute('answer');
    },
    setErrorCallback: function(errorCallback) {
      this.errorCallbackFn = errorCallback;
    },
    getURL: function() {
      return url;
    },
    getParams: function() {
      return this.params;
    },
    setProcessor: function(p) {
      this.addParam('sysparm_processor', p);
      if (!p)
        alert('GlideAjax.initalize: must specify a processor');
      this.processor = p;
    },
    getProcessor: function() {
      return this.processor;
    },
    execute: function() {
      $.ajax({
        type: 'POST',
        url: url,
        data: this.params,
        dataType: 'xml',
        success: this.successCallback.bind(this),
        error: this.errorCallback.bind(this)
      });
    },
    successCallback: function(data, status, xhr) {
      this.requestObject = xhr;
      this._fireUINotifications();
      var args = [this.wantAnswer ? this.getAnswer() : xhr];
      this.callbackFn.apply(null, args);
    },
    errorCallback: function(xhr) {
      this.requestObject = xhr;
      this._handleError();
      this._fireUINotifications();
      this.errorCallbackFn(xhr);
    },
    setScope: function(scope) {
      if (scope)
        this.addParam('sysparm_scope', scope);
      return this;
    },
    _outOfScope: function() {
      var callerScope = this.getParam("sysparm_scope") ? this.getParam("sysparm_scope") : "global";
      var isAppScope = callerScope != "global";
      return isAppScope && this.requestObject.responseXML.documentElement.getAttribute("error").indexOf("HTTP Processor class not found") == 0;
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
        CustomEvent.fire('legacy_session_notification', span);
      }
    },
    _handleError: function() {
      var responseCode = this._getResponseCode();
      if (responseCode == 404 && this._outOfScope()) {
        var err_options = {
          text: "Access to Script Include " + this.processor + " blocked from scope: " + (this.getParam("sysparm_scope") ? this.getParam("sysparm_scope") : "global"),
          notification_type: "system",
          attributes: {
            type: "error"
          }
        };
        CustomEvent.fire('session_notification', err_options);
      }
    },
    _getResponseCode: function() {
      return this.requestObject.status;
    },
  };
  GlideAjax.prototype = objDef;
  exports.GlideAjax = window.GlideAjax || GlideAjax;
})(nowapi, jQuery);;