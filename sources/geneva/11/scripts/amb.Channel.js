/*! RESOURCE: /scripts/amb.Channel.js */
(function($) {
  amb['Channel'] = Class.create();
  amb.Channel.prototype = {
    initialize: function(cometd, channelName) {
      this._cometd = cometd;
      this._name = channelName;
      this._subscription = null;
      this._listeners = [];
      this._LOGGER = new amb.Logger(this.type);
      this._idCounter = 0;
    },
    newListener: function(serverConnection,
      channelRedirect) {
      return new amb.ChannelListener(this, serverConnection, channelRedirect);
    },
    subscribe: function(listener) {
      if (!listener.getCallback()) {
        this._LOGGER.addErrorMessage('Cannot subscribe to channel: ' + this._name +
          ', callback not provided');
        return;
      }
      if (!this._subscription)
        this._subscription = this._cometd.subscribe(this._name, this._handleResponse.bind(this));
      for (var i = 0; i < this._listeners.length; i++) {
        if (this._listeners[i] === listener) {
          this._LOGGER.debug('Channel listener already in the list');
          return listener.getID();
        }
      }
      var id = this._idCounter++;
      this._listeners.push(listener);
      this._LOGGER.debug('Successfully subscribed to channel: ' + this._name);
      return id;
    },
    _subscribe: function() {
      this._subscription = this._cometd.subscribe(this._name, this._handleResponse.bind(this));
    },
    _handleResponse: function(message) {
      for (var i = 0; i < this._listeners.length; i++)
        this._listeners[i].getCallback()(message);
    },
    _disconnected: function() {
      var status = this._cometd.getStatus();
      return status === 'disconnecting' || status === 'disconnected';
    },
    unsubscribe: function(listener) {
      if (!listener) {
        this._LOGGER.addErrorMessage('Cannot unsubscribe from channel: ' + this._name +
          ', listener argument does not exist');
        return;
      }
      for (var i = 0; i < this._listeners.length; i++) {
        if (this._listeners[i].getID() == listener.getID())
          this._listeners.splice(i, 1);
      }
      if (this._listeners.length < 1 && this._subscription && !this._disconnected()) {
        this._cometd.unsubscribe(this._subscription);
        this._subscription = null;
      }
      this._LOGGER.debug('Successfully unsubscribed from channel: ' + this._name);
    },
    publish: function(message, autoRequest) {
      if (!message.ext)
        message.ext = {};
      if (typeof autoRequest === 'undefined')
        message.ext.auto_request = false;
      else
        message.ext.auto_request = autoRequest === true;
      this._cometd.publish(this._name, message);
    },
    getName: function() {
      return this._name;
    },
    type: 'amb.Channel'
  }
})(jQuery);;