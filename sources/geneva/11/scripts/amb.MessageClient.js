/*! RESOURCE: /scripts/amb.MessageClient.js */
(function($) {
  amb['MessageClient'] = Class.create();
  amb.MessageClient.prototype = {
    initialize: function() {
      this._cometd = new $.Cometd();
      this._cometd.unregisterTransport('websocket');
      this._cometd.unregisterTransport('callback-polling');
      this._serverConnection = new amb.ServerConnection(this._cometd);
      this._channels = {};
      this._LOGGER = new amb.Logger(this.type);
      this._channelRedirect = null;
      this.subscribeToEvent(this.getConnectionEvents().CONNECTION_BROKEN, this._connectionBroken.bind(this));
      this.subscribeToEvent(this.getConnectionEvents().CONNECTION_OPENED, this._connectionOpened.bind(this));
      this._connectionBrokenEvent = false;
    },
    isLoggedIn: function() {
      return this._serverConnection.isLoggedIn();
    },
    loginComplete: function() {
      this._serverConnection.loginComplete();
    },
    connect: function() {
      this._serverConnection.connect();
    },
    abort: function() {
      this._serverConnection.abort();
    },
    disconnect: function() {
      this._serverConnection.disconnect();
    },
    getConnectionEvents: function() {
      return this._serverConnection.getEvents();
    },
    subscribeToEvent: function(event, callback) {
      return this._serverConnection.subscribeToEvent(event, callback);
    },
    unsubscribeFromEvent: function(id) {
      this._serverConnection.unsubscribeFromEvent(id);
    },
    getConnectionState: function() {
      return this._serverConnection.getConnectionState();
    },
    _connectionBroken: function() {
      this._LOGGER.debug("connection broken!");
      this._connectionBrokenEvent = true;
    },
    _connectionOpened: function() {
      if (this._connectionBrokenEvent) {
        this._LOGGER.debug("connection opened!");
        this._connectionBrokenEvent = false;
        var sc = this._serverConnection;
        if (sc._getLastError() !== sc._getErrorMessages().UNKNOWN_CLIENT)
          return;
        sc._setLastError(null);
        this._LOGGER.debug("channel resubscribe!");
        for (var name in this._channels) {
          var channel = this._channels[name];
          channel._subscribe();
        }
      }
    },
    getClientId: function() {
      return this._cometd.getClientId();
    },
    getChannel: function(channelName) {
      this._initChannelRedirect();
      var channel = this._getChannel(channelName);
      return channel.newListener(this._serverConnection, this._channelRedirect);
    },
    _initChannelRedirect: function() {
      if (this._channelRedirect)
        return;
      this._channelRedirect = new amb.ChannelRedirect(this, this._serverConnection, this._getChannel.bind(this));
      this._LOGGER.debug("ChannelRedirect initialized");
    },
    _getChannel: function(channelName) {
      if (channelName in this._channels)
        return this._channels[channelName];
      var channel = new amb.Channel(this._cometd, channelName);
      this._channels[channelName] = channel;
      return channel;
    },
    registerExtension: function(extensionName, extension) {
      this._cometd.registerExtension(extensionName, extension);
    },
    unregisterExtension: function(extensionName) {
      this._cometd.unregisterExtension(extensionName);
    },
    batch: function(block) {
      this._cometd.batch(block);
    },
    type: 'amb.MessageClient'
  }
})(jQuery);;