/*! RESOURCE: /scripts/amb.Channel.js */
amb.Channel = function Channel(cometd, channelName, initialized) {
  var subscription = null;
  var listeners = [];
  var LOGGER = new amb.Logger('amb.Channel');
  var idCounter = 0;
  var _initialized = initialized;

  function _disconnected() {
    var status = cometd.getStatus();
    return status === 'disconnecting' || status === 'disconnected';
  }
  return {
    newListener: function(serverConnection,
      channelRedirect) {
      return new amb.ChannelListener(this, serverConnection, channelRedirect);
    },
    subscribe: function(listener) {
      if (_disconnected()) {
        LOGGER.addErrorMessage('Illegal state: already disconnected');
        return;
      }
      if (!listener.getCallback()) {
        LOGGER.addErrorMessage('Cannot subscribe to channel: ' + channelName +
          ', callback not provided');
        return;
      }
      if (!subscription && _initialized) {
        try {
          this.subscribeToCometD();
        } catch (e) {
          LOGGER.addErrorMessage(e);
          return;
        }
      }
      for (var i = 0; i < listeners.length; i++) {
        if (listeners[i] === listener) {
          LOGGER.debug('Channel listener already in the list');
          return listener.getID();
        }
      }
      var id = idCounter++;
      listeners.push(listener);
      return id;
    },
    resubscribe: function() {
      subscription = null;
      for (var i = 0; i < listeners.length; i++)
        listeners[i].resubscribe();
    },
    subscribeOnInitCompletion: function(redirect) {
      _initialized = true;
      subscription = null;
      for (var i = 0; i < listeners.length; i++) {
        listeners[i].subscribe();
        LOGGER.debug('Successfully subscribed to channel: ' + channelName);
      }
    },
    _handleResponse: function(message) {
      for (var i = 0; i < listeners.length; i++)
        listeners[i].getCallback()(message);
    },
    unsubscribe: function(listener) {
      if (!listener) {
        LOGGER.addErrorMessage('Cannot unsubscribe from channel: ' + channelName +
          ', listener argument does not exist');
        return;
      }
      for (var i = 0; i < listeners.length; i++) {
        if (listeners[i].getID() == listener.getID())
          listeners.splice(i, 1);
      }
      if (listeners.length < 1 && subscription && !_disconnected())
        this.unsubscribeFromCometD();
    },
    publish: function(message) {
      cometd.publish(channelName, message);
    },
    subscribeToCometD: function() {
      subscription = cometd.subscribe(channelName, this._handleResponse.bind(this));
      LOGGER.debug('Successfully subscribed to channel: ' + channelName);
    },
    unsubscribeFromCometD: function() {
      cometd.unsubscribe(subscription);
      subscription = null;
      LOGGER.debug('Successfully unsubscribed from channel: ' + channelName);
    },
    resubscribeToCometD: function() {
      this.subscribeToCometD();
    },
    getName: function() {
      return channelName;
    }
  }
};;