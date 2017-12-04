/*! RESOURCE: /scripts/amb.ChannelListener.js */
(function($) {
  amb['ChannelListener'] = Class.create();
  amb.ChannelListener.prototype = {
    initialize: function(channel, serverConnection,
      channelRedirect) {
      this._channel = channel;
      this._serverConnection = serverConnection;
      this._id;
      this._callback;
      this._LOGGER = new amb.Logger(this.type);
      this._channelRedirect = channelRedirect;
      this._channelRedirectId = null;
    },
    getCallback: function() {
      return this._callback;
    },
    getID: function() {
      return this._id;
    },
    subscribe: function(callback) {
      this._callback = callback;
      if (this._channelRedirect)
        this._channelRedirectId = this._channelRedirect.subscribeToEvent(
          this._channelRedirect.getEvents().CHANNEL_REDIRECT, this._switchToChannel.bind(this));
      this._serverConnection.subscribeToEvent(this._serverConnection.getEvents().CONNECTION_OPENED,
        this._subscribeWhenReady.bind(this));
      this._LOGGER.debug("Subscribed to channel: " + this._channel.getName());
      return this;
    },
    _switchToChannel: function(fromChannel, toChannel) {
      if (!fromChannel || !toChannel)
        return;
      if (fromChannel.getName() != this._channel.getName())
        return;
      this.unsubscribe();
      this._channel = toChannel;
      this.subscribe(this._callback);
    },
    _subscribeWhenReady: function() {
      this._LOGGER.debug("Subscribing to '" + this._channel.getName() + "'...");
      this._id = this._channel.subscribe(this);
    },
    unsubscribe: function() {
      this._channelRedirect.unsubscribeToEvent(this._channelRedirectId);
      this._channel.unsubscribe(this);
      this._LOGGER.debug("Unsubscribed from channel: " + this._channel.getName());
      return this;
    },
    publish: function(message, autoRequest) {
      this._channel.publish(message, autoRequest);
    },
    getName: function() {
      return this._channel.getName();
    },
    type: 'amb.ChannelListener'
  }
})(jQuery);;