/*! RESOURCE: /scripts/amb.Logger.js */
(function($) {
  amb['Logger'] = Class.create();
  amb.Logger.prototype = {
    initialize: function(callerType) {
      this._callerType = callerType;
      this._debugEnabled = amb['properties']['logLevel'] == 'debug';
    },
    print: function(message) {
      console.log(this._callerType + ' ' + message);
    },
    debug: function(message) {
      if (this._debugEnabled)
        this.print('[DEBUG] ' + message);
    },
    addInfoMessage: function(message) {
      this.print('[INFO] ' + message);
    },
    addErrorMessage: function(message) {
      this.print('[ERROR] ' + message);
    },
    type: 'amb.Logger'
  }
})(jQuery);;