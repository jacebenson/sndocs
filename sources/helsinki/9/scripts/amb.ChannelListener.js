/*! RESOURCE: /scripts/amb.ChannelListener.js */
amb.ChannelListener = function ChannelListener(channel, serverConnection,
  channelRedirect) {
  var id;
  var subscriberCallback;
  var LOGGER = new amb.Logger('amb.ChannelListener');
  var channelRedirectId = null;
  var connectOpenedEventId;
  var currentChannel = channel;
  return {
    getCallback: function() {
      return subscriberCallback;
    },
    getID: function() {
      return id;
    },
    subscribe: function(callback) {
      subscriberCallback = callback;
      if (channelRedirect)
        channelRedirectId = channelRedirect.subscribeToEvent(
          channelRedirect.getEvents().CHANNEL_REDIRECT, this._switchToChannel.bind(this));
      connectOpenedEventId = serverConnection.subscribeToEvent(serverConnection.getEvents().CONNECTION_OPENED,
        this._subscribeWhenReady.bind(this));
      LOGGER.debug("Subscribed from channel: " + currentChannel.getName());
      return this;
    },
    resubscribe: function() {
      return this.subscribe(subscriberCallback);
    },
    _switchToChannel: function(fromChannel, toChannel) {
      if (!fromChannel || !toChannel)
        return;
      if (fromChannel.getName() != currentChannel.getName())
        return;
      this.unsubscribe();
      currentChannel = toChannel;
      this.subscribe(subscriberCallback);
    },
    _subscribeWhenReady: function() {
      LOGGER.debug("Subscribing to '" + currentChannel.getName() + "'...");
      id = currentChannel.subscribe(this);
    },
    unsubscribe: function() {
      channelRedirect.unsubscribeToEvent(channelRedirectId);
      currentChannel.unsubscribe(this);
      serverConnection.unsubscribeFromEvent(connectOpenedEventId);
      LOGGER.debug("Unsubscribed from channel: " + currentChannel.getName());
      return this;
    },
    publish: function(message) {
      currentChannel.publish(message);
    },
    getName: function() {
      return currentChannel.getName();
    }
  }
};;